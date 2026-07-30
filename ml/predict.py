"""
Production Prediction Inference Engine for Enterprise AI Medical Diagnosis Assistant.

This module provides high-performance, real-time disease prediction from natural language
symptom descriptions. It loads serialized model artifacts, pre-processes symptom input,
extracts vector features, and returns top predicted diseases with confidence scores.

Author: AI Medical Diagnosis Engineering Team
Language: Python 3.12+
Style Standard: PEP8, Type Hints, Structured Logging
"""

import time
import logging
from typing import Dict, Any, List, Optional, Tuple
import numpy as np

try:
    from ml.config import config
    from ml.logger import get_logger, log_prediction_request, log_artifact_event
    from ml.preprocessing import MedicalTextPreprocessor
    from ml.utils import load_artifact
except ImportError as e:
    if getattr(e, 'name', None) == 'ml':
        from config import config
        from logger import get_logger, log_prediction_request, log_artifact_event
        from preprocessing import MedicalTextPreprocessor
        from utils import load_artifact
    else:
        raise

logger = get_logger(__name__)


class DiseasePredictor:
    """Production Inference Engine for Disease Prediction from Symptom Texts.
    
    Attributes:
        model_path (str): Path to serialized trained classifier model (.pkl).
        vectorizer_path (str): Path to serialized TF-IDF vectorizer (.pkl).
        label_encoder_path (str): Path to serialized LabelEncoder (.pkl).
    """

    def __init__(
        self,
        model_path: Optional[str] = None,
        vectorizer_path: Optional[str] = None,
        label_encoder_path: Optional[str] = None
    ) -> None:
        """Initialize DiseasePredictor and load serialized model artifacts."""
        self.model_path = model_path or config.MODEL_PATH
        self.vectorizer_path = vectorizer_path or config.VECTORIZER_PATH
        self.label_encoder_path = label_encoder_path or config.LABEL_ENCODER_PATH

        self.preprocessor = MedicalTextPreprocessor(lemmatize=True)
        self.model = None
        self.vectorizer = None
        self.label_encoder = None
        
        self.load_artifacts()

    def load_artifacts(self) -> None:
        """Load model, vectorizer, and label encoder artifacts from disk."""
        logger.info("Loading production disease diagnosis artifacts...")
        self.model = load_artifact(self.model_path, "Trained Model")
        self.vectorizer = load_artifact(self.vectorizer_path, "TF-IDF Vectorizer")
        self.label_encoder = load_artifact(self.label_encoder_path, "Label Encoder")
        logger.info("All inference artifacts successfully loaded into memory.")

    def _softmax(self, x: np.ndarray) -> np.ndarray:
        """Compute softmax values for raw decision function scores."""
        e_x = np.exp(x - np.max(x, axis=-1, keepdims=True))
        return e_x / np.sum(e_x, axis=-1, keepdims=True)

    def predict(self, symptom_text: str, top_k: int = 5) -> Dict[str, Any]:
        """Predict the most probable diseases for a given symptom text description.
        
        Args:
            symptom_text (str): Free-text natural language symptom description.
            top_k (int): Number of top candidate predictions to return. Defaults to 5.
            
        Returns:
            Dict[str, Any]: Prediction result payload:
                - predicted_disease (str): Top predicted disease name.
                - confidence_score (float): Confidence score between 0.0 and 1.0.
                - top_5_predictions (List[Dict[str, float]]): List of top K predictions.
                - probability_scores (Dict[str, float]): Map of all disease classes to probabilities.
                - preprocessed_text (str): Cleaned symptom text string.
                - latency_ms (float): Execution latency in milliseconds.
        """
        start_time = time.time()
        
        # 1. Input Validation
        if not symptom_text or not isinstance(symptom_text, str) or not symptom_text.strip():
            logger.warning("Empty or invalid symptom text received for prediction.")
            return {
                "error": "Invalid input text. Symptom description must be a non-empty string.",
                "predicted_disease": "Unknown",
                "confidence_score": 0.0,
                "top_5_predictions": [],
                "probability_scores": {},
                "preprocessed_text": "",
                "latency_ms": 0.0
            }

        try:
            # 2. Preprocess Symptom Text
            cleaned_text = self.preprocessor.preprocess_text(symptom_text)
            
            if not cleaned_text:
                cleaned_text = symptom_text.lower().strip()

            # 3. Extract TF-IDF Features
            X_feat = self.vectorizer.transform([cleaned_text])

            if X_feat.nnz == 0:
                logger.warning(f"No clinical symptoms recognized in input text: '{symptom_text}'")
                return {
                    "error": "Sorry, you didn't mention any symptoms. Please try describing specific symptoms (e.g. fever, headache, cough).",
                    "predicted_disease": "Unknown",
                    "confidence_score": 0.0,
                    "top_5_predictions": [],
                    "probability_scores": {},
                    "preprocessed_text": cleaned_text,
                    "latency_ms": 0.0
                }

            # 4. Model Inference Probability Estimation
            if hasattr(self.model, "predict_proba"):
                probs = self.model.predict_proba(X_feat)[0]
            elif hasattr(self.model, "decision_function"):
                scores = self.model.decision_function(X_feat)[0]
                probs = self._softmax(scores)
            else:
                pred_idx = self.model.predict(X_feat)[0]
                probs = np.zeros(len(self.label_encoder.classes_))
                probs[pred_idx] = 1.0

            # 5. Extract Top-K Candidate Predictions
            sorted_indices = np.argsort(probs)[::-1]
            classes = self.label_encoder.classes_

            top_disease = str(classes[sorted_indices[0]])
            top_confidence = round(float(probs[sorted_indices[0]]), 4)

            top_k_predictions: List[Dict[str, Any]] = []
            for i in range(min(top_k, len(classes))):
                idx = sorted_indices[i]
                top_k_predictions.append({
                    "disease": str(classes[idx]),
                    "probability": round(float(probs[idx]), 4)
                })

            # Full class probability mapping dictionary
            probability_scores = {
                str(classes[idx]): round(float(probs[idx]), 4)
                for idx in sorted_indices
            }

            elapsed_ms = (time.time() - start_time) * 1000.0

            # 6. Structured Logging
            log_prediction_request(logger, symptom_text, top_disease, top_confidence, elapsed_ms)

            return {
                "predicted_disease": top_disease,
                "confidence_score": top_confidence,
                "top_5_predictions": top_k_predictions,
                "probability_scores": probability_scores,
                "preprocessed_text": cleaned_text,
                "latency_ms": round(elapsed_ms, 2)
            }

        except Exception as e:
            logger.error(f"Error during disease prediction inference: {e}", exc_info=True)
            return {
                "error": f"Inference pipeline error: {str(e)}",
                "predicted_disease": "Error",
                "confidence_score": 0.0,
                "top_5_predictions": [],
                "probability_scores": {},
                "preprocessed_text": "",
                "latency_ms": 0.0
            }


