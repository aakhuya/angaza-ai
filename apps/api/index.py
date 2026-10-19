"""
Vercel entry point for the FastAPI app.

Vercel's Python runtime scans for a module exposing an ASGI `app` object.
This file re-exports the application defined in app/main.py so no code
duplication is required.
"""
from app.main import app

__all__ = ["app"]
