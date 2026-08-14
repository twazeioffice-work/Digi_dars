from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Digi Dars"
    SECRET_KEY: str = "digi-dars-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = "sqlite:///./data/digi_dars.db"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
os.makedirs("data", exist_ok=True)
