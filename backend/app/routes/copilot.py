"""
GeoVision AI — Copilot Route
===============================
POST /copilot/query — AI-powered geospatial intelligence assistant
"""

import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.minimax import answer_query, analyze_scan_results, is_minimax_available
from app.utils.helpers import generate_request_id, get_timestamp_iso

logger = logging.getLogger("geovision.routes.copilot")
router = APIRouter(prefix="/copilot")


class CopilotQueryRequest(BaseModel):
    """Copilot query input."""
    message: str = Field(..., description="User's question or directive")
    context: Optional[str] = Field(None, description="Optional JSON context (scan results, alerts, etc.)")


class CopilotQueryResponse(BaseModel):
    """Copilot query output."""
    request_id: str
    timestamp: str
    engine: str = Field(..., description="AI engine used (minimax-2.7 or local-intelligence)")
    response: str
    suggestions: list[str] = Field(default_factory=list, description="Follow-up suggestion prompts")


class ScanAnalysisRequest(BaseModel):
    """Scan analysis input."""
    scan_data: dict = Field(..., description="Detection results from YOLO/OpenCV pipeline")


# Contextual follow-up suggestions based on query content
SUGGESTION_MAP = {
    "risk": ["Show encroachment details", "Generate risk report", "Compare with previous scan"],
    "change": ["Show vegetation loss", "Identify new constructions", "Generate change report"],
    "green": ["Show deforestation timeline", "Calculate environmental index", "Recommend reforestation zones"],
    "water": ["Assess flood risk", "Show drainage blockages", "Monsoon readiness check"],
    "encroach": ["Show railway boundary violations", "Generate enforcement report", "Risk score breakdown"],
    "report": ["Export as PDF", "Include environmental metrics", "Add compliance section"],
}


def _get_suggestions(message: str) -> list[str]:
    """Generate contextual follow-up suggestions based on query content."""
    lower = message.lower()
    for keyword, suggestions in SUGGESTION_MAP.items():
        if keyword in lower:
            return suggestions
    return [
        "Summarize active threats",
        "Show environmental metrics",
        "Generate intelligence report",
    ]


@router.post(
    "/query",
    response_model=CopilotQueryResponse,
    summary="Query the AI Copilot",
    description=(
        "Send a natural language query to the GeoVision AI Copilot. "
        "The copilot uses Minimax 2.7 (when available) or a local intelligence "
        "engine to provide geospatial analysis, risk assessments, and operational recommendations."
    ),
)
async def copilot_query(request: CopilotQueryRequest):
    """Process a copilot intelligence query."""

    request_id = generate_request_id()
    logger.info(f"[{request_id}] Copilot query: {request.message[:80]}...")

    try:
        response = await answer_query(
            message=request.message,
            context=request.context or "",
        )

        engine = "minimax-2.7" if is_minimax_available() else "local-intelligence"
        suggestions = _get_suggestions(request.message)

        logger.info(f"[{request_id}] Response generated via {engine} ({len(response)} chars)")

        return CopilotQueryResponse(
            request_id=request_id,
            timestamp=get_timestamp_iso(),
            engine=engine,
            response=response,
            suggestions=suggestions,
        )

    except Exception as e:
        logger.error(f"[{request_id}] Copilot error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Copilot error: {str(e)}")


@router.post(
    "/analyze",
    response_model=CopilotQueryResponse,
    summary="Analyze scan results with AI",
    description="Send YOLO/OpenCV scan results for AI-powered analysis and intelligence generation.",
)
async def copilot_analyze(request: ScanAnalysisRequest):
    """Generate AI analysis of detection pipeline results."""

    request_id = generate_request_id()
    logger.info(f"[{request_id}] Scan analysis requested")

    try:
        response = await analyze_scan_results(request.scan_data)
        engine = "minimax-2.7" if is_minimax_available() else "local-intelligence"

        return CopilotQueryResponse(
            request_id=request_id,
            timestamp=get_timestamp_iso(),
            engine=engine,
            response=response,
            suggestions=["Generate full report", "Show risk zones", "Export analysis"],
        )

    except Exception as e:
        logger.error(f"[{request_id}] Analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")
