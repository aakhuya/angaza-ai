import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.agents import router as agents_router
from app.api.auth import router as auth_router
from app.api.health import router as health_router
from app.api.matches import router as matches_router
from app.api.oauth import router as oauth_router
from app.api.password import router as password_router
from app.api.scenarios import router as scenarios_router
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger


def _cors_origins() -> list[str]:
    """Explicit origins plus any comma-separated extras from CORS_ORIGINS."""
    origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
    extra = os.getenv("CORS_ORIGINS", "")
    if extra:
        origins.extend(o.strip() for o in extra.split(",") if o.strip())
    return origins


def _mount_uploads(app: FastAPI) -> None:
    """Serve user-uploaded avatars from the UPLOAD_DIR directory."""
    uploads = Path(os.getenv("UPLOAD_DIR", "./uploads"))
    uploads.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads), name="uploads")


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging()
    log = get_logger("angaza.api")

    app = FastAPI(title="Angaza AI API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=_cors_origins(),
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(matches_router)
    app.include_router(agents_router)
    app.include_router(auth_router)
    app.include_router(scenarios_router)
    app.include_router(oauth_router)
    app.include_router(password_router)

    _mount_uploads(app)

    @app.on_event("startup")
    async def _startup() -> None:
        if os.getenv("RUN_MIGRATIONS", "").lower() in {"1", "true", "yes"}:
            try:
                from alembic import command as alembic_command
                from alembic.config import Config as AlembicConfig

                cfg = AlembicConfig("alembic.ini")
                alembic_command.upgrade(cfg, "head")
                log.info("migrations_applied")
            except Exception as exc:  # pragma: no cover
                log.error("migrations_failed", error=str(exc))

        log.info("api_started", env=settings.app_env, provider=settings.ai_provider)

    return app


app = create_app()
