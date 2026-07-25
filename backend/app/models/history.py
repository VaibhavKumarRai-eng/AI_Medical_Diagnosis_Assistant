"""
SQLAlchemy History Model for consolidated user history table.

Utilizes SQLAlchemy 2.0 Mapped type annotations. Represents audit logs of
user symptom checks.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.prediction import Prediction
    from app.models.conversation import Conversation


class History(Base):
    """History DB Model grouping a diagnosis prediction and an optional chat session."""
    
    __tablename__ = "histories"

    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )
    prediction_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("predictions.id", ondelete="CASCADE"),
        nullable=False
    )
    conversation_id: Mapped[Optional[str]] = mapped_column(
        String(36), 
        ForeignKey("conversations.id", ondelete="SET NULL"),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User", 
        back_populates="history_records"
    )
    prediction: Mapped["Prediction"] = relationship(
        "Prediction", 
        back_populates="history_record"
    )
    conversation: Mapped[Optional["Conversation"]] = relationship(
        "Conversation", 
        back_populates="history_record"
    )

    def __repr__(self) -> str:
        return f"<History id={self.id} user_id={self.user_id} prediction_id={self.prediction_id}>"
