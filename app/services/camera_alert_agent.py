"""Camera Monitoring Agent (Unit-aligned).

Continuously evaluates live camera stream health from Unit 01 ingestion state
and emits actionable alerts for operators.

Alert logic is derived from existing runtime behavior:
- OFFLINE stream status -> critical alert
- DEGRADED status or high drop rate -> warning alert
- Stale frame timestamps -> warning alert
- Active stream errors -> warning alert

All state is in-memory and thread-safe.
"""
from __future__ import annotations

import threading
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.core.runtime_settings import get_runtime_settings
from app.services.camera_ingestion import ingestion_service
from app.units.unit_01.module import StreamStatus


@dataclass
class CameraAgentAlert:
    alert_id: str
    camera_id: str
    zone_id: str
    zone_label: str
    severity: str
    reason: str
    title: str
    message: str
    status: str
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    def to_dict(self) -> dict[str, object]:
        return {
            "alert_id": self.alert_id,
            "camera_id": self.camera_id,
            "zone_id": self.zone_id,
            "zone_label": self.zone_label,
            "severity": self.severity,
            "reason": self.reason,
            "title": self.title,
            "message": self.message,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
        }


class CameraAlertAgentService:
    """Evaluates camera health and manages active/resolved alerts."""

    def __init__(self) -> None:
        self._alerts: list[CameraAgentAlert] = []
        self._active_by_key: dict[str, CameraAgentAlert] = {}
        self._lock = threading.Lock()

    def scan_once(self) -> list[dict[str, object]]:
        """Run one monitoring scan and return active alerts."""
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        stream_findings = self._collect_findings(now)

        with self._lock:
            current_keys = set(stream_findings.keys())

            for key, finding in stream_findings.items():
                existing = self._active_by_key.get(key)
                if existing is None:
                    created = CameraAgentAlert(
                        alert_id=f"CAM-ALERT-{uuid.uuid4().hex[:10].upper()}",
                        camera_id=finding["camera_id"],
                        zone_id=finding["zone_id"],
                        zone_label=finding["zone_label"],
                        severity=finding["severity"],
                        reason=finding["reason"],
                        title=finding["title"],
                        message=finding["message"],
                        status="active",
                        created_at=now,
                        updated_at=now,
                    )
                    self._alerts.append(created)
                    self._active_by_key[key] = created
                else:
                    # Keep a single active alert per (camera, reason); refresh details.
                    existing.severity = finding["severity"]
                    existing.title = finding["title"]
                    existing.message = finding["message"]
                    existing.updated_at = now

            stale_keys = [key for key in self._active_by_key if key not in current_keys]
            for key in stale_keys:
                alert = self._active_by_key.pop(key)
                alert.status = "resolved"
                alert.updated_at = now
                alert.resolved_at = now

            return [alert.to_dict() for alert in self._active_by_key.values()]

    def list_alerts(self, *, active_only: bool = True, limit: int = 200) -> list[dict[str, object]]:
        with self._lock:
            rows = [a for a in self._alerts if (a.status == "active" if active_only else True)]
            rows = sorted(rows, key=lambda a: a.updated_at, reverse=True)
            return [a.to_dict() for a in rows[: max(1, min(limit, 1000))]]

    def summary(self) -> dict[str, object]:
        with self._lock:
            active = [a for a in self._alerts if a.status == "active"]
            critical = sum(1 for a in active if a.severity == "critical")
            warning = sum(1 for a in active if a.severity == "warning")

        streams = ingestion_service.capture_unit.all_streams()
        return {
            "computed_at": datetime.now(timezone.utc).replace(tzinfo=None).isoformat(),
            "total_streams": len(streams),
            "active_alerts": len(active),
            "critical_alerts": critical,
            "warning_alerts": warning,
        }

    def _collect_findings(self, now: datetime) -> dict[str, dict[str, str]]:
        findings: dict[str, dict[str, str]] = {}
        settings = get_runtime_settings()

        # Staleness threshold respects the reconnect setting and has a floor.
        stale_seconds = max(15.0, settings.camera_reconnect_seconds * 3.0)
        stale_delta = timedelta(seconds=stale_seconds)

        for stream in ingestion_service.capture_unit.all_streams():
            source = next((s for s in ingestion_service.list_sources() if s.camera_id == stream.camera_id), None)
            zone_label = source.label if source else stream.zone_label
            zone_id = source.zone_id if source else stream.location_id

            base = {
                "camera_id": stream.camera_id,
                "zone_id": zone_id,
                "zone_label": zone_label,
            }

            if stream.status == StreamStatus.OFFLINE:
                key = self._k(stream.camera_id, "offline")
                findings[key] = {
                    **base,
                    "severity": "critical",
                    "reason": "camera_offline",
                    "title": "Camera Offline",
                    "message": (
                        f"Camera {stream.camera_id} in {zone_label} is offline. "
                        "Check power, network, and stream source."
                    ),
                }

            if stream.status == StreamStatus.DEGRADED or stream.drop_rate >= 0.30:
                key = self._k(stream.camera_id, "drop_rate")
                findings[key] = {
                    **base,
                    "severity": "warning",
                    "reason": "high_drop_rate",
                    "title": "Degraded Camera Stream",
                    "message": (
                        f"Camera {stream.camera_id} has elevated frame loss "
                        f"({stream.drop_rate * 100:.1f}%)."
                    ),
                }

            if stream.last_frame_at is not None and now - stream.last_frame_at > stale_delta:
                key = self._k(stream.camera_id, "stale")
                findings[key] = {
                    **base,
                    "severity": "warning",
                    "reason": "stale_feed",
                    "title": "Stale Camera Feed",
                    "message": (
                        f"Camera {stream.camera_id} has not produced a fresh frame in "
                        f"> {int(stale_seconds)} seconds."
                    ),
                }

            if stream.last_error:
                key = self._k(stream.camera_id, "error")
                findings[key] = {
                    **base,
                    "severity": "warning",
                    "reason": "stream_error",
                    "title": "Camera Stream Error",
                    "message": (
                        f"Camera {stream.camera_id} reported an error: {stream.last_error}"
                    ),
                }

        return findings

    @staticmethod
    def _k(camera_id: str, reason: str) -> str:
        return f"{camera_id}::{reason}"


camera_alert_agent = CameraAlertAgentService()
