"""
GeoVision AI — DIGIT Registry Sync Route
============================================
POST /digit/sync — Synchronize detected geospatial assets with
a DIGIT-compatible urban governance registry.

This is a hackathon demo endpoint that simulates the sync workflow.
It does NOT connect to actual government systems.
"""

import uuid
import time
import random
import logging
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

logger = logging.getLogger("geovision.routes.digit")
router = APIRouter(prefix="/digit", tags=["DIGIT Registry"])


# ──────────────────────────────────────────────
# REQUEST / RESPONSE SCHEMAS
# ──────────────────────────────────────────────

class DetectionPayload(BaseModel):
    class_name: str
    geovision_category: str
    confidence: float
    bbox: list[float]
    area_px: int


class DigitSyncRequest(BaseModel):
    """Payload for DIGIT registry sync."""
    request_id: str = Field(..., description="Original prediction request ID")
    detections: list[DetectionPayload] = Field(..., description="Detected assets to sync")
    analytics: dict = Field(default_factory=dict, description="Spatial analytics metrics")
    environmental_summary: dict = Field(default_factory=dict, description="Environmental status")
    risk_summary: dict = Field(default_factory=dict, description="Risk assessment")
    zone: str = Field(default="NDLS-SECTOR-01", description="Operational zone identifier")
    scan_timestamp: str = Field(default="", description="Original scan timestamp")


class IndexedAsset(BaseModel):
    """Single asset record created in DIGIT registry."""
    asset_id: str
    asset_type: str
    category: str
    confidence: float
    area_sq_m: float
    zone: str
    status: str
    compliance: str


class DigitSyncResponse(BaseModel):
    """Response from DIGIT registry sync."""
    success: bool
    registry_id: str = Field(..., description="DIGIT registry transaction ID")
    assets_indexed: int = Field(..., description="Number of assets synced to registry")
    sync_timestamp: str
    status: str = Field(..., description="VERIFIED_AND_INDEXED / PARTIAL / FAILED")
    zone: str
    registry_url: str = Field(..., description="Simulated DIGIT registry URL")
    compliance_status: str
    indexed_assets: list[IndexedAsset] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)


# ──────────────────────────────────────────────
# SYNC ENDPOINT
# ──────────────────────────────────────────────

@router.post(
    "/sync",
    response_model=DigitSyncResponse,
    summary="Sync detected assets to DIGIT-compatible registry",
    description=(
        "Synchronize AI-detected geospatial infrastructure assets with a "
        "DIGIT-compatible urban governance registry. This is a demo endpoint "
        "that simulates the sync workflow for hackathon purposes."
    ),
)
async def sync_to_digit(payload: DigitSyncRequest):
    """Simulate DIGIT registry synchronization."""

    if not payload.detections:
        raise HTTPException(
            status_code=400,
            detail="No detected assets to sync. Run inference first."
        )

    logger.info(
        f"[DIGIT] Sync request — {len(payload.detections)} assets, "
        f"zone: {payload.zone}, source: {payload.request_id}"
    )

    # Simulate processing delay (realistic feel)
    time.sleep(0.5)

    # Generate DIGIT registry ID
    sector = payload.zone.replace("-", "")[:6].upper()
    seq = random.randint(10000, 99999)
    registry_id = f"DIG-URB-{sector}-{seq}"

    # Build indexed asset records
    indexed_assets = []
    for i, det in enumerate(payload.detections):
        # Convert pixel area to approximate sq meters (assuming 0.5m/px satellite)
        area_sq_m = round(det.area_px * 0.25, 1)  # 0.5m/px → 0.25 sq m per px

        asset_id = f"AST-{uuid.uuid4().hex[:8].upper()}"

        # Determine compliance based on category and zone
        compliance = "COMPLIANT"
        if det.geovision_category == "urban_land" and det.confidence > 0.6:
            compliance = random.choice(["COMPLIANT", "REVIEW_REQUIRED", "COMPLIANT"])
        elif det.geovision_category == "barren_land":
            compliance = random.choice(["COMPLIANT", "MONITORING", "COMPLIANT"])

        indexed_assets.append(IndexedAsset(
            asset_id=asset_id,
            asset_type=det.class_name.replace("_", " ").title(),
            category=det.geovision_category,
            confidence=det.confidence,
            area_sq_m=area_sq_m,
            zone=payload.zone,
            status="INDEXED",
            compliance=compliance,
        ))

    # Build metadata
    risk_level = payload.risk_summary.get("level", "LOW")
    env_stress = payload.analytics.get("environmental_stress", 0)

    metadata = {
        "source_scan": payload.request_id,
        "scan_timestamp": payload.scan_timestamp or datetime.now(timezone.utc).isoformat(),
        "registry_version": "DIGIT-ULB-v4.2",
        "sync_protocol": "GeoVision-DIGIT-Bridge v1.0",
        "spatial_reference": "EPSG:4326",
        "risk_classification": risk_level,
        "environmental_index": env_stress,
        "total_area_sq_m": sum(a.area_sq_m for a in indexed_assets),
        "categories_indexed": list(set(a.category for a in indexed_assets)),
        "review_items": sum(1 for a in indexed_assets if a.compliance == "REVIEW_REQUIRED"),
    }

    # Compliance status
    review_count = metadata["review_items"]
    if review_count == 0:
        compliance_status = "FULLY_COMPLIANT"
    elif review_count <= 2:
        compliance_status = "MINOR_REVIEW_PENDING"
    else:
        compliance_status = "REVIEW_REQUIRED"

    sync_ts = datetime.now(timezone.utc).isoformat()

    logger.info(
        f"[DIGIT] Sync complete — registry: {registry_id}, "
        f"assets: {len(indexed_assets)}, compliance: {compliance_status}"
    )

    return DigitSyncResponse(
        success=True,
        registry_id=registry_id,
        assets_indexed=len(indexed_assets),
        sync_timestamp=sync_ts,
        status="VERIFIED_AND_INDEXED",
        zone=payload.zone,
        registry_url=f"https://digit.gov.in/registry/{registry_id.lower()}",
        compliance_status=compliance_status,
        indexed_assets=indexed_assets,
        metadata=metadata,
    )
