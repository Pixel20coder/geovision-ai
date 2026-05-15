"""
GeoVision AI — YOLO Inference Service
=======================================
Handles model loading, segmentation inference, overlay generation,
and prediction formatting for the /predict endpoint.

Model: backend/models/best.pt (custom trained segmentation)
Classes: urban_land, agriculture, barren_land
"""

import time
import logging
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
from PIL import Image
from ultralytics import YOLO

from app.config.settings import (
    YOLO_MODEL_PATH,
    YOLO_MODEL_NAME,
    YOLO_CONFIDENCE_THRESHOLD,
    YOLO_IOU_THRESHOLD,
    YOLO_IMAGE_SIZE,
    CLASS_TO_GEOVISION,
    DEFAULT_ASSET_CATEGORY,
    OUTPUT_DIR,
)
from app.models.schemas import DetectedObject
from app.utils.helpers import generate_request_id, save_output_image

logger = logging.getLogger("geovision.inference")

# ──────────────────────────────────────────────
# SINGLETON MODEL LOADER
# ──────────────────────────────────────────────

_model: Optional[YOLO] = None


def get_model() -> YOLO:
    """Load the custom best.pt segmentation model once. Reused across requests."""
    global _model
    if _model is None:
        if not YOLO_MODEL_PATH.exists():
            raise FileNotFoundError(
                f"YOLO model not found at {YOLO_MODEL_PATH}. "
                "Place your trained model at backend/models/best.pt"
            )
        logger.info(f"Loading segmentation model: {YOLO_MODEL_PATH}")
        _model = YOLO(str(YOLO_MODEL_PATH))
        logger.info(
            f"Model loaded — task: {_model.task}, "
            f"classes: {_model.names}, "
            f"count: {len(_model.names)}"
        )
    return _model


def get_model_type() -> str:
    """Return the model type (always segmentation for best.pt)."""
    return "segmentation"


def get_model_name() -> str:
    """Return model display name."""
    return f"GeoVision-Seg ({YOLO_MODEL_NAME})"


def get_model_classes() -> dict:
    """Return model class names dict."""
    if _model is not None:
        return dict(_model.names)
    return {}


def is_model_loaded() -> bool:
    """Check if the model is currently loaded in memory."""
    return _model is not None


# ──────────────────────────────────────────────
# CORE INFERENCE
# ──────────────────────────────────────────────

def run_inference(image_path: Path) -> dict:
    """
    Run YOLO segmentation inference on a single image.

    Returns:
        dict with keys: results, inference_time_ms, image_size, image_bgr
    """
    model = get_model()

    start = time.perf_counter()
    results = model.predict(
        source=str(image_path),
        conf=YOLO_CONFIDENCE_THRESHOLD,
        iou=YOLO_IOU_THRESHOLD,
        imgsz=YOLO_IMAGE_SIZE,
        verbose=False,
    )
    elapsed_ms = (time.perf_counter() - start) * 1000

    # Get original image dimensions
    img = cv2.imread(str(image_path))
    h, w = img.shape[:2]

    return {
        "results": results,
        "inference_time_ms": round(elapsed_ms, 2),
        "image_size": [w, h],
        "image_bgr": img,
    }


# ──────────────────────────────────────────────
# PREDICTION FORMATTING
# ──────────────────────────────────────────────

def _map_class_name(class_name: str) -> str:
    """Map raw model class name to GeoVision category."""
    return CLASS_TO_GEOVISION.get(class_name, DEFAULT_ASSET_CATEGORY)


def format_predictions(results, image_size: list[int] = None) -> list[DetectedObject]:
    """
    Convert raw YOLO results into structured DetectedObject list.
    Handles segmentation masks + bounding boxes.
    """
    detections = []

    for result in results:
        boxes = result.boxes
        masks = getattr(result, 'masks', None)

        if boxes is None or len(boxes) == 0:
            continue

        for i in range(len(boxes)):
            cls_id = int(boxes.cls[i].item())
            conf = round(float(boxes.conf[i].item()), 4)
            bbox = boxes.xyxy[i].tolist()
            bbox = [round(v, 1) for v in bbox]

            # Bounding-box area
            area_px = int((bbox[2] - bbox[0]) * (bbox[3] - bbox[1]))

            # Get class name from model
            class_name = result.names.get(cls_id, f"class_{cls_id}")
            geo_category = _map_class_name(class_name)

            # Use mask area if segmentation masks available (more accurate)
            mask_area_px = area_px
            if masks is not None and i < len(masks.data):
                mask = masks.data[i].cpu().numpy()
                mask_area_px = int(np.sum(mask > 0.5))
                # If mask area is valid, use it; otherwise fallback to bbox area
                if mask_area_px > 0:
                    area_px = mask_area_px

            detections.append(DetectedObject(
                class_name=class_name,
                geovision_category=geo_category,
                confidence=conf,
                bbox=bbox,
                area_px=area_px,
            ))

    return detections


