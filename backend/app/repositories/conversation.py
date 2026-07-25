"""
Conversation and Message Repository Module.

Handles DB transactions for conversational chatbot structures.
"""

from typing import List, Optional
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.conversation import Conversation, Message


class ConversationRepository(BaseRepository[Conversation]):
    """Repository class for DB actions on chatbot conversations and messages."""

    def __init__(self) -> None:
        super().__init__(Conversation)

    def get_active_by_user(self, db: Session, *, user_id: str) -> Optional[Conversation]:
        """Fetch the current active conversation session for a user.
        
        Args:
            db (Session): Database transaction session.
            user_id (str): User ID.
            
        Returns:
            Conversation | None: Active conversation instance, if any.
        """
        query = (
            select(self.model)
            .where(self.model.user_id == user_id, self.model.is_active == True)
            .order_by(self.model.updated_at.desc())
        )
        return db.scalar(query)

    def create_message(
        self, db: Session, *, conversation_id: str, sender: str, text: str
    ) -> Message:
        """Create and persist a dialogue message in the conversation.
        
        Args:
            db (Session): Database transaction session.
            conversation_id (str): Target conversation ID.
            sender (str): Message author ('user' or 'assistant').
            text (str): Dialogue content.
            
        Returns:
            Message: Saved Message model.
        """
        import datetime
        now_time = datetime.datetime.now(datetime.timezone.utc)

        # Save message
        message = Message(
            conversation_id=conversation_id,
            sender=sender,
            text=text,
            created_at=now_time
        )
        db.add(message)
        
        # Touch conversation updated_at timestamp
        conv = db.get(self.model, conversation_id)
        if conv:
            conv.updated_at = now_time
            db.add(conv)
            
        db.commit()
        db.refresh(message)
        return message

    def deactivate(self, db: Session, *, conversation_id: str) -> Optional[Conversation]:
        """Deactivate a conversation session.
        
        Args:
            db (Session): Database transaction session.
            conversation_id (str): Conversation ID.
            
        Returns:
            Conversation | None: The deactivated conversation.
        """
        conv = db.get(self.model, conversation_id)
        if conv:
            conv.is_active = False
            db.add(conv)
            db.commit()
            db.refresh(conv)
        return conv


# Singleton conversation repository instance
conversation_repository = ConversationRepository()
