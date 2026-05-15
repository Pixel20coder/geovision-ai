"""
GeoVision AI — Utility Helpers
================================
File handling, ID generation, and image processing utilities.
"""

import uuid
import time
from pathlib import Path
from PIL import Image
import numpy as np
import cv2

from app.config.settings import UPLOAD_DIR, OUTPUT_DIR


def generate_request_id() -> str:
    """Generate a unique request identifier."""
    return f"GV-{uuid.uuid4().hex[:12].upper()}"


def get_timestamp_iso() -> str:
    """Return current UTC timestamp in ISO format."""
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


async def save_upload(file, prefix: str = "upload") -> Path:
    """
    Save an uploaded file to the uploads directory.
    Returns the absolute path to the saved file.
    """
    ext = Path(file.filename).suffix or ".jpg"
    filename = f"{prefix}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = UPLOAD_DIR / filename

    contents = await file.read()
    with open(filepath, "wb") as f:
        f.write(contents)

    return filepath


def load_image_cv2(path: Path) -> np.ndarray:
    """Load an image from disk as an OpenCV BGR array."""
    img = cv2.imread(str(path))
    if img is None:
        raise ValueError(f"Failed to load image: {path}")
    return img


def load_image_pil(path: Path) -> Image.Image:
    """Load an image from disk as a PIL Image."""
    return Image.open(str(path))


def save_output_image(image: np.ndarray, name: str) -> Path:
    """Save a CV2 image to the predictions/outputs directory. Returns path."""
    filepath = OUTPUT_DIR / name
    cv2.imwrite(str(filepath), image)
    return filepath


def pil_to_cv2(pil_image: Image.Image) -> np.ndarray:
    """Convert PIL Image to OpenCV BGR array."""
    rgb = np.array(pil_image.convert("RGB"))
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)


def cv2_to_pil(cv_image: np.ndarray) -> Image.Image:
    """Convert OpenCV BGR array to PIL Image."""
    rgb = cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb)


def calculate_risk_level(score: int) -> str:
    """Map a numeric risk score to a severity label."""
    if score >= 80:
        return "CRITICAL"
    elif score >= 60:
        return "HIGH"
    elif score >= 40:
        return "MEDIUM"
    else:
        return "LOW"
