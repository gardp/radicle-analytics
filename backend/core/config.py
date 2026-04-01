"""Application settings loaded from environment variables."""

from pydantic_settings import BaseSettings

# local db url: DATABASE_URL: str = "postgresql+asyncpg://localhost:5432/radicle_analytics"
class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://localhost:5432/radicle_analytics"
    APP_PASSWORD: str = "changeme"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    APP_TOKEN_SECRET: str = "radicle-static-token-change-in-production"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
