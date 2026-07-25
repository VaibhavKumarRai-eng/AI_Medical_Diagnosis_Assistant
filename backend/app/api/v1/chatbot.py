"""
AI Medical Chatbot API Routers.

Exposes conversational endpoints to interact with the clinical virtual assistant.
"""

from typing import Any
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user_optional
from app.models.user import User
from app.schemas.chatbot import ChatRequest, ChatResponse
from app.services.chatbot import chatbot_service

router = APIRouter()


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
def chat_with_assistant(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_optional)
) -> Any:
    """Send a message to the AI Medical Assistant.
    
    If conversation_id is omitted, a new chat session is automatically initialized.
    If the user is logged in, history logs will save their transcript in the database.
    """
    user_id = current_user.id if current_user else "anonymous_guest"
    
    # Process chatbot dialogue turn
    response = chatbot_service.process_chat(
        db,
        user_id=user_id,
        message_text=request.message,
        conversation_id=request.conversation_id
    )
    
    return response
