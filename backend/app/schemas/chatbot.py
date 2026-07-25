"""
Chatbot Module Pydantic schemas.

Models chatbot interactions, message schemas, and stateful dialogues.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.prediction import PredictionResponse


class MessageCreate(BaseModel):
    """Payload representing a single user text message."""
    text: str = Field(..., min_length=1, max_length=2000)


class MessageSchema(BaseModel):
    """Dialogue exchange record."""
    id: str
    conversation_id: str
    sender: str  # 'user', 'assistant'
    text: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationResponse(BaseModel):
    """Active conversational session state containing metadata and full dialogue logs."""
    id: str
    user_id: Optional[str] = None
    summary: Optional[str] = None
    prediction_id: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    messages: List[MessageSchema] = []

    model_config = ConfigDict(from_attributes=True)


class ChatRequest(BaseModel):
    """Stateful message payload containing session context and text."""
    conversation_id: Optional[str] = Field(
        None, 
        description="ID of an active conversation session. If empty, a new session is initialized."
    )
    message: str = Field(
        ..., 
        min_length=1, 
        max_length=2000, 
        description="Conversational symptom or response by the patient"
    )


class ChatResponse(BaseModel):
    """Virtual assistant output communicating state changes and diagnosis results."""
    conversation_id: str = Field(..., description="ID of the active conversation session")
    reply: str = Field(..., description="Conversational reply text from the assistant")
    symptoms_summarized: Optional[str] = Field(None, description="Summary of symptoms collected so far")
    diagnosis_ready: bool = Field(False, description="True if the chatbot gathered sufficient details for a diagnosis")
    prediction: Optional[PredictionResponse] = Field(None, description="Resulting diagnosis payload if ready")
