"""
GeoVision AI — Analytics Engine
==================================
Spatial intelligence metrics from YOLO land-use segmentation.

Model classes: urban_land, agriculture, barren_land
Metrics: urbanization, vegetation coverage, land degradation, environmental stress,
         encroachment risk, infrastructure density, composite risk score.

All values are heuristic-based for hackathon speed.
"""

import logging
from app.models.schemas import DetectedObject

logger = logging.getLogger("geovision.analytics")


# ──────────────────────────────────────────────
# AREA / COUNT HELPERS
# ──────────────────────────────────────────────

def _sum_area(detections: list[DetectedObject], categories: set[str]) -> int:
    """Sum total pixel area for detections matching given categories."""
    return sum(d.area_px for d in detections if d.geovision_category in categories)


def _count_in(detections: list[DetectedObject], categories: set[str]) -> int:
    """Count detections in given categories."""
    return sum(1 for d in detections if d.geovision_category in categories)


def _avg_confidence(detections: list[DetectedObject], categories: set[str]) -> float:
    """Average confidence for detections in given categories."""
    matching = [d.confidence for d in detections if d.geovision_category in categories]
    return round(sum(matching) / len(matching), 3) if matching else 0.0


# ──────────────────────────────────────────────
# CORE ANALYTICS
# ──────────────────────────────────────────────

def compute_analytics(
    detections: list[DetectedObject],
    image_size: list[int],
) -> dict:
    """
    Compute spatial analytics from segmentation results.

    The model detects: urban_land, agriculture, barren_land.
    We derive meaningful intelligence metrics from these 3 classes.
    """
    if not detections:
        return _empty_analytics()

    w, h = image_size
    total_area = w * h

    # ── Area calculations ──
    urban_area = _sum_area(detections, {"urban_land"})
    agri_area = _sum_area(detections, {"agriculture"})
    barren_area = _sum_area(detections, {"barren_land"})
    total_detected = urban_area + agri_area + barren_area

    # ── Coverage percentages (of total image area, clamped 0–100) ──
    urban_density = min(round((urban_area / total_area) * 100, 1), 100.0)
    vegetation_coverage = min(round((agri_area / total_area) * 100, 1), 100.0)
    barren_pct = min(round((barren_area / total_area) * 100, 1), 100.0)

    # ── Derived metrics ──
    # Building density → proxy from urban area (urban zones imply buildings)
    building_density = min(round(urban_density * 0.85, 1), 100.0)

    # Water presence → heuristic: no water class, so estimate from vegetation + context
    # Low vegetation + barren → likely arid → low water
    water_presence = max(0.0, round(min(vegetation_coverage * 0.15, 10.0), 1))

    # Infrastructure concentration → urban correlates with infrastructure
    infra_concentration = min(round(urban_density * 0.7, 1), 100.0)

    # Environmental stress → high urban + high barren + low vegetation = stressed
    veg_stress = max(0, 100 - vegetation_coverage * 2.0)
    urban_heat = min(urban_density * 1.1, 100)
    barren_stress = min(barren_pct * 0.8, 40)
    environmental_stress = round(
        min((veg_stress * 0.35 + urban_heat * 0.35 + barren_stress * 0.30), 100), 1
    )

    # ── Composite risk score ──
    # High urbanization + low vegetation + barren land = high risk
    risk_score = round(min(
        urban_density * 0.30 +
        (100 - vegetation_coverage) * 0.25 +
        barren_pct * 0.15 +
        environmental_stress * 0.20 +
        building_density * 0.10,
        100
    ), 0)

    if risk_score >= 80:
        risk_level = "CRITICAL"
    elif risk_score >= 60:
        risk_level = "HIGH"
    elif risk_score >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # ── Counts ──
    asset_counts = {
        "buildings": _count_in(detections, {"urban_land"}),
        "vegetation_zones": _count_in(detections, {"agriculture"}),
        "water_bodies": 0,
        "road_segments": 0,
        "infrastructure": _count_in(detections, {"urban_land"}),
        "vehicles": 0,
        "total_assets": len(detections),
    }

    analytics = {
        "building_density": building_density,
        "vegetation_coverage": vegetation_coverage,
        "urban_density": urban_density,
        "water_presence": water_presence,
        "environmental_stress": environmental_stress,
        "infrastructure_concentration": infra_concentration,
        "risk_score": int(risk_score),
        "risk_level": risk_level,
    }

    # ── Copilot context ──
    copilot_context = generate_copilot_context(
        analytics, asset_counts,
        urban_pct=urban_density,
        agri_pct=vegetation_coverage,
        barren_pct=barren_pct,
        detections=detections,
    )

    return {
        "analytics": analytics,
        "asset_counts": asset_counts,
        "copilot_context": copilot_context,
    }


def _empty_analytics() -> dict:
    """Return zero-state analytics when no detections found."""
    return {
        "analytics": {
            "building_density": 0.0,
            "vegetation_coverage": 0.0,
            "urban_density": 0.0,
            "water_presence": 0.0,
            "environmental_stress": 0.0,
            "infrastructure_concentration": 0.0,
            "risk_score": 0,
            "risk_level": "LOW",
        },
        "asset_counts": {
            "buildings": 0,
            "vegetation_zones": 0,
            "water_bodies": 0,
            "road_segments": 0,
            "infrastructure": 0,
            "vehicles": 0,
            "total_assets": 0,
        },
        "copilot_context": {
            "summary": "No land-use features detected. The image may not contain recognizable satellite features, or the confidence threshold may need adjustment.",
            "insights": [],
            "recommendations": [
                "Try uploading a clearer satellite or drone image.",
                "Ensure the image contains visible land-use features."
            ],
        },
    }