def summarize_detections(detections: list[DetectedObject]) -> dict:
    """Aggregate detection counts per GeoVision category."""
    summary: dict[str, int] = {}
    for d in detections:
        key = d.geovision_category
        summary[key] = summary.get(key, 0) + 1
    return summary


# ──────────────────────────────────────────────
# OVERLAY GENERATION
# ──────────────────────────────────────────────

# Color palette for GeoVision land-use categories (BGR format)
CATEGORY_COLORS = {
    "urban_land":   (0, 180, 255),     # warm orange — urbanization
    "agriculture":  (80, 200, 80),     # green — crops/vegetation
    "barren_land":  (120, 160, 200),   # sandy/brown — exposed soil
}

# Extra category colors for backward compat
CATEGORY_COLORS.update({
    "building":          (255, 212, 0),
    "green_cover":       (129, 185, 16),
    "water_body":        (246, 130, 59),
    "road_network":      (200, 200, 200),
    "infrastructure":    (161, 161, 161),
    "railway_structure": (53, 107, 255),
    "vehicle":           (0, 165, 255),
})

DEFAULT_COLOR = (180, 180, 180)


def save_overlay(image_bgr: np.ndarray, detections: list[DetectedObject],
                 request_id: str, results=None) -> Path:
    """
    Draw segmentation masks and bounding boxes on the image.
    Returns the path to the saved overlay image.
    """
    overlay = image_bgr.copy()
    has_masks = False

    # ── 1. Draw segmentation masks ──
    if results is not None:
        for result in results:
            masks = getattr(result, 'masks', None)
            if masks is not None and masks.data is not None and len(masks.data) > 0:
                has_masks = True
                # Create a combined mask overlay
                mask_layer = np.zeros_like(image_bgr, dtype=np.float32)

                for i in range(len(masks.data)):
                    if i >= len(result.boxes):
                        break
                    cls_id = int(result.boxes.cls[i].item())
                    class_name = result.names.get(cls_id, f"class_{cls_id}")
                    geo_category = _map_class_name(class_name)
                    color = CATEGORY_COLORS.get(geo_category, DEFAULT_COLOR)

                    # Get mask and resize to original image dimensions
                    mask = masks.data[i].cpu().numpy()
                    mask_resized = cv2.resize(
                        mask, (image_bgr.shape[1], image_bgr.shape[0]),
                        interpolation=cv2.INTER_LINEAR
                    )

                    # Create colored mask
                    binary = (mask_resized > 0.5).astype(np.float32)
                    for c in range(3):
                        mask_layer[:, :, c] += binary * color[c]

                # Blend mask layer with original image
                mask_layer = np.clip(mask_layer, 0, 255).astype(np.uint8)
                overlay = cv2.addWeighted(overlay, 0.55, mask_layer, 0.45, 0)

    # ── 2. Draw bounding boxes and labels ──
    for det in detections:
        x1, y1, x2, y2 = [int(v) for v in det.bbox]
        color = CATEGORY_COLORS.get(det.geovision_category, DEFAULT_COLOR)

        # Bounding box with slight transparency effect
        cv2.rectangle(overlay, (x1, y1), (x2, y2), color, 2)

        # Label
        label = f"{det.class_name} {det.confidence:.0%}"
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        # Label background
        cv2.rectangle(overlay, (x1, y1 - th - 10), (x1 + tw + 8, y1), color, -1)
        # Label text (black on colored bg)
        cv2.putText(
            overlay, label,
            (x1 + 4, y1 - 5),
            cv2.FONT_HERSHEY_SIMPLEX, 0.5,
            (0, 0, 0), 1, cv2.LINE_AA
        )

    # ── 3. Add legend to bottom-left ──
    if detections:
        legend_y = overlay.shape[0] - 20
        legend_x = 15
        detected_cats = list(set(d.geovision_category for d in detections))
        for cat in sorted(detected_cats):
            color = CATEGORY_COLORS.get(cat, DEFAULT_COLOR)
            cv2.rectangle(overlay, (legend_x, legend_y - 12), (legend_x + 14, legend_y), color, -1)
            cv2.putText(
                overlay, cat.replace('_', ' ').title(),
                (legend_x + 18, legend_y - 1),
                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1, cv2.LINE_AA
            )
            legend_x += cv2.getTextSize(cat, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)[0][0] + 35

    filename = f"overlay_{request_id}.jpg"
    return save_output_image(overlay, filename)
