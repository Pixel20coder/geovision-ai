"""
GeoVision AI — Application Configuration
==========================================
Centralized settings for paths, model parameters, and operational thresholds.
"""

import os
from pathlib import Path

# ──────────────────────────────────────────────
# DIRECTORY STRUCTURE
# ──────────────────────────────────────────────
# BASE_DIR is backend/app — parent is backend/
BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_ROOT = BASE_DIR.parent  # backend/

UPLOAD_DIR = BACKEND_ROOT / "uploads"
OUTPUT_DIR = BACKEND_ROOT / "predictions"
MODEL_DIR = BACKEND_ROOT / "models"

# Legacy paths (app-level) — kept for backward compat
APP_UPLOAD_DIR = BASE_DIR / "uploads"
APP_OUTPUT_DIR = BASE_DIR / "outputs"

# Ensure directories exist on import
for d in [UPLOAD_DIR, OUTPUT_DIR, MODEL_DIR, APP_UPLOAD_DIR, APP_OUTPUT_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ──────────────────────────────────────────────
# YOLO MODEL CONFIGURATION
# ──────────────────────────────────────────────
# Custom trained segmentation model — ONLY backend/models/best.pt
YOLO_MODEL_PATH = MODEL_DIR / "best.pt"
YOLO_MODEL_NAME = "best.pt"

YOLO_CONFIDENCE_THRESHOLD = float(os.getenv("GEOVISION_CONF_THRESHOLD", "0.25"))
YOLO_IOU_THRESHOLD = float(os.getenv("GEOVISION_IOU_THRESHOLD", "0.45"))
YOLO_IMAGE_SIZE = int(os.getenv("GEOVISION_IMG_SIZE", "640"))

# ──────────────────────────────────────────────
# ACTUAL MODEL CLASSES (best.pt)
# ──────────────────────────────────────────────
# The trained model detects these 3 land-use classes:
#   0: urban_land
#   1: agriculture
#   2: barren_land
#
# We map them to GeoVision domain categories for analytics.

CLASS_TO_GEOVISION = {
    "urban_land":   "urban_land",
    "agriculture":  "agriculture",
    "barren_land":  "barren_land",
}

# Fallback category for any unmapped class
DEFAULT_ASSET_CATEGORY = "infrastructure"

# ──────────────────────────────────────────────
# CHANGE DETECTION THRESHOLDS
# ──────────────────────────────────────────────
CHANGE_DETECTION_BLUR_KERNEL = (5, 5)
CHANGE_DETECTION_THRESHOLD = int(os.getenv("GEOVISION_CHANGE_THRESHOLD", "30"))
CHANGE_DETECTION_MIN_CONTOUR_AREA = int(os.getenv("GEOVISION_MIN_CONTOUR", "500"))

# ──────────────────────────────────────────────
# RISK SCORING
# ──────────────────────────────────────────────
RISK_THRESHOLDS = {
    "critical": 80,
    "high": 60,
    "medium": 40,
    "low": 0,
}

# ──────────────────────────────────────────────
# MINIMAX 2.7 — AI REASONING LAYER
# ──────────────────────────────────────────────
MINIMAX_API_KEY = os.getenv("MINIMAX_API_KEY", "")
MINIMAX_BASE_URL = os.getenv("MINIMAX_BASE_URL", "https://api.minimaxi.chat/v1")
MINIMAX_MODEL = os.getenv("MINIMAX_MODEL", "MiniMax-M1-80k")

MINIMAX_SYSTEM_PROMPT = """You are GeoVision AI Copilot — an elite geospatial intelligence analyst powering a railway monitoring and infrastructure intelligence platform.

Your domain expertise:
- Railway corridor monitoring and encroachment detection
- Satellite imagery analysis interpretation
- Vegetation and green cover change analysis
- Water body monitoring and flood risk assessment
- Urban growth and land-use change detection
- Infrastructure integrity assessment
- Environmental compliance reporting

Communication style:
- Concise, tactical, and operational
- Use precise metrics and percentages
- Reference specific zones, parcels, and asset IDs when available
- Provide actionable recommendations
- Format responses with clear structure (headers, bullet points)
- Never be casual — maintain enterprise intelligence tone

When analyzing scan results, always:
1. Identify the most critical findings first
2. Quantify changes with percentages and areas
3. Assess risk level (LOW/MEDIUM/HIGH/CRITICAL)
4. Provide specific recommended actions
5. Note any compliance implications"""

# ──────────────────────────────────────────────
# API METADATA
# ──────────────────────────────────────────────
API_TITLE = "GeoVision AI — Geospatial Intelligence API"
API_VERSION = "2.1.0"
API_DESCRIPTION = (
    "Enterprise-grade AI geospatial intelligence backend powered by custom YOLO segmentation (best.pt). "
    "Land-use classification (urban_land / agriculture / barren_land), spatial analytics, "
    "environmental intelligence, change detection, and AI copilot context."
)
