import os
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "XYZ Social AI SaaS")
    API_V1_PREFIX: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./xyz_local.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "xyz-super-secret-development-key-change-in-production")
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "xyz-aes256-encryption-key-for-provider-tokens")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY", None)
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    STORAGE_LOCAL_DIR: str = os.getenv("STORAGE_LOCAL_DIR", "./storage_uploads")
    ALLOWED_ORIGINS: List[str] = [
        o.strip() for o in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",") if o.strip()
    ]

settings = Settings()
