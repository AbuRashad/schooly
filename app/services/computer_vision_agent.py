"""Computer Vision Risk Agent.

Analyzes live camera frames to detect real-time behavioral and crowd risks.
Built on existing units:
- Unit 04: HazardDetectionUnit
- Unit 06: CollectiveBehavioralCoherence

The service keeps in-memory, thread-safe alert state similar to other agents.
"""
from __future__ import annotations

import threading
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

import cv2
import numpy as np

from app.services.camera_ingestion import ingestion_service
from app.units.unit_04.module import HazardDetectionUnit
from app.units.unit_06.module import CollectiveBehavioralCoherence


@dataclass
class _CameraState:
    coherence: CollectiveBehavioralCoherence
    hazard: HazardDetectionUnit
    prev_gray: np.ndarray | None = None
    prev_flow_magnitude: float = 0.0


@dataclass
class ComputerVisionRiskAlert:
    risk_id: str
    camera_id: str
    zone_id: str
    zone_label: str
    severity: str
    reason: str
    risk_score: float
    title: str
    message: str
    status: str
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    def to_dict(self) -> dict[str, object]:
        return {
            "risk_id": self.risk_id,
            "camera_id": self.camera_id,
            "zone_id": self.zone_id,
            "zone_label": self.zone_label,
            "severity": self.severity,
            "reason": self.reason,
            "risk_score": round(float(self.risk_score), 4),
            "title": self.title,
            "message": self.message,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
        }


