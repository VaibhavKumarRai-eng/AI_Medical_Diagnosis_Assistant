"""
Disease Prediction API Routers.

Exposes endpoints to query the machine learning inference model.
"""

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user_optional
from app.models.user import User
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.predictor import predictor_service

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
def predict_symptoms(
    request: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
) -> Any:
    """Analyze natural language symptom descriptions and predict potential medical conditions.
    
    If query is sent by an authenticated user, it will be automatically saved to their
    history.
    """
    user_id = current_user.id if current_user else None
    
    # Delegate prediction execution to service layer
    prediction = predictor_service.predict_and_persist(
        db, 
        symptom_text=request.symptom_text, 
        user_id=user_id
    )
    
    if hasattr(prediction, "error") and getattr(prediction, "error"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=prediction.error
        )
        
    return prediction
