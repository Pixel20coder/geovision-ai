"""
GeoVision AI — Pydantic Response/Request Schemas
==================================================
All API contract types live here. Frontend consumes these shapes.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ──────────────────────────────────────────────
# PREDICTION SCHEMAS
# ──────────────────────────────────────────────

class DetectedObject(BaseModel):
    """Single detection from YOLO segmentation."""
    class_name: str = Field(..., description="Model class label (urban_land / agriculture / barren_land)")
    geovision_category: str = Field(..., description="Mapped GeoVision asset category")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Detection confidence score")
    bbox: list[float] = Field(..., description="Bounding box [x1, y1, x2, y2] in pixels")
    area_px: int = Field(..., description="Segmentation mask area in pixels")


class AnalyticsMetrics(BaseModel):
    """Spatial intelligence metrics derived from segmentation."""
    building_density: float = Field(0.0, ge=0.0, le=100.0, description="Estimated built-up density %")
    vegetation_coverage: float = Field(0.0, ge=0.0, le=100.0, description="Agriculture/green cover %")
    urban_density: float = Field(0.0, ge=0.0, le=100.0, description="Urban land coverage %")
    water_presence: float = Field(0.0, ge=0.0, le=100.0, description="Estimated water presence %")
    environmental_stress: float = Field(0.0, ge=0.0, le=100.0, description="Environmental stress index")
    infrastructure_concentration: float = Field(0.0, ge=0.0, le=100.0, description="Infrastructure density %")
    risk_score: int = Field(0, ge=0, le=100, description="Composite risk score")
    risk_level: str = Field("LOW", description="LOW / MEDIUM / HIGH / CRITICAL")


class AssetCounts(BaseModel):
    """Detected asset counts by category."""
    buildings: int = 0
    vegetation_zones: int = 0
    water_bodies: int = 0
    road_segments: int = 0
    infrastructure: int = 0
    vehicles: int = 0
    total_assets: int = 0


class CopilotContext(BaseModel):
    """AI-generated insights grounded in detection results."""
    summary: str = Field("", description="One-paragraph analysis summary")
    insights: list[str] = Field(default_factory=list, description="Detection-grounded insights")
    recommendations: list[str] = Field(default_factory=list, description="Actionable recommendations")


class ConfidenceScore(BaseModel):
    """Per-class confidence aggregation."""
    class_name: str
    count: int
    avg_confidence: float
    max_confidence: float
    min_confidence: float


class PredictionResponse(BaseModel):
    """Full response from /predict endpoint."""
    success: bool = True
    request_id: str
    timestamp: str
    model: str
    model_type: str = Field("segmentation", description="segmentation or detection")
    image_size: list[int] = Field(..., description="[width, height] of input image")
    inference_time_ms: float
    total_detections: int
    detections: list[DetectedObject]
    detected_classes: list[str] = Field(default_factory=list, description="Unique class names detected")
    confidence_scores: list[ConfidenceScore] = Field(default_factory=list, description="Per-class confidence stats")
    overlay_url: str = Field(..., description="URL path to annotated overlay image")
    summary: dict = Field(..., description="Detection counts per category")
    analytics: AnalyticsMetrics = Field(default_factory=AnalyticsMetrics, description="Spatial analytics")
    asset_counts: AssetCounts = Field(default_factory=AssetCounts, description="Asset counts by type")
    copilot_context: CopilotContext = Field(default_factory=CopilotContext, description="AI copilot insights")
    environmental_summary: dict = Field(default_factory=dict, description="Environmental metrics summary")
    risk_summary: dict = Field(default_factory=dict, description="Risk assessment summary")


# ──────────────────────────────────────────────
# CHANGE DETECTION SCHEMAS
# ──────────────────────────────────────────────

class ChangedRegion(BaseModel):
    """Significant change region detected between two scans."""
    region_id: int
    centroid: list[int] = Field(..., description="[x, y] center of changed region")
    area_px: int
    bounding_box: list[int] = Field(..., description="[x, y, w, h]")
    intensity: str = Field(..., description="low / medium / high / critical")


class ChangeDetectionResponse(BaseModel):
    """Full response from /change-detection endpoint."""
    request_id: str
    timestamp: str
    image_dimensions: list[int]
    total_pixels: int
    changed_pixels: int
    change_percentage: float
    change_regions: list[ChangedRegion]
    risk_score: int = Field(..., ge=0, le=100)
    risk_level: str
    heatmap_url: str = Field(..., description="URL to generated difference heatmap")
    overlay_url: str = Field(..., description="URL to contour-annotated overlay")
    summary: str


# ──────────────────────────────────────────────
# REPORT SCHEMAS
# ──────────────────────────────────────────────

class IntelligenceReport(BaseModel):
    """Structured intelligence dossier output."""
    report_id: str
    generated_at: str
    classification: str = "CONFIDENTIAL — INTERNAL USE"
    zone: str
    scan_period: str
    risk_level: str
    overall_risk_score: int
    encroachments_detected: int
    vegetation_loss_pct: float
    new_constructions: int
    railway_risk_score: int
    drainage_risk_score: int
    environmental_index: float
    urban_density_pct: float
    priority_actions: list[str]
    key_findings: list[str]
    summary: str
    compliance_status: str


# ──────────────────────────────────────────────
# HEALTH SCHEMAS
# ──────────────────────────────────────────────

class HealthResponse(BaseModel):
    """System health status."""
    status: str
    service: str
    version: str
    uptime_seconds: float
    model_loaded: bool
    model_name: str
    model_type: str = "segmentation"
    gpu_available: bool
    timestamp: str
