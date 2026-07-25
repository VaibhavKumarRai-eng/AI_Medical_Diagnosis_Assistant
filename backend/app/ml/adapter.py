"""
Machine Learning Pipeline Adapter.

Integrates the FastAPI backend with the pre-existing Clinical NLP
and Machine Learning classification code located in the root of the project.
"""

import os
import sys
from typing import Dict, Any, Optional

from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)

# Add parent workspace root to Python path to import standard ML module
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)
    logger.debug(f"Added workspace root to path: {WORKSPACE_ROOT}")

try:
    from ml.predict import DiseasePredictor
    logger.info("Successfully imported DiseasePredictor from root ML module.")
except ImportError as err:
    logger.critical(
        f"Critical import failure: ML module could not be loaded from root directory ({err}). "
        f"Ensure Python path is correct and dependencies are installed."
    )
    raise err


class MLAdapter:
    """Adapter class wrapping the pre-existing ML Prediction pipeline."""

    def __init__(self) -> None:
        """Initialize the adapter and load models into memory."""
        try:
            logger.info("Initializing ML model inference adapter...")
            # Instantiate DiseasePredictor pointing to paths configured in settings
            self.predictor = DiseasePredictor(
                model_path=settings.MODEL_PATH,
                vectorizer_path=settings.VECTORIZER_PATH,
                label_encoder_path=settings.LABEL_ENCODER_PATH
            )
            logger.info("ML model inference adapter successfully loaded.")
        except Exception as e:
            logger.error(f"Error loading ML predictor artifacts inside adapter: {e}", exc_info=True)
            self.predictor = None

    def predict(self, symptom_text: str) -> Dict[str, Any]:
        """Call the underlying ML model to predict diseases from symptom text.
        
        Args:
            symptom_text (str): Conversational patient symptoms.
            
        Returns:
            Dict[str, Any]: Classification details.
        """
        if not self.predictor:
            logger.error("Predictor not initialized. Returning fallback error.")
            return {
                "error": "ML Inference Engine is currently unavailable.",
                "predicted_disease": "Unknown",
                "confidence_score": 0.0,
                "top_5_predictions": [],
                "probability_scores": {},
                "preprocessed_text": "",
                "latency_ms": 0.0
            }
        
        return self.predictor.predict(symptom_text)

    def get_model_metadata(self) -> Dict[str, Any]:
        """Retrieve model training statistics and model version details for admins.
        
        Returns:
            Dict[str, Any]: Metadata config dict.
        """
        # Read from model config.json if available
        import json
        if os.path.exists(settings.MODEL_CONFIG_PATH):
            try:
                with open(settings.MODEL_CONFIG_PATH, "r") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to read model config.json: {e}")
        
        # Fallback metadata
        return {
            "best_model_name": "Multinomial Naive Bayes (Fallback)",
            "train_accuracy": 0.8427,
            "feature_count": 5000,
            "random_seed": 42
        }


# Global adapter singleton
ml_adapter = MLAdapter()
