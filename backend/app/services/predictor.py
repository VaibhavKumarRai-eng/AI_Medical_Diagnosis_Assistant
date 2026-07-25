"""
AI Predictor Service Module.

Orchestrates ML classification inputs, enriches results with precautions/explanations,
and manages prediction history records.
"""

from typing import Optional
from sqlalchemy.orm import Session

from app.core.constants import (
    DISEASE_METADATA,
    DEFAULT_EXPLANATION,
    DEFAULT_PRECAUTIONS
)
from app.core.logger import get_logger
from app.ml.adapter import ml_adapter
from app.models.prediction import Prediction
from app.models.history import History
from app.repositories.prediction import prediction_repository
from app.repositories.history import history_repository

logger = get_logger(__name__)


class PredictorService:
    """Service encapsulating diagnostic classification and persistence logic."""

    def predict_and_persist(
        self, db: Session, *, symptom_text: str, user_id: Optional[str] = None
    ) -> Prediction:
        """Run ML prediction on symptoms, enrich with medical advice, and persist results.
        
        Args:
            db (Session): Database transaction session.
            symptom_text (str): Conversational symptom description.
            user_id (str, optional): ID of the active user.
            
        Returns:
            Prediction: The saved SQLAlchemy model.
        """
        logger.info(f"Received symptom prediction request. User ID: {user_id or 'Anonymous'}")

        # 1. Run inference via the ML Adapter
        inference_result = ml_adapter.predict(symptom_text)
        
        # Check for model error
        if "error" in inference_result:
            logger.error(f"Inference error returned: {inference_result['error']}")
            
        disease = inference_result.get("predicted_disease", "Unknown").lower()
        confidence = inference_result.get("confidence_score", 0.0)
        top_5 = inference_result.get("top_5_predictions", [])

        # 2. Enrich prediction with static medical advice database
        meta = DISEASE_METADATA.get(disease)
        if meta:
            explanation = meta["explanation"]
            precautions = meta["precautions"]
        else:
            # Fallback for minor/unmapped disease categories
            explanation = DEFAULT_EXPLANATION.format(disease_name=disease)
            precautions = DEFAULT_PRECAUTIONS

        # 3. Create Prediction DB Record
        prediction_obj = Prediction(
            user_id=user_id,
            symptom_text=symptom_text,
            predicted_disease=disease,
            confidence_score=confidence,
            top_5_predictions=top_5,
            explanation=explanation,
            precautions=precautions
        )
        saved_prediction = prediction_repository.create(db, obj_in=prediction_obj)
        logger.info(f"Diagnosis prediction persisted. ID: {saved_prediction.id}")

        # 4. If logged-in user, link to history
        if user_id:
            history_obj = History(
                user_id=user_id,
                prediction_id=saved_prediction.id
            )
            history_repository.create(db, obj_in=history_obj)
            logger.info(f"Prediction linked to user history. User ID: {user_id}")

        return saved_prediction


# Singleton predictor service instance
predictor_service = PredictorService()
