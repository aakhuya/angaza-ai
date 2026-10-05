from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    app_secret_key: str = "dev-only"

    database_url: str = "sqlite:///./angaza.db"

    ai_provider: str = "mock"
    deepseek_api_key: str = ""
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-chat"
    foundry_endpoint: str = ""
    foundry_api_key: str = ""

    match_seed: int = 42
    match_scenario: str = "balanced"
    match_tick_seconds: float = 1.0

    jwt_secret: str = "dev-only"
    jwt_access_ttl_minutes: int = 30
    jwt_refresh_ttl_days: int = 14

    @property
    def is_dev(self) -> bool:
        return self.app_env == "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()
