"""Centralized application settings (FastAPI backend).

Provides typed access to runtime configuration so every deployment target
only needs to supply environment variables once.
"""

from functools import cached_property

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Runtime configuration injected via environment variables."""

    DATABASE_URL: str
    APP_PASSWORD: str
    APP_TOKEN_SECRET: str
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    @cached_property
    def cors_origin_list(self) -> list[str]:
        """Return sanitized origins for CORSMiddleware."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
