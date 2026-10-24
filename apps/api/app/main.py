import os as _os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.agents import router as agents_router
from app.api.agents_stats import router as agents_stats_router
from app.api.auth import router as auth_router
from app.api.health import router as health_router
from app.api.live import router as live_router
from app.api.matches import router as matches_router
from app.api.oauth import router as oauth_router
from app.api.password import router as password_router
from app.api.scenarios import router as scenarios_router
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    configure_logging()
    log = get_logger("angaza.api")

    if _os.getenv("RUN_MIGRATIONS", "").lower() in {"1", "true", "yes"}:
        try:
            from alembic import command as _alembic_command
            from alembic.config import Config as _AlembicConfig

            cfg = _AlembicConfig("alembic.ini")
            _alembic_command.upgrade(cfg, "head")
            log.info("migrations_applied")
        except Exception as exc:  # pragma: no cover - startup path
            log.error("migrations_failed", error=str(exc))

    log.info("api_started", env=settings.app_env, provider=settings.ai_provider)
    yield


def create_app() -> FastAPI:
    app = FastAPI(title="AngazaBol API", version="0.1.0", lifespan=lifespan)

    allowed = ["http://localhost:3000"]
    extra = _os.getenv("CORS_ORIGINS", "")
    if extra:
        allowed.extend([o.strip() for o in extra.split(",") if o.strip()])

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(matches_router)
    app.include_router(agents_router)
    app.include_router(agents_stats_router)
    app.include_router(auth_router)
    app.include_router(scenarios_router)
    app.include_router(oauth_router)
    app.include_router(password_router)
    app.include_router(live_router)

    return app


app = create_app()