class ComputerVisionAgentService:
    """Evaluates live video feeds and emits risk alerts."""

    def __init__(self) -> None:
        self._state_by_camera: dict[str, _CameraState] = {}
        self._alerts: list[ComputerVisionRiskAlert] = []
        self._active_by_key: dict[str, ComputerVisionRiskAlert] = {}
        self._lock = threading.Lock()

    def scan_once(self) -> list[dict[str, object]]:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        findings = self._collect_findings(now)

        with self._lock:
            current_keys = set(findings.keys())

            for key, finding in findings.items():
                existing = self._active_by_key.get(key)
                if existing is None:
                    alert = ComputerVisionRiskAlert(
                        risk_id=f"CV-RISK-{uuid.uuid4().hex[:10].upper()}",
                        camera_id=finding["camera_id"],
                        zone_id=finding["zone_id"],
                        zone_label=finding["zone_label"],
                        severity=finding["severity"],
                        reason=finding["reason"],
                        risk_score=float(finding["risk_score"]),
                        title=finding["title"],
                        message=finding["message"],
                        status="active",
                        created_at=now,
                        updated_at=now,
                    )
                    self._alerts.append(alert)
                    self._active_by_key[key] = alert
                else:
                    existing.severity = finding["severity"]
                    existing.risk_score = float(finding["risk_score"])
                    existing.title = finding["title"]
                    existing.message = finding["message"]
                    existing.updated_at = now

            stale_keys = [key for key in self._active_by_key if key not in current_keys]
            for key in stale_keys:
                alert = self._active_by_key.pop(key)
                alert.status = "resolved"
                alert.updated_at = now
                alert.resolved_at = now

            return [a.to_dict() for a in self._active_by_key.values()]

    def list_risks(self, *, active_only: bool = True, limit: int = 200) -> list[dict[str, object]]:
        with self._lock:
            rows = [a for a in self._alerts if (a.status == "active" if active_only else True)]
            rows = sorted(rows, key=lambda a: a.updated_at, reverse=True)
            safe_limit = max(1, min(limit, 1000))
            return [a.to_dict() for a in rows[:safe_limit]]

    def summary(self) -> dict[str, object]:
        with self._lock:
            active = [a for a in self._alerts if a.status == "active"]
            critical = sum(1 for a in active if a.severity == "critical")
            warning = sum(1 for a in active if a.severity == "warning")
            avg_risk = float(np.mean([a.risk_score for a in active])) if active else 0.0

        streams = ingestion_service.capture_unit.all_streams()
        return {
            "computed_at": datetime.now(timezone.utc).replace(tzinfo=None).isoformat(),
            "analyzed_cameras": len(streams),
            "active_risks": len(active),
            "critical_risks": critical,
            "warning_risks": warning,
            "avg_risk_score": round(avg_risk, 4),
        }

    def _collect_findings(self, now: datetime) -> dict[str, dict[str, object]]:
        findings: dict[str, dict[str, object]] = {}

        for source in ingestion_service.list_sources():
            worker = ingestion_service.get_worker(source.camera_id)
            if worker is None:
                continue

            jpeg = worker.get_latest_jpeg()
            if jpeg is None:
                continue

            frame = self._decode_jpeg(jpeg)
            if frame is None:
                continue

            state = self._state_by_camera.setdefault(
                source.camera_id,
                _CameraState(
                    coherence=CollectiveBehavioralCoherence(method="farneback"),
                    hazard=HazardDetectionUnit(),
                ),
            )

            metrics = self._analyze_frame(
                frame=frame,
                state=state,
                zone_id=source.zone_id,
                captured_at=now,
            )

            base = {
                "camera_id": source.camera_id,
                "zone_id": source.zone_id,
                "zone_label": source.label,
            }

            if metrics["coherence_rupture"]:
                divergence = float(metrics["divergence"])
                entropy = float(metrics["entropy"])
                score = max(divergence, entropy)
                findings[self._k(source.camera_id, "coherence")] = {
                    **base,
                    "severity": "critical" if score >= 0.85 else "warning",
                    "reason": "coherence_rupture",
                    "risk_score": score,
                    "title": "Behavioral Coherence Rupture",
                    "message": (
                        f"Camera {source.camera_id} detected chaotic collective motion in {source.label}."
                    ),
                }

            hazard = metrics["hazard"]
            if hazard is not None:
                confidence = float(hazard["confidence"])
                risk_level = str(hazard["risk_level"])
                findings[self._k(source.camera_id, f"hazard:{hazard['hazard_type']}")] = {
                    **base,
                    "severity": "critical" if risk_level in {"high", "critical"} else "warning",
                    "reason": f"hazard_{hazard['hazard_type']}",
                    "risk_score": confidence,
                    "title": f"Hazard Detected: {hazard['hazard_type']}",
                    "message": str(hazard["description"]),
                }

            crowd_density = float(metrics["crowd_density"])
            if crowd_density >= 0.82:
                findings[self._k(source.camera_id, "density")] = {
                    **base,
                    "severity": "critical" if crowd_density >= 0.9 else "warning",
                    "reason": "crowd_density_risk",
                    "risk_score": crowd_density,
                    "title": "High Crowd Density Risk",
                    "message": (
                        f"Camera {source.camera_id} density estimate reached {crowd_density * 100:.1f}% in {source.label}."
                    ),
                }

        return findings

    def _analyze_frame(
        self,
        *,
        frame: np.ndarray,
        state: _CameraState,
        zone_id: str,
        captured_at: datetime,
    ) -> dict[str, object]:
        coherence_result = state.coherence.process_frame(frame)

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        flow_magnitude = 0.0
        movement_entropy = float(coherence_result.get("entropy", 0.0))
        crowd_density = 0.0

        if state.prev_gray is not None:
            flow = cv2.calcOpticalFlowFarneback(
                state.prev_gray,
                gray,
                None,
                pyr_scale=0.5,
                levels=3,
                winsize=15,
                iterations=3,
                poly_n=5,
                poly_sigma=1.2,
                flags=0,
            )
            magnitude = np.linalg.norm(flow, axis=2)
            flow_magnitude = float(np.mean(magnitude))
            crowd_density = float(np.clip(np.mean((magnitude > 0.8).astype(np.float32)), 0.0, 1.0))

        state.prev_gray = gray

        hazard_event = state.hazard.analyze_frame(
            zone_id=zone_id,
            flow_magnitude=flow_magnitude,
            prev_flow_magnitude=state.prev_flow_magnitude,
            crowd_density=crowd_density,
            movement_entropy=movement_entropy,
            detected_at=captured_at,
        )
        state.prev_flow_magnitude = flow_magnitude

        hazard_dict = None
        if hazard_event is not None:
            hazard_dict = {
                "hazard_type": hazard_event.hazard_type.value,
                "confidence": float(hazard_event.confidence),
                "risk_level": hazard_event.risk_level,
                "description": hazard_event.description,
            }

        return {
            "coherence_rupture": bool(coherence_result.get("coherence_rupture", False)),
            "divergence": float(coherence_result.get("divergence", 0.0)),
            "entropy": float(coherence_result.get("entropy", 0.0)),
            "crowd_density": crowd_density,
            "hazard": hazard_dict,
        }

    @staticmethod
    def _decode_jpeg(payload: bytes) -> np.ndarray | None:
        arr = np.frombuffer(payload, dtype=np.uint8)
        if arr.size == 0:
            return None
        return cv2.imdecode(arr, cv2.IMREAD_COLOR)

    @staticmethod
    def _k(camera_id: str, reason: str) -> str:
        return f"{camera_id}::{reason}"


computer_vision_agent = ComputerVisionAgentService()
