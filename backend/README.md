# GeoVision AI — Backend

Enterprise-grade FastAPI backend for the AI Geospatial Intelligence Platform.

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── config/
│   │   └── settings.py       # Centralized configuration
│   ├── routes/
│   │   ├── predict.py        # POST /predict
│   │   ├── change.py         # POST /change-detection
│   │   ├── report.py         # POST /generate-report
│   │   └── health.py         # GET  /health
│   ├── services/
│   │   ├── inference.py      # YOLO inference engine
│   │   ├── change_detection.py # OpenCV temporal analysis
│   │   └── report_generator.py # Intelligence dossier generator
│   ├── models/
│   │   └── schemas.py        # Pydantic request/response schemas
│   ├── utils/
│   │   └── helpers.py        # File I/O, ID generation, utilities
│   ├── uploads/              # Uploaded satellite images
│   └── outputs/              # Generated overlays and heatmaps
└── requirements.txt
```

## Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate   # macOS/Linux
# venv\Scripts\activate    # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The YOLO model (`yolov8x.pt`) downloads automatically on first launch (~130MB).

## API Endpoints

### `GET /health`
System health check.

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "operational",
  "service": "GeoVision AI — Geospatial Intelligence API",
  "version": "1.0.0",
  "model_loaded": true,
  "gpu_available": false,
  "uptime_seconds": 42.5
}
```

---

### `POST /predict`
Upload a satellite image for YOLO object detection.

```bash
curl -X POST http://localhost:8000/predict \
  -F "image=@satellite_image.jpg"
```

Response:
```json
{
  "request_id": "GV-A1B2C3D4E5F6",
  "model": "yolov8x.pt",
  "inference_time_ms": 245.3,
  "total_detections": 12,
  "detections": [
    {
      "class_name": "car",
      "geovision_category": "vehicle",
      "confidence": 0.87,
      "bbox": [120.5, 200.3, 280.1, 310.7],
      "area_px": 17616
    }
  ],
  "overlay_url": "/static/outputs/overlay_GV-A1B2C3D4E5F6.jpg",
  "summary": { "vehicle": 8, "building": 3, "infrastructure": 1 }
}
```

---

### `POST /change-detection`
Upload before/after satellite images for temporal change analysis.

```bash
curl -X POST http://localhost:8000/change-detection \
  -F "before=@scan_jan2026.jpg" \
  -F "after=@scan_may2026.jpg"
```

Response:
```json
{
  "request_id": "GV-F6E5D4C3B2A1",
  "change_percentage": 14.7,
  "change_regions": [
    {
      "region_id": 1,
      "centroid": [320, 180],
      "area_px": 12500,
      "intensity": "critical"
    }
  ],
  "risk_score": 78,
  "risk_level": "HIGH",
  "heatmap_url": "/static/outputs/heatmap_GV-F6E5D4C3B2A1.jpg",
  "overlay_url": "/static/outputs/change_overlay_GV-F6E5D4C3B2A1.jpg"
}
```

---

### `POST /generate-report`
Generate an intelligence dossier.

```bash
curl -X POST "http://localhost:8000/generate-report?zone=New%20Delhi%20Railway%20Zone"
```

Response:
```json
{
  "report_id": "GV-112233AABBCC",
  "classification": "CONFIDENTIAL — INTERNAL USE",
  "risk_level": "HIGH",
  "overall_risk_score": 74,
  "encroachments_detected": 4,
  "vegetation_loss_pct": 12.3,
  "railway_risk_score": 82,
  "priority_actions": ["..."],
  "key_findings": ["..."],
  "summary": "Intelligence assessment for New Delhi Railway Zone..."
}
```

## Interactive Docs

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GEOVISION_YOLO_MODEL` | `yolov8x.pt` | YOLO model file |
| `GEOVISION_CONF_THRESHOLD` | `0.35` | Detection confidence threshold |
| `GEOVISION_IOU_THRESHOLD` | `0.45` | NMS IoU threshold |
| `GEOVISION_IMG_SIZE` | `640` | Inference image size |
| `GEOVISION_CHANGE_THRESHOLD` | `30` | Change detection pixel threshold |
| `GEOVISION_MIN_CONTOUR` | `500` | Minimum contour area (pixels) |
