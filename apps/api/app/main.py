from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.matches import router as matches_router
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging()
    log = get_logger("angaza.api")

    @asynccontextmanager
    async def lifespan(_: FastAPI):
        log.info("api_started", env=settings.app_env, provider=settings.ai_provider)
        yield
        log.info("api_stopped")

    app = FastAPI(title="Angaza AI API", version="0.1.0", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(matches_router)

    return app


app = create_app()
