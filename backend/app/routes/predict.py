"""
GeoVision AI — Prediction Route
==================================
POST /predict — Upload satellite image → YOLO segmentation → overlays + analytics + AI insights
"""

import logging
from collections import defaultdict
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.models.schemas import (
    PredictionResponse,
    AnalyticsMetrics,
    AssetCounts,
    CopilotContext,
    ConfidenceScore,
)
from app.services.inference import (
    run_inference,
    format_predictions,
    summarize_detections,
    save_overlay,
    get_model_name,
    get_model_type,
)
from app.services.analytics import compute_analytics
from app.utils.helpers import (
    generate_request_id,
    get_timestamp_iso,
    save_upload,
)

logger = logging.getLogger("geovision.routes.predict")
router = APIRouter()


def _compute_confidence_scores(detections) -> list[ConfidenceScore]:
    """Aggregate per-class confidence statistics."""
    by_class = defaultdict(list)
    for d in detections:
        by_class[d.class_name].append(d.confidence)

    scores = []
    for cls_name, confs in sorted(by_class.items()):
        scores.append(ConfidenceScore(
            class_name=cls_name,
            count=len(confs),
            avg_confidence=round(sum(confs) / len(confs), 4),
            max_confidence=round(max(confs), 4),
            min_confidence=round(min(confs), 4),
        ))
    return scores


def _build_environmental_summary(analytics: dict) -> dict:
    """Build environmental metrics summary from analytics."""
    return {
        "vegetation_index": analytics.get("vegetation_coverage", 0),
        "urban_heat_risk": "HIGH" if analytics.get("urban_density", 0) > 50 else "MODERATE" if analytics.get("urban_density", 0) > 25 else "LOW",
        "soil_exposure": "ELEVATED" if analytics.get("building_density", 0) < 20 and analytics.get("vegetation_coverage", 0) < 20 else "NORMAL",
        "green_cover_status": "HEALTHY" if analytics.get("vegetation_coverage", 0) > 40 else "DECLINING" if analytics.get("vegetation_coverage", 0) > 15 else "CRITICAL",
        "environmental_stress_index": analytics.get("environmental_stress", 0),
    }


def _build_risk_summary(analytics: dict) -> dict:
    """Build risk assessment summary from analytics."""
    return {
        "overall_score": analytics.get("risk_score", 0),
        "level": analytics.get("risk_level", "LOW"),
        "encroachment_risk": "HIGH" if analytics.get("urban_density", 0) > 40 and analytics.get("vegetation_coverage", 0) < 15 else "MODERATE" if analytics.get("urban_density", 0) > 25 else "LOW",
        "drainage_risk": "ELEVATED" if analytics.get("urban_density", 0) > 40 and analytics.get("vegetation_coverage", 0) < 20 else "NORMAL",
        "deforestation_indicator": "ACTIVE" if analytics.get("vegetation_coverage", 0) < 10 else "MODERATE" if analytics.get("vegetation_coverage", 0) < 25 else "STABLE",
    }


@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Run YOLO segmentation on satellite imagery",
    description=(
        "Upload a satellite/drone image to run YOLO segmentation inference. "
        "Returns segmentation masks, confidence scores, land-use classifications, "
        "spatial analytics, environmental summary, risk assessment, "
        "and AI copilot context grounded in actual detections."
    ),
)
async def predict(image: UploadFile = File(..., description="Satellite image file (JPG/PNG/TIFF)")):
    """Execute YOLO segmentation pipeline on uploaded satellite imagery."""

    # Validate file type
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {image.content_type}. Expected an image file."
        )

    request_id = generate_request_id()
    logger.info(f"[{request_id}] Inference request — file: {image.filename}")

    try:
        # 1. Save uploaded image
        image_path = await save_upload(image, prefix="sat")

        # 2. Run YOLO segmentation inference
        result = run_inference(image_path)

        # 3. Format predictions
        detections = format_predictions(result["results"], result["image_size"])
        summary = summarize_detections(detections)

        # 4. Generate annotated overlay with segmentation masks
        overlay_path = save_overlay(
            result["image_bgr"], detections, request_id,
            results=result["results"]
        )
        overlay_url = f"/static/outputs/{overlay_path.name}"

        # 5. Compute spatial analytics + copilot context
        analytics_result = compute_analytics(detections, result["image_size"])

        # 6. Per-class confidence scores
        confidence_scores = _compute_confidence_scores(detections)

        # 7. Detected classes
        detected_classes = list(set(d.class_name for d in detections))

        # 8. Environmental + risk summaries
        env_summary = _build_environmental_summary(analytics_result["analytics"])
        risk_summary = _build_risk_summary(analytics_result["analytics"])

        logger.info(
            f"[{request_id}] Inference complete — "
            f"{len(detections)} segments in {result['inference_time_ms']}ms | "
            f"Classes: {detected_classes} | "
            f"Risk: {analytics_result['analytics']['risk_level']} ({analytics_result['analytics']['risk_score']})"
        )

        return PredictionResponse(
            success=True,
            request_id=request_id,
            timestamp=get_timestamp_iso(),
            model=get_model_name(),
            model_type=get_model_type(),
            image_size=result["image_size"],
            inference_time_ms=result["inference_time_ms"],
            total_detections=len(detections),
            detections=detections,
            detected_classes=detected_classes,
            confidence_scores=confidence_scores,
            overlay_url=overlay_url,
            summary=summary,
            analytics=AnalyticsMetrics(**analytics_result["analytics"]),
            asset_counts=AssetCounts(**analytics_result["asset_counts"]),
            copilot_context=CopilotContext(**analytics_result["copilot_context"]),
            environmental_summary=env_summary,
            risk_summary=risk_summary,
        )

    except Exception as e:
        logger.error(f"[{request_id}] Inference failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Inference pipeline error: {str(e)}")
