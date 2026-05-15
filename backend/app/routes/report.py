"""
GeoVision AI — Report Generation Route
========================================
POST /generate-report — Generate AI intelligence dossier JSON
"""

import logging
from typing import Optional
from fastapi import APIRouter, Query

from app.models.schemas import IntelligenceReport
from app.services.report_generator import generate_intelligence_report

logger = logging.getLogger("geovision.routes.report")
router = APIRouter()


@router.post(
    "/generate-report",
    response_model=IntelligenceReport,
    summary="Generate an AI intelligence report",
    description=(
        "Generate a structured intelligence dossier with risk assessment, "
        "encroachment analysis, environmental metrics, priority actions, "
        "and compliance status. Optionally specify zone and scan period."
    ),
)
async def generate_report(
    zone: Optional[str] = Query(
        None,
        description="Target zone for the report (e.g., 'New Delhi Railway Zone — Central District')"
    ),
    scan_period: Optional[str] = Query(
        None,
        description="Scan period (e.g., 'Jan 2026 – May 2026')"
    ),
):
    """Generate a governance-ready intelligence report."""

    logger.info(f"Report generation requested — zone: {zone or 'default'}")

    report = generate_intelligence_report(zone=zone, scan_period=scan_period)

    logger.info(
        f"[{report.report_id}] Report generated — "
        f"Risk: {report.risk_level} ({report.overall_risk_score})"
    )

    return report
