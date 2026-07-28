"""
Enterprise Logging Module for AI Medical Diagnosis Assistant.

Provides structured logging setup with console and rotating file handlers
to record prediction requests, model training execution times, artifact loading,
warnings, and system runtime errors.

Author: AI Medical Diagnosis Engineering Team
Language: Python 3.12+
Style Standard: PEP8, Type Hints, Structured Logging
"""

import os
import sys
import logging
from logging.handlers import RotatingFileHandler
from typing import Optional, Dict, Any

try:
    from ml.config import config
except ImportError as e:
    if getattr(e, 'name', None) == 'ml':
        from config import config
    else:
        raise


def get_logger(name: str = "medical_assistant") -> logging.Logger:
    """Create or retrieve a configured Logger instance.
    
    Args:
        name (str): Logger module name prefix.
        
    Returns:
        logging.Logger: Configured logger with console and file handlers.
    """
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    # Prevent duplicate handlers if already initialized
    if logger.handlers:
        return logger

    # Ensure log output directory exists
    config.ensure_directories_exist()

    # Formatter definition
    log_format = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [%(name)s] [PID:%(process)d]: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )

    # 1. Console Stream Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(log_format)
    logger.addHandler(console_handler)

    # 2. Rotating File Handler (10MB per file, max 5 backups)
    try:
        file_handler = RotatingFileHandler(
            filename=config.LOG_FILE_PATH,
            maxBytes=10 * 1024 * 1024,
            backupCount=5,
            encoding="utf-8"
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(log_format)
        logger.addHandler(file_handler)
    except Exception as e:
        logger.warning(f"Could not initialize file log handler at '{config.LOG_FILE_PATH}': {e}")

    return logger


# Structured Logging Helper Functions
def log_prediction_request(
    logger: logging.Logger,
    symptom_text: str,
    predicted_disease: str,
    confidence_score: float,
    latency_ms: float
) -> None:
    """Log an incoming prediction inference request and response summary."""
    logger.info(
        f"[PREDICTION] Input: '{symptom_text[:60]}...' | "
        f"Predicted: '{predicted_disease}' | "
        f"Confidence: {confidence_score:.4f} | "
        f"Latency: {latency_ms:.2f}ms"
    )


def log_training_event(
    logger: logging.Logger,
    model_name: str,
    status: str,
    duration_sec: Optional[float] = None,
    metrics: Optional[Dict[str, float]] = None
) -> None:
    """Log model training execution milestones and performance metrics."""
    msg = f"[TRAINING] Model: {model_name} | Status: {status}"
    if duration_sec is not None:
        msg += f" | Duration: {duration_sec:.2f}s"
    if metrics:
        formatted_metrics = ", ".join(f"{k}: {v:.4f}" for k, v in metrics.items())
        msg += f" | Metrics: {{{formatted_metrics}}}"
    logger.info(msg)


def log_artifact_event(
    logger: logging.Logger,
    action: str,
    artifact_name: str,
    filepath: str
) -> None:
    """Log model/vectorizer loading and saving events."""
    logger.info(f"[ARTIFACT] Action: {action} | Item: {artifact_name} | Path: '{filepath}'")


# Main execution test
if __name__ == "__main__":
    test_logger = get_logger("logger_smoke_test")
    test_logger.info("Testing Enterprise Logger Module...")
    log_prediction_request(test_logger, "chest pain shortness of breath", "Panic Disorder", 0.9421, 12.4)
    log_training_event(test_logger, "XGBoost Classifier", "COMPLETED", 4.12, {"accuracy": 0.965, "f1_score": 0.963})
    log_artifact_event(test_logger, "SAVE", "Model Pickle", config.MODEL_PATH)
