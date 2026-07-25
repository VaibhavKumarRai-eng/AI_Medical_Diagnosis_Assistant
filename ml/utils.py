"""
Utility Functions Module for AI Medical Diagnosis Assistant.

Provides reusable helper functions for artifact serialization (joblib/json),
label encoding persistence, directory management, and metric reporting tables.

Author: AI Medical Diagnosis Engineering Team
Language: Python 3.12+
Style Standard: PEP8, Type Hints, Robust Exception Handling
"""

import os
import json
import logging
from typing import Any, Dict, Optional, List
import pandas as pd
import joblib

try:
    from ml.logger import get_logger, log_artifact_event
    from ml.config import config
except ImportError:
    from logger import get_logger, log_artifact_event
    from config import config

logger = get_logger(__name__)


def save_artifact(obj: Any, filepath: str, artifact_name: str = "Artifact") -> None:
    """Serialize and save a Python object to disk using joblib.
    
    Args:
        obj (Any): Object to serialize (Model, Vectorizer, Encoder).
        filepath (str): Physical path to write file.
        artifact_name (str): Human-readable artifact name for logging.
    """
    try:
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        joblib.dump(obj, filepath)
        log_artifact_event(logger, "SAVE", artifact_name, filepath)
    except Exception as e:
        logger.error(f"Failed to save {artifact_name} to '{filepath}': {e}", exc_info=True)
        raise IOError(f"Could not write artifact to {filepath}") from e


def load_artifact(filepath: str, artifact_name: str = "Artifact") -> Any:
    """Load and deserialize a Python object from disk using joblib.
    
    Args:
        filepath (str): Physical path to read file.
        artifact_name (str): Human-readable artifact name for logging.
        
    Returns:
        Any: Loaded Python object.
    """
    if not os.path.exists(filepath):
        logger.error(f"Artifact file missing: '{filepath}'")
        raise FileNotFoundError(f"{artifact_name} file not found at '{filepath}'")

    try:
        obj = joblib.load(filepath)
        log_artifact_event(logger, "LOAD", artifact_name, filepath)
        return obj
    except Exception as e:
        logger.error(f"Failed to load {artifact_name} from '{filepath}': {e}", exc_info=True)
        raise IOError(f"Could not read artifact from {filepath}") from e


def save_json(data: Dict[str, Any], filepath: str) -> None:
    """Save a Python dictionary as a formatted JSON file.
    
    Args:
        data (Dict[str, Any]): Data dictionary.
        filepath (str): File destination path.
    """
    try:
        os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, default=str)
        log_artifact_event(logger, "SAVE", "JSON Configuration", filepath)
    except Exception as e:
        logger.error(f"Failed to save JSON to '{filepath}': {e}", exc_info=True)
        raise


def load_json(filepath: str) -> Dict[str, Any]:
    """Load a JSON file into a Python dictionary.
    
    Args:
        filepath (str): File source path.
        
    Returns:
        Dict[str, Any]: Loaded dictionary data.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"JSON file not found at '{filepath}'")

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
        log_artifact_event(logger, "LOAD", "JSON Configuration", filepath)
        return data
    except Exception as e:
        logger.error(f"Failed to load JSON from '{filepath}': {e}", exc_info=True)
        raise


def format_metrics_table(results_dict: Dict[str, Dict[str, float]]) -> pd.DataFrame:
    """Convert model comparison results dictionary into a clean pandas DataFrame.
    
    Args:
        results_dict (Dict[str, Dict[str, float]]): Mapping of model names to metric dicts.
        
    Returns:
        pd.DataFrame: Formatted metrics summary table sorted by F1-Score / Accuracy.
    """
    df = pd.DataFrame.from_dict(results_dict, orient="index")
    if "f1_score" in df.columns:
        df = df.sort_values(by="f1_score", ascending=False)
    elif "accuracy" in df.columns:
        df = df.sort_values(by="accuracy", ascending=False)
    return df


if __name__ == "__main__":
    logger.info("Executing Utils module smoke test...")
    sample_data = {"version": "1.0.0", "status": "active"}
    test_json_path = os.path.join(config.MODEL_DIR, "test_config.json")
    save_json(sample_data, test_json_path)
    loaded_data = load_json(test_json_path)
    if os.path.exists(test_json_path):
        os.remove(test_json_path)
    logger.info("Utils smoke test completed successfully.")
