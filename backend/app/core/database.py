"""
Database Connection and Session Management Module for FastAPI.

Initializes SQLAlchemy ORM engine, declares base models, and defines
database dependency injection utilities.
"""

from typing import Generator
from sqlalchemy import create_engine
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

def create_tables() -> None:
    """Helper function to create all tables registered in the Base metadata.
    
    Useful for local SQLite testing and simple deployments.
    """
    try:
        logger.info("Initializing database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}", exc_info=True)
        raise e
