"""
SQLAlchemy Prediction Model for the predictions table.

Utilizes SQLAlchemy 2.0 Mapped type annotations and JSON support.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, TYPE_CHECKING
from sqlalchemy import String, DateTime, Text, Float, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.history import History


class Prediction(Base):
    """Prediction DB Model representing a single diagnosis inference session."""
    
    __tablename__ = "predictions"

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
    symptom_text: Mapped[str] = mapped_column(
        Text, 
        nullable=False
    )
    predicted_disease: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    confidence_score: Mapped[float] = mapped_column(
        Float, 
        nullable=False
    )
    # Stores list of dicts: [{"disease": str, "probability": float}]
    top_5_predictions: Mapped[List[Dict[str, Any]]] = mapped_column(
        JSON, 
        nullable=False
    )
    explanation: Mapped[str] = mapped_column(
        Text, 
        nullable=False
    )
    # Stores list of strings: ["precaution 1", "precaution 2"]
    precautions: Mapped[List[str]] = mapped_column(
        JSON, 
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User", 
        back_populates="predictions"
    )
    history_record: Mapped[Optional["History"]] = relationship(
        "History",
        back_populates="prediction",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Prediction disease={self.predicted_disease} score={self.confidence_score:.4f}>"
