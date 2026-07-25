"""
System-wide configuration settings for Enterprise AI Medical Diagnosis Assistant.

Loads configuration parameters from environment variables and provides sensible defaults.
Uses pydantic settings or standard environment resolution.
"""

import os
from typing import List, Union
from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Enterprise AI Medical Diagnosis Assistant"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"  # development, staging, production

    # CORS Settings
    # Accepts comma-separated list of hosts or *
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    # Security Settings
    # Generate a secure key in production using: openssl rand -hex 32
    SECRET_KEY: str = os.getenv("SECRET_KEY", "prod_grade_default_secret_key_change_me_in_production_123456789")
    REFRESH_SECRET_KEY: str = os.getenv("REFRESH_SECRET_KEY", "prod_grade_default_refresh_secret_key_change_me_in_production_987654321")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database Settings
    # Defaults to local SQLite if POSTGRES_URL is not set
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./medical_assistant.db"
    )

    # ML Pipeline Settings
    # Automatically references the root-level models directory
    MODEL_PATH: str = os.getenv(
        "MODEL_PATH",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "models", "model.pkl"))
    )
    VECTORIZER_PATH: str = os.getenv(
        "VECTORIZER_PATH",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "models", "vectorizer.pkl"))
    )
    LABEL_ENCODER_PATH: str = os.getenv(
        "LABEL_ENCODER_PATH",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "models", "label_encoder.pkl"))
    )
    MODEL_CONFIG_PATH: str = os.getenv(
        "MODEL_CONFIG_PATH",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "models", "config.json"))
    )

    # LLM & Chatbot Provider Settings
    # Supported: "mock", "gemini", "openai", "claude", "llama"
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "mock")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    CLAUDE_API_KEY: str = os.getenv("CLAUDE_API_KEY", "")

    # Core System Admins
    FIRST_ADMIN_EMAIL: str = os.getenv("FIRST_ADMIN_EMAIL", "admin@medical-assistant.com")
    FIRST_ADMIN_PASSWORD: str = os.getenv("FIRST_ADMIN_PASSWORD", "AdminPass123!")

    @property
    def get_sqlalchemy_database_url(self) -> str:
        """Helper to ensure DB URLs with postgres:// are corrected to postgresql:// for SQLAlchemy."""
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url

    class Config:
        env_file = ".env"
        case_sensitive = True


# Initialize settings
settings = Settings()