# Singleton Predictor Instance
_predictor_instance: Optional[DiseasePredictor] = None


def predict_disease(symptom_text: str) -> Dict[str, Any]:
    """Production top-level function for predicting diseases from symptom text.
    
    Args:
        symptom_text (str): Symptom description text string.
        
    Returns:
        Dict[str, Any]: Diagnostic prediction dictionary.
    """
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = DiseasePredictor()
    return _predictor_instance.predict(symptom_text)


if __name__ == "__main__":
    logger.info("Executing DiseasePredictor CLI demo...")
    sample_symptom = "Patient reports severe chest pain, shortness of breath, dizziness, and palpitations."
    print(f"\nQUERY SYMPTOM: '{sample_symptom}'")
    
    try:
        response = predict_disease(sample_symptom)
        print("\nDIAGNOSIS INFERENCE RESULT:")
        print(f"Top Disease       : {response.get('predicted_disease')}")
        print(f"Confidence Score  : {response.get('confidence_score')}")
        print(f"Latency           : {response.get('latency_ms')} ms")
        print("\nTop 5 Predictions:")
        for pred in response.get("top_5_predictions", []):
            print(f" - {pred['disease']}: {pred['probability'] * 100:.2f}%")
    except Exception as err:
        logger.warning(f"Demo prediction ran prior to full model file persistence ({err}).")
