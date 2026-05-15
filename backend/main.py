"""
GeoVision AI — Main Application (Root Entry)
================================================
Root-level entry point for the backend.
Delegates to app.main for full FastAPI configuration.

Run with:
  cd backend
  uvicorn main:app --reload --host 0.0.0.0 --port 8000

  OR

  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""

from app.main import app  # noqa: F401
