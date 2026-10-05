from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging()
    log = get_logger("angaza.api")

    app = FastAPI(title="Angaza AI API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)

    @app.on_event("startup")
    async def _startup() -> None:
        log.info("api_started", env=settings.app_env, provider=settings.ai_provider)

    return app


app = create_app()
