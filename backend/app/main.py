"""
GeoVision AI — Main Application
==================================
Enterprise-grade FastAPI backend for the AI Geospatial Intelligence Platform.

Serves:
  - YOLO segmentation/detection inference on satellite imagery
  - Spatial analytics engine (density, coverage, risk)
  - AI copilot context (grounded insights)
  - Temporal change detection with heatmap visualization
  - Intelligence report generation
  - Static file serving for generated overlays

Run with:
  cd backend
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import (
    API_TITLE,
    API_VERSION,
    API_DESCRIPTION,
    OUTPUT_DIR,
    UPLOAD_DIR,
    APP_OUTPUT_DIR,
)
from app.routes import predict, change, report, health, copilot, digit

# ──────────────────────────────────────────────
# LOGGING
# ──────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s │ %(name)-30s │ %(levelname)-8s │ %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("geovision.main")


# ──────────────────────────────────────────────
# LIFESPAN (startup / shutdown)
# ──────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager."""
    logger.info("=" * 60)
    logger.info("  GeoVision AI — Geospatial Intelligence API")
    logger.info(f"  Version: {API_VERSION}")
    logger.info("=" * 60)
    logger.info(f"Uploads directory: {UPLOAD_DIR}")
    logger.info(f"Predictions directory: {OUTPUT_DIR}")

    # Pre-warm the YOLO model on startup (optional, improves first-request latency)
    try:
        from app.services.inference import get_model, get_model_name, get_model_type
        logger.info("Pre-loading YOLO model...")
        get_model()
        logger.info(f"Model ready: {get_model_name()} (type: {get_model_type()})")
    except Exception as e:
        logger.warning(f"Model pre-load skipped (will load on first request): {e}")

    logger.info("System operational — ready for requests")
    yield
    logger.info("Shutting down GeoVision AI backend")


# ──────────────────────────────────────────────
# APP INITIALIZATION
# ──────────────────────────────────────────────

app = FastAPI(
    title=API_TITLE,
    version=API_VERSION,
    description=API_DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ──────────────────────────────────────────────
# MIDDLEWARE
# ──────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# STATIC FILE SERVING
# ──────────────────────────────────────────────

# Serve prediction overlays from backend/predictions/
app.mount("/static/outputs", StaticFiles(directory=str(OUTPUT_DIR)), name="predictions")

# Also serve legacy outputs from app/outputs/ for backward compatibility
app.mount("/static/app-outputs", StaticFiles(directory=str(APP_OUTPUT_DIR)), name="app-outputs")


# ──────────────────────────────────────────────
# ROUTE REGISTRATION
# ──────────────────────────────────────────────

app.include_router(health.router, tags=["System"])
app.include_router(predict.router, tags=["Inference"])
app.include_router(change.router, tags=["Change Detection"])
app.include_router(report.router, tags=["Intelligence Reports"])
app.include_router(copilot.router, tags=["AI Copilot"])
app.include_router(digit.router)


# ──────────────────────────────────────────────
# ROOT ENDPOINT
# ──────────────────────────────────────────────

@app.get("/", tags=["System"])
async def root():
    """API root — system identification."""
    return {
        "service": "GeoVision AI — Geospatial Intelligence API",
        "version": API_VERSION,
        "status": "operational",
        "docs": "/docs",
        "endpoints": {
            "health": "GET /health",
            "predict": "POST /predict",
            "change_detection": "POST /change-detection",
            "generate_report": "POST /generate-report",
            "copilot_query": "POST /copilot/query",
            "copilot_analyze": "POST /copilot/analyze",
            "digit_sync": "POST /digit/sync",
        },
    }
