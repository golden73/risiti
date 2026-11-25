from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    DATABASE_URL: str = (
        "postgresql+psycopg://postgres:PASSWORD@HOST:5432/postgres?sslmode=require"
    )
    POINTS_PER_RECEIPT: int = 10
    MIN_RECEIPT_AMOUNT: float = 20.0
    DAILY_POINTS_CAP: int = 50
    TURNOVER_TAX_RATE: float = 0.05
    ADMIN_TOKEN: str = "dev-admin-token"
    CORS_ORIGINS: str = "*"


settings = Settings()
