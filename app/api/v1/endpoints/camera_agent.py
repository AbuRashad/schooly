"""Camera monitoring agent endpoints.

Exposes alerting APIs backed by CameraAlertAgentService.
"""
from __future__ import annotations

from fastapi import APIRouter, Query

from app.services.camera_alert_agent import camera_alert_agent

router = APIRouter(prefix="/cameras/agent", tags=["camera-agent"])


@router.get("/alerts")
def get_camera_agent_alerts(
    active_only: bool = Query(default=True, description="Return only active alerts"),
    limit: int = Query(default=200, ge=1, le=1000, description="Max number of alerts to return"),
) -> dict[str, object]:
    """Return camera monitoring alerts.

    Triggers a fresh scan before returning results so dashboard consumers always
    receive up-to-date alert state.
    """
    camera_alert_agent.scan_once()
    return {
        "alerts": camera_alert_agent.list_alerts(active_only=active_only, limit=limit),
        "summary": camera_alert_agent.summary(),
    }


@router.post("/scan")
def trigger_camera_agent_scan() -> dict[str, object]:
    """Manually trigger a monitoring scan and return active alerts."""
    active_alerts = camera_alert_agent.scan_once()
    return {
        "active_alerts": active_alerts,
        "summary": camera_alert_agent.summary(),
    }


@router.get("/summary")
def get_camera_agent_summary() -> dict[str, object]:
    """Return a compact camera alert summary."""
    camera_alert_agent.scan_once()
    return camera_alert_agent.summary()
