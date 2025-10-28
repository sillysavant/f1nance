from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):
    # -----------------------------
    # App Metadata
    # -----------------------------
    PROJECT_NAME: str = Field("Sunflower", env="PROJECT_NAME")
    API_V1_PREFIX: str = Field("/api/v1", env="API_V1_PREFIX")
    ENVIRONMENT: str = Field(
        "development", env="ENVIRONMENT"
    )  # development | staging | production
    LOG_LEVEL: str = Field("INFO", env="LOG_LEVEL")

    # -----------------------------
    # Server
    # -----------------------------
    HOST: str = Field("0.0.0.0", env="HOST")
    PORT: int = Field(8000, env="PORT")
    RELOAD: bool = Field(True, env="RELOAD")

    # -----------------------------
    # Database
    # -----------------------------
    DB_USER: str = Field(..., env="DB_USER")
    DB_PASSWORD: str = Field(..., env="DB_PASSWORD")
    DB_HOST: str = Field(..., env="DB_HOST")
    DB_PORT: int = Field(..., env="DB_PORT")
    DB_NAME: str = Field(..., env="DB_NAME")

    @property
    def DATABASE_URL(self) -> str:
        """Sync SQLAlchemy connection string."""
        return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        """Async SQLAlchemy connection string (if using async ORM)."""
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # -----------------------------
    # Security / Authentication
    # -----------------------------
    JWT_SECRET_KEY: str = Field(..., env="JWT_SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    JWT_ALGORITHM: str = Field("HS256", env="JWT_ALGORITHM")

    # -----------------------------
    # Email Verification
    # -----------------------------
    EMAIL_VERIFY_TOKEN_EXPIRE_MINUTES: int = Field(
        30, env="EMAIL_VERIFY_TOKEN_EXPIRE_MINUTES"
    )
    FRONTEND_URL: str = Field("http://localhost:3000", env="FRONTEND_URL")

    # -----------------------------
    # CORS & API
    # -----------------------------
    ALLOWED_ORIGINS: list[str] = Field(
        ["http://localhost", "http://localhost:3000"], env="ALLOWED_ORIGINS"
    )

    # -----------------------------
    # Redis / Caching / Task Queue
    # -----------------------------
    REDIS_URL: str = Field("redis://localhost:6379/0", env="REDIS_URL")

    # -----------------------------
    # Email / Notifications
    # -----------------------------
    ENABLE_EMAILS: bool = Field(True, env="ENABLE_EMAILS")
    EMAIL_FROM: str = Field("no-reply@sunflower.app", env="EMAIL_FROM")
    SMTP_HOST: str = Field("smtp.gmail.com", env="SMTP_HOST")
    SMTP_PORT: int = Field(587, env="SMTP_PORT")
    SMTP_USER: str = Field(..., env="SMTP_USER")
    SMTP_PASSWORD: str = Field(..., env="SMTP_PASSWORD")
    USE_TLS: bool = Field(True, env="USE_TLS")

    # -----------------------------
    # Utility Methods
    # -----------------------------
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"

    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    def is_staging(self) -> bool:
        return self.ENVIRONMENT.lower() == "staging"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Cache settings instance for performance."""
    return Settings()


settings = get_settings()
