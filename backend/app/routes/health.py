"""
GeoVision AI — Health Check Route
====================================
GET /health — System status, model readiness, and GPU availability
"""

import time
import logging
from fastapi import APIRouter

from app.models.schemas import HealthResponse
from app.config.settings import API_VERSION
from app.services.inference import is_model_loaded, get_model_name, get_model_type
from app.utils.helpers import get_timestamp_iso

logger = logging.getLogger("geovision.routes.health")
router = APIRouter()

# Track server start time
_start_time = time.time()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="System health check",
    description="Returns current system status, model readiness, GPU availability, and uptime.",
)
async def health_check():
    """Report system health and operational status."""

    # Try to detect GPU without hard torch dependency
    gpu_available = False
    try:
        import torch
        gpu_available = torch.cuda.is_available()
    except ImportError:
        pass

    uptime = round(time.time() - _start_time, 2)

    return HealthResponse(
        status="operational",
        service="GeoVision AI — Geospatial Intelligence API",
        version=API_VERSION,
        uptime_seconds=uptime,
        model_loaded=is_model_loaded(),
        model_name=get_model_name(),
        model_type=get_model_type(),
        gpu_available=gpu_available,
        timestamp=get_timestamp_iso(),
    )
