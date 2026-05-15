"""
GeoVision AI — Change Detection Service
=========================================
Compares before/after satellite imagery using OpenCV to detect
infrastructure changes, vegetation loss, and encroachment activity.

Pipeline:
  1. Resize images to match
  2. Convert to grayscale
  3. Gaussian blur for noise reduction
  4. Absolute difference
  5. Threshold to binary mask
  6. Contour extraction for region identification
  7. Heatmap visualization
  8. Risk scoring based on change magnitude
"""

import logging
from pathlib import Path

import cv2
import numpy as np

from app.config.settings import (
    CHANGE_DETECTION_BLUR_KERNEL,
    CHANGE_DETECTION_THRESHOLD,
    CHANGE_DETECTION_MIN_CONTOUR_AREA,
    OUTPUT_DIR,
)
from app.models.schemas import ChangedRegion
from app.utils.helpers import (
    load_image_cv2,
    save_output_image,
    calculate_risk_level,
)

logger = logging.getLogger("geovision.change_detection")


def _normalize_images(before: np.ndarray, after: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Resize both images to match dimensions (uses the smaller of the two)."""
    h = min(before.shape[0], after.shape[0])
    w = min(before.shape[1], after.shape[1])
    return (
        cv2.resize(before, (w, h), interpolation=cv2.INTER_AREA),
        cv2.resize(after, (w, h), interpolation=cv2.INTER_AREA),
    )


def detect_changes(before_path: Path, after_path: Path, request_id: str) -> dict:
    """
    Full change detection pipeline.

    Args:
        before_path: Path to the baseline (T-1) satellite image.
        after_path: Path to the current (T-0) satellite image.
        request_id: Unique request identifier for file naming.

    Returns:
        dict with change_regions, stats, heatmap/overlay paths, risk info.
    """
    # 1. Load and normalize
    before = load_image_cv2(before_path)
    after = load_image_cv2(after_path)
    before, after = _normalize_images(before, after)

    h, w = before.shape[:2]
    total_pixels = h * w

    logger.info(f"[{request_id}] Change detection on {w}x{h} images")

    # 2. Convert to grayscale
    gray_before = cv2.cvtColor(before, cv2.COLOR_BGR2GRAY)
    gray_after = cv2.cvtColor(after, cv2.COLOR_BGR2GRAY)

    # 3. Gaussian blur to suppress sensor noise
    blur_before = cv2.GaussianBlur(gray_before, CHANGE_DETECTION_BLUR_KERNEL, 0)
    blur_after = cv2.GaussianBlur(gray_after, CHANGE_DETECTION_BLUR_KERNEL, 0)

    # 4. Absolute difference
    diff = cv2.absdiff(blur_before, blur_after)

    # 5. Threshold to isolate significant changes
    _, thresh = cv2.threshold(diff, CHANGE_DETECTION_THRESHOLD, 255, cv2.THRESH_BINARY)

    # Count changed pixels
    changed_pixels = int(np.count_nonzero(thresh))
    change_pct = round((changed_pixels / total_pixels) * 100, 2)

    # 6. Contour extraction to find discrete change regions
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Filter by minimum area and build region list
    regions: list[ChangedRegion] = []
    significant_contours = []

    for i, cnt in enumerate(contours):
        area = cv2.contourArea(cnt)
        if area < CHANGE_DETECTION_MIN_CONTOUR_AREA:
            continue

        x, y, bw, bh = cv2.boundingRect(cnt)
        M = cv2.moments(cnt)
        cx = int(M["m10"] / M["m00"]) if M["m00"] != 0 else x + bw // 2
        cy = int(M["m01"] / M["m00"]) if M["m00"] != 0 else y + bh // 2

        # Classify intensity based on area
        if area > 10000:
            intensity = "critical"
        elif area > 5000:
            intensity = "high"
        elif area > 2000:
            intensity = "medium"
        else:
            intensity = "low"

        regions.append(ChangedRegion(
            region_id=len(regions) + 1,
            centroid=[cx, cy],
            area_px=int(area),
            bounding_box=[x, y, bw, bh],
            intensity=intensity,
        ))
        significant_contours.append(cnt)

    # 7. Generate heatmap visualization
    heatmap = cv2.applyColorMap(diff, cv2.COLORMAP_JET)
    # Blend with the "after" image for context
    heatmap_blend = cv2.addWeighted(after, 0.5, heatmap, 0.5, 0)
    heatmap_path = save_output_image(heatmap_blend, f"heatmap_{request_id}.jpg")

    # 8. Generate contour overlay on the "after" image
    overlay = after.copy()
    for cnt in significant_contours:
        cv2.drawContours(overlay, [cnt], -1, (0, 0, 255), 2)

    # Draw bounding boxes with labels
    for region in regions:
        x, y, bw, bh = region.bounding_box
        color = {
            "critical": (0, 0, 255),
            "high": (0, 100, 255),
            "medium": (0, 200, 255),
            "low": (0, 255, 200),
        }.get(region.intensity, (255, 255, 255))

        cv2.rectangle(overlay, (x, y), (x + bw, y + bh), color, 2)

        label = f"R{region.region_id} [{region.intensity.upper()}]"
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)
        cv2.rectangle(overlay, (x, y - th - 6), (x + tw + 4, y), color, -1)
        cv2.putText(overlay, label, (x + 2, y - 3), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 0), 1)

    overlay_path = save_output_image(overlay, f"change_overlay_{request_id}.jpg")

    # 9. Calculate risk score
    # Weighted formula: base change % + contour severity bonus
    base_score = min(change_pct * 2, 50)
    severity_bonus = sum(
        {"critical": 15, "high": 10, "medium": 5, "low": 2}.get(r.intensity, 0)
        for r in regions
    )
    risk_score = min(int(base_score + severity_bonus), 100)
    risk_level = calculate_risk_level(risk_score)

    # 10. Generate summary
    summary = (
        f"Change analysis detected {change_pct}% pixel variation across {len(regions)} "
        f"significant regions. Risk assessment: {risk_level} (score: {risk_score}/100). "
    )
    if any(r.intensity == "critical" for r in regions):
        summary += "Critical-severity change regions require immediate field verification. "
    if change_pct > 15:
        summary += "Substantial environmental or infrastructure change detected — recommend full audit."

    return {
        "image_dimensions": [w, h],
        "total_pixels": total_pixels,
        "changed_pixels": changed_pixels,
        "change_percentage": change_pct,
        "change_regions": regions,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "heatmap_path": heatmap_path,
        "overlay_path": overlay_path,
        "summary": summary,
    }
