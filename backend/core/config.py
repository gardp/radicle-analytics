"""Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings

# local db url: DATABASE_URL: str = "postgresql+asyncpg://localhost:5432/radicle_analytics"
class Settings(BaseSettings):
    """Runtime configuration injected via environment variables.
 
    Attributes:
        DATABASE_URL: Async SQLAlchemy DSN (Supabase connection string).
        APP_PASSWORD: Single password required to log into the UI.
        APP_TOKEN_SECRET: Static bearer token returned after login.
        FRONTEND_URL: Base URL of the deployed React app (used for docs/meta).
        CORS_ORIGINS: Comma-separated list of allowed origins.
    """
    DATABASE_URL: str = "postgresql+asyncpg://localhost:5432/radicle_analytics"
    APP_PASSWORD: str = "changeme"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    APP_TOKEN_SECRET: str = "radicle-static-token-change-in-production"

    @cached_property
    def cors_origin_list(self) -> list[str]:
        """Return sanitized origins for CORSMiddleware."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
