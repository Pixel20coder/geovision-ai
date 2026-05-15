"""
GeoVision AI — Change Detection Route
=======================================
POST /change-detection — Upload before/after images → diff analysis → heatmap
"""

import logging
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.models.schemas import ChangeDetectionResponse
from app.services.change_detection import detect_changes
from app.utils.helpers import (
    generate_request_id,
    get_timestamp_iso,
    save_upload,
)

logger = logging.getLogger("geovision.routes.change")
router = APIRouter()


@router.post(
    "/change-detection",
    response_model=ChangeDetectionResponse,
    summary="Detect changes between two satellite scans",
    description=(
        "Upload a BEFORE and AFTER satellite image. The system will compute "
        "pixel-level differences, generate a heatmap overlay, identify changed "
        "regions via contour analysis, and return a risk assessment."
    ),
)
async def change_detection(
    before: UploadFile = File(..., description="Baseline satellite image (T-1)"),
    after: UploadFile = File(..., description="Current satellite image (T-0)"),
):
    """Execute temporal change detection pipeline."""

    # Validate both files
    for f, label in [(before, "before"), (after, "after")]:
        if not f.content_type or not f.content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid {label} file type: {f.content_type}. Expected an image."
            )

    request_id = generate_request_id()
    logger.info(
        f"[{request_id}] Change detection — before: {before.filename}, after: {after.filename}"
    )

    try:
        # 1. Save uploaded images
        before_path = await save_upload(before, prefix="before")
        after_path = await save_upload(after, prefix="after")

        # 2. Run change detection pipeline
        result = detect_changes(before_path, after_path, request_id)

        # 3. Build URLs for generated images
        heatmap_url = f"/static/outputs/{result['heatmap_path'].name}"
        overlay_url = f"/static/outputs/{result['overlay_path'].name}"

        logger.info(
            f"[{request_id}] Change detection complete — "
            f"{result['change_percentage']}% changed, "
            f"{len(result['change_regions'])} regions, "
            f"risk: {result['risk_level']}"
        )

        return ChangeDetectionResponse(
            request_id=request_id,
            timestamp=get_timestamp_iso(),
            image_dimensions=result["image_dimensions"],
            total_pixels=result["total_pixels"],
            changed_pixels=result["changed_pixels"],
            change_percentage=result["change_percentage"],
            change_regions=result["change_regions"],
            risk_score=result["risk_score"],
            risk_level=result["risk_level"],
            heatmap_url=heatmap_url,
            overlay_url=overlay_url,
            summary=result["summary"],
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"[{request_id}] Change detection failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Change detection error: {str(e)}")
