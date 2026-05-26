"""Computer vision risk agent endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Query

from app.services.computer_vision_agent import computer_vision_agent

router = APIRouter(prefix="/computer-vision/agent", tags=["computer-vision-agent"])


@router.get("/risks")
def get_computer_vision_risks(
    active_only: bool = Query(default=True, description="Return only active risks"),
    limit: int = Query(default=200, ge=1, le=1000, description="Max risks to return"),
) -> dict[str, object]:
    computer_vision_agent.scan_once()
    return {
        "risks": computer_vision_agent.list_risks(active_only=active_only, limit=limit),
        "summary": computer_vision_agent.summary(),
    }


@router.post("/scan")
def trigger_computer_vision_scan() -> dict[str, object]:
    active = computer_vision_agent.scan_once()
    return {
        "active_risks": active,
        "summary": computer_vision_agent.summary(),
    }


@router.get("/summary")
def get_computer_vision_summary() -> dict[str, object]:
    computer_vision_agent.scan_once()
    return computer_vision_agent.summary()
