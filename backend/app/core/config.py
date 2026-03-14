import os
from functools import lru_cache


class Settings:
    """Application settings loaded from environment variables."""

    project_name: str
    api_v1_prefix: str
    database_url: str
    cors_origins: list[str]

    def __init__(self) -> None:
        self.project_name = os.getenv("PROJECT_NAME", "Operix")
        self.api_v1_prefix = os.getenv("API_V1_PREFIX", "/api/v1")
        self.database_url = os.getenv(
            "DATABASE_URL",
            "postgresql+psycopg://postgres:postgres@localhost:5432/procurement",
        )

        raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
        self.cors_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached app settings instance."""
    return Settings()
