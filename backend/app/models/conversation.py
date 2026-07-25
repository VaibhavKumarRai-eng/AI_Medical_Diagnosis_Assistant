"""
SQLAlchemy Conversation and Message Models.

Utilizes SQLAlchemy 2.0 Mapped type annotations. Defines stateful chat logs
used by the AI Medical Chatbot.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.prediction import Prediction
    from app.models.history import History


class Conversation(Base):
    """Conversation DB Model tracking a stateful dialogue session with the chatbot."""
    
    __tablename__ = "conversations"

    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[Optional[str]] = mapped_column(
        String(36), 
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    summary: Mapped[Optional[str]] = mapped_column(
        Text, 
        nullable=True  # Summarized symptoms collected so far
    )
    prediction_id: Mapped[Optional[str]] = mapped_column(
        String(36), 
        ForeignKey("predictions.id", ondelete="SET NULL"),
        nullable=True
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, 
        default=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User", 
        back_populates="conversations"
    )
    messages: Mapped[List["Message"]] = relationship(
        "Message", 
        back_populates="conversation", 
        cascade="all, delete-orphan",
        order_by="Message.created_at"
    )
    history_record: Mapped[Optional["History"]] = relationship(
        "History", 
        back_populates="conversation", 
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Conversation id={self.id} is_active={self.is_active}>"


class Message(Base):
    """Message DB Model storing individual lines of dialogue."""
    
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    conversation_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False
    )
    sender: Mapped[str] = mapped_column(
        String(50), 
        nullable=False  # 'user', 'assistant'
    )
    text: Mapped[str] = mapped_column(
        Text, 
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    conversation: Mapped["Conversation"] = relationship(
        "Conversation", 
        back_populates="messages"
    )

    def __repr__(self) -> str:
        return f"<Message sender={self.sender} text={self.text[:20]}...>"
