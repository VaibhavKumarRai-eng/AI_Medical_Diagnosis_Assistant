"""
Prediction History Pydantic schemas.

Models user diagnostic histories and allows filtering/retrieval.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.prediction import PredictionResponse
from app.schemas.chatbot import ConversationResponse


class HistoryResponse(BaseModel):
    """Payload representing a consolidated diagnostic record."""
    id: str
    user_id: str
    prediction_id: str
    conversation_id: Optional[str] = None
    created_at: datetime
    
    # Detailed nested associations
    prediction: PredictionResponse
    conversation: Optional[ConversationResponse] = None

    model_config = ConfigDict(from_attributes=True)
