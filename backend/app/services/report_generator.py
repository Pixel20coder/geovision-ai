"""
GeoVision AI — Intelligence Report Generator
===============================================
Generates structured, realistic intelligence dossiers.

In production, this would pull from a real database of detection results.
Currently uses intelligent parameterization to generate convincing reports
based on optional input or sensible defaults from operational context.
"""

import random
import logging
from datetime import datetime, timezone

from app.models.schemas import IntelligenceReport
from app.utils.helpers import generate_request_id

logger = logging.getLogger("geovision.report")

# ──────────────────────────────────────────────
# REPORT DATA GENERATORS
# ──────────────────────────────────────────────

_PRIORITY_ACTIONS = [
    "Immediate field verification for Parcel A-17 — unauthorized construction detected within 50m of active track.",
    "Clear drainage line D-1 within 14 days. Monsoon flood risk elevated.",
    "Initiate enforcement proceedings at Encroachment Zone S-7 (22,000 sq.m commercial violation).",
    "Deploy Railway Protection Force to eastern corridor boundary breach.",
    "Schedule reforestation program for northern green belt (106 hectares lost since 2020).",
    "Install permanent GPS boundary markers along railway land parcels.",
    "Conduct structural integrity assessment of Level Crossing LC-42 approach road.",
    "Review drainage capacity for monsoon readiness — current capacity at 65%.",
    "Escalate Zone S-7 encroachment to Railway Board for legal proceedings.",
    "Initiate compensatory afforestation per Green Tribunal directive (150 hectares).",
]

_KEY_FINDINGS = [
    "3 confirmed encroachment structures on designated railway land, total area 30,500 sq.m.",
    "Green cover declined 31.2% since 2020 baseline — 106 hectares lost across monitored area.",
    "Urban heat island effect increased +2.8°C in high-density construction zones.",
    "Drainage capacity reduced by 35% near Zone D-1 due to sediment and debris accumulation.",
    "15 new unauthorized structures detected in latest scan cycle (May 2026).",
    "Railway Parcel A-17 boundary violated by new commercial construction within buffer zone.",
    "Storm water runoff increased 22% due to expansion of impermeable surface area.",
    "Eastern corridor building density reached 847 structures/km² — highest on record.",
    "Biodiversity index dropped from 6.8 to 4.2 across the monitored railway green belt.",
    "Railway Act 1989 compliance at 72% — below 95% target threshold.",
    "2 critical drainage blockages may cause flooding during upcoming monsoon season.",
    "Vehicle and pedestrian congestion at station approach area increasing safety risk.",
]


def generate_intelligence_report(
    zone: str | None = None,
    scan_period: str | None = None,
) -> IntelligenceReport:
    """
    Generate a comprehensive intelligence report.

    Args:
        zone: Optional zone name override.
        scan_period: Optional scan period string.

    Returns:
        IntelligenceReport with realistic operational data.
    """
    report_id = generate_request_id()
    now = datetime.now(timezone.utc)

    # Use defaults if not provided
    zone = zone or "New Delhi Railway Zone — Central District"
    scan_period = scan_period or f"Jan 2026 – {now.strftime('%b %Y')}"

    # Generate realistic metric values with slight randomization
    encroachments = random.randint(2, 6)
    veg_loss = round(random.uniform(8.0, 18.0), 1)
    new_constructions = random.randint(8, 22)
    railway_risk = random.randint(65, 95)
    drainage_risk = random.randint(40, 80)
    env_index = round(random.uniform(55.0, 78.0), 1)
    urban_density = round(random.uniform(60.0, 75.0), 1)

    # Calculate overall risk score as weighted average
    overall_risk = int(
        railway_risk * 0.4
        + drainage_risk * 0.25
        + (100 - env_index) * 0.2
        + min(encroachments * 10, 50) * 0.15
    )
    overall_risk = min(overall_risk, 100)

    # Determine risk level
    if overall_risk >= 80:
        risk_level = "CRITICAL"
    elif overall_risk >= 60:
        risk_level = "HIGH"
    elif overall_risk >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # Select contextual actions and findings
    num_actions = random.randint(4, 6)
    num_findings = random.randint(5, 8)
    actions = random.sample(_PRIORITY_ACTIONS, min(num_actions, len(_PRIORITY_ACTIONS)))
    findings = random.sample(_KEY_FINDINGS, min(num_findings, len(_KEY_FINDINGS)))

    # Compliance status
    compliance_pct = random.randint(68, 85)
    compliance = f"Railway Act 1989 compliance: {compliance_pct}% (target: 95%). {3 if compliance_pct < 80 else 1} zones pending environmental clearance review."

    # Generate executive summary
    summary = (
        f"Intelligence assessment for {zone} covering {scan_period}. "
        f"Analysis of latest satellite imagery reveals {encroachments} confirmed encroachment "
        f"zones with {new_constructions} new unauthorized structures detected. "
        f"Vegetation loss stands at {veg_loss}%, with the eastern corridor showing the highest "
        f"rate of urban expansion. Railway infrastructure risk is assessed at {risk_level} "
        f"(score: {overall_risk}/100). Priority enforcement action recommended for "
        f"{encroachments} encroachment sites before monsoon onset. "
        f"Drainage system operating at reduced capacity — immediate clearance required."
    )

    logger.info(f"[{report_id}] Generated intelligence report — Risk: {risk_level} ({overall_risk})")

    return IntelligenceReport(
        report_id=report_id,
        generated_at=now.isoformat(),
        zone=zone,
        scan_period=scan_period,
        risk_level=risk_level,
        overall_risk_score=overall_risk,
        encroachments_detected=encroachments,
        vegetation_loss_pct=veg_loss,
        new_constructions=new_constructions,
        railway_risk_score=railway_risk,
        drainage_risk_score=drainage_risk,
        environmental_index=env_index,
        urban_density_pct=urban_density,
        priority_actions=actions,
        key_findings=findings,
        summary=summary,
        compliance_status=compliance,
    )