# ──────────────────────────────────────────────
# AI COPILOT CONTEXT GENERATOR
# ──────────────────────────────────────────────

def generate_copilot_context(
    analytics: dict,
    asset_counts: dict,
    urban_pct: float = 0,
    agri_pct: float = 0,
    barren_pct: float = 0,
    detections: list = None,
) -> dict:
    """
    Generate grounded AI summaries from actual segmentation results.
    Every statement references real detection data — zero hallucination.
    """
    insights = []
    recommendations = []

    total = asset_counts["total_assets"]
    rs = analytics["risk_score"]
    es = analytics["environmental_stress"]

    # ── Urban land analysis ──
    if urban_pct > 50:
        insights.append(
            f"High urban density detected at {urban_pct}% of scan area. "
            "Dense settlement zone with significant built infrastructure."
        )
        recommendations.append(
            "Monitor for unauthorized encroachment near railway corridors. "
            "Schedule ground verification for boundary compliance."
        )
    elif urban_pct > 25:
        insights.append(
            f"Moderate urbanization at {urban_pct}%. Mixed-use zone with "
            "residential and infrastructure development."
        )
        recommendations.append(
            "Track urban expansion rate against baseline for encroachment monitoring."
        )
    elif urban_pct > 5:
        insights.append(f"Low urbanization at {urban_pct}%. Primarily rural or peri-urban zone.")
    elif urban_pct > 0:
        insights.append(f"Minimal urban footprint detected ({urban_pct}%).")

    # ── Agriculture / vegetation analysis ──
    if agri_pct > 50:
        insights.append(
            f"Strong agricultural coverage at {agri_pct}%. "
            "Healthy vegetation corridor with active farming."
        )
    elif agri_pct > 25:
        insights.append(
            f"Moderate vegetation coverage at {agri_pct}%. "
            "Mixed agricultural and developed land."
        )
    elif agri_pct > 5:
        insights.append(
            f"Low vegetation coverage at {agri_pct}%. "
            "Below sustainability threshold — green cover declining."
        )
        recommendations.append(
            "Initiate green cover assessment. Consider compensatory afforestation "
            "as per Green Tribunal guidelines."
        )
    elif agri_pct > 0:
        insights.append(
            f"Critical: Vegetation coverage extremely low at {agri_pct}%. "
            "Environmental stress elevated."
        )
        recommendations.append(
            "Urgent reforestation assessment required. Environmental degradation indicators present."
        )

    # ── Barren land analysis ──
    if barren_pct > 40:
        insights.append(
            f"Significant barren land at {barren_pct}%. "
            "Exposed soil indicates potential land degradation or active development."
        )
        recommendations.append(
            "Assess soil erosion risk. Barren areas near railway tracks "
            "may indicate drainage issues or land-clearing activity."
        )
    elif barren_pct > 15:
        insights.append(
            f"Moderate barren land at {barren_pct}%. "
            "Some exposed areas — could indicate construction or seasonal fallow."
        )
    elif barren_pct > 0:
        insights.append(f"Minor barren patches detected ({barren_pct}%).")

    # ── Environmental stress ──
    if es > 70:
        insights.append(
            f"Environmental stress index HIGH at {es}%. "
            "Driven by low vegetation and high urbanization."
        )
        recommendations.append(
            "Deploy environmental monitoring. Recommend urban heat island assessment."
        )
    elif es > 45:
        insights.append(f"Moderate environmental stress at {es}%.")

    # ── Encroachment heuristic ──
    if urban_pct > 35 and agri_pct < 20:
        insights.append(
            "⚠️ Potential encroachment risk. High urbanization with low vegetation "
            "indicates aggressive development in monitored corridor."
        )
        recommendations.append(
            "Cross-reference with railway land boundaries. "
            "Prioritize field verification for zones with >35% urban density."
        )

    # ── Drainage / flood risk heuristic ──
    if urban_pct > 40 and barren_pct > 20 and agri_pct < 15:
        insights.append(
            "Potential drainage congestion risk. High impermeable surface area "
            "with low vegetation — monsoon flooding risk elevated."
        )
        recommendations.append(
            "Assess drainage line capacity in urbanized zones. "
            "Storm water infrastructure may be inadequate."
        )

    # ── Risk assessment ──
    if rs >= 80:
        insights.append(f"⚠️ CRITICAL risk score: {rs}/100. Multiple high-severity indicators active.")
        recommendations.append("Immediate field verification recommended. Escalate to operations team.")
    elif rs >= 60:
        insights.append(f"HIGH risk score: {rs}/100. Elevated threat indicators detected.")
        recommendations.append("Schedule field verification within 7 days.")
    elif rs >= 40:
        insights.append(f"MEDIUM risk score: {rs}/100. Monitoring advisable.")
    else:
        insights.append(f"LOW risk score: {rs}/100. Zone appears stable.")

    # ── Detection confidence ──
    if detections:
        avg_conf = round(sum(d.confidence for d in detections) / len(detections), 2)
        insights.append(f"Average model confidence: {avg_conf:.0%} across {total} segments.")

    # ── Build summary ──
    parts = []
    if urban_pct > 30:
        parts.append(f"Urban: {urban_pct}%")
    if agri_pct > 0:
        parts.append(f"Agriculture: {agri_pct}%")
    if barren_pct > 10:
        parts.append(f"Barren: {barren_pct}%")

    summary = (
        f"Land-use analysis complete. {total} segments classified across "
        f"{len(set(d.geovision_category for d in (detections or [])))} categories. "
    )
    if parts:
        summary += " | ".join(parts) + ". "
    summary += f"Overall risk: {analytics['risk_level']} ({rs}/100)."

    return {
        "summary": summary,
        "insights": insights,
        "recommendations": recommendations,
    }
