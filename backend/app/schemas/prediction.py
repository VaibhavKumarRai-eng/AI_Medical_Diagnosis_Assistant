"""
AI Disease Prediction Pydantic schemas.

Validates input symptom checks and encapsulates ML pipeline inference outputs.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class PredictionRequest(BaseModel):
    """Payload representing patient symptoms sent for ML diagnosis."""
    symptom_text: str = Field(
        ..., 
        min_length=10, 
        max_length=5000, 
        description="Conversational symptom description of the patient",
        examples=["I have a severe headache, nausea, and sensitivity to bright lights since yesterday."]
    )


class PredictionCandidate(BaseModel):
    """A single candidate disease classification entry."""
    disease: str = Field(..., description="Name of the candidate disease class")
    probability: float = Field(..., description="Estimated probability score (0.0 to 1.0)")


class PredictionResponse(BaseModel):
    """Complete serialized model containing ML prediction outputs and clinical advice."""
    id: str
    user_id: Optional[str] = None
    symptom_text: str
    predicted_disease: str
    confidence_score: float
    top_5_predictions: List[PredictionCandidate]
    explanation: str
    precautions: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
