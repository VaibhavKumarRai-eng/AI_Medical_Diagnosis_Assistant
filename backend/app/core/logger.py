"""
System Logger Module for Enterprise AI Medical Diagnosis Assistant.

Provides structured logging utilities to both standard output and files.
"""

import os
import sys
import logging
from logging.handlers import RotatingFileHandler

# Define directories
LOG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "logs"))
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE_PATH = os.path.join(LOG_DIR, "medical_assistant_backend.log")

# Setup Formatter
LOG_FORMAT = "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d]: %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
formatter = logging.Formatter(LOG_FORMAT, datefmt=DATE_FORMAT)

# Setup Console Handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.INFO)

# Setup Rotating File Handler (10MB max per file, keep 5 backups)
file_handler = RotatingFileHandler(
    LOG_FILE_PATH,
    maxBytes=10 * 1024 * 1024,
    backupCount=5,
    encoding="utf-8"
)
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.DEBUG)

def setup_logging(default_level: int = logging.INFO) -> None:
    """Configures the root logger and assigns appropriate handlers."""
    root_logger = logging.getLogger()
    root_logger.setLevel(default_level)
    
    # Remove existing handlers to avoid double logging
    if root_logger.hasHandlers():
        root_logger.handlers.clear()
        
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    
    # Suppress verbose third-party logs
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

def get_logger(name: str) -> logging.Logger:
    """Get a named logger instance."""
    return logging.getLogger(name)

# Auto-initialize on import
setup_logging()
logger = get_logger("app.core.logger")
logger.info("Structured logging framework initialized.")
