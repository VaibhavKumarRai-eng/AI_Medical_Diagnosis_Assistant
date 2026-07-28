"""
Database Connection and Session Management Module for FastAPI.

Initializes SQLAlchemy ORM engine, declares base models, and defines
database dependency injection utilities.
"""

from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

# Configure SQLAlchemy connection arguments.
# SQLite requires 'check_same_thread: False' to permit multi-threaded FastAPI requests.
connect_args = {}
if settings.get_sqlalchemy_database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(
        settings.get_sqlalchemy_database_url,
        pool_pre_ping=True,  # Check connection health before executing queries
        connect_args=connect_args
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info("SQLAlchemy database engine initialized successfully.")
except Exception as e:
    logger.error(f"Failed to initialize database engine: {e}", exc_info=True)
    raise e

# Define base class for SQLAlchemy models
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """Dependency injection helper that yields a DB session and guarantees cleanup.
    
    Yields:
        Session: Active SQLAlchemy database session.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def migrate_tables() -> None:
    """Safely adds missing OTP columns to the users table if they are absent."""
    try:
        logger.info("Inspecting database schema for OTP column presence...")
        with engine.begin() as conn:
            # Inspect otp_code
            try:
                conn.execute(text("SELECT otp_code FROM users LIMIT 1"))
            except Exception:
                logger.info("Column 'otp_code' is missing. Executing ALTER TABLE...")
                conn.execute(text("ALTER TABLE users ADD COLUMN otp_code VARCHAR(6)"))
            
            # Inspect otp_expires_at
            try:
                conn.execute(text("SELECT otp_expires_at FROM users LIMIT 1"))
            except Exception:
                logger.info("Column 'otp_expires_at' is missing. Executing ALTER TABLE...")
                conn.execute(text("ALTER TABLE users ADD COLUMN otp_expires_at TIMESTAMP"))
        logger.info("Database schema check completed.")
    except Exception as e:
        logger.error(f"Error checking or migrating database schema: {e}", exc_info=True)

def create_tables() -> None:
    """Helper function to create all tables registered in the Base metadata and check schema updates.
    
    Useful for local SQLite testing and simple deployments.
    """
    try:
        logger.info("Initializing database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
        migrate_tables()
    except Exception as e:
        logger.error(f"Error creating database tables: {e}", exc_info=True)
        raise e
