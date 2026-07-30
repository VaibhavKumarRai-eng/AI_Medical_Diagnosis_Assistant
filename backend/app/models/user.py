"""
SQLAlchemy User Model for the users table.

Utilizes SQLAlchemy 2.0 Mapped type annotations.
"""

import uuid
from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.prediction import Prediction
    from app.models.conversation import Conversation
    from app.models.history import History
    from app.models.diet import MealPlan, MealHistory, BMIHistory


class User(Base):
    """User DB Model representing patients and system administrators."""
    
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        index=True, 
        nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255), 
        nullable=False
    )
    full_name: Mapped[str] = mapped_column(
        String(255), 
        nullable=True
    )
    role: Mapped[str] = mapped_column(
        String(50), 
        default="user"  # 'user', 'admin'
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, 
        default=True
    )
    otp_code: Mapped[Optional[str]] = mapped_column(
        String(6), 
        nullable=True
    )
    otp_expires_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), 
        nullable=True
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
    predictions: Mapped[List["Prediction"]] = relationship(
        "Prediction", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    conversations: Mapped[List["Conversation"]] = relationship(
        "Conversation", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    history_records: Mapped[List["History"]] = relationship(
        "History", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    meal_plans: Mapped[List["MealPlan"]] = relationship(
        "MealPlan", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    meal_histories: Mapped[List["MealHistory"]] = relationship(
        "MealHistory", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )
    bmi_records: Mapped[List["BMIHistory"]] = relationship(
        "BMIHistory", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User email={self.email} role={self.role}>"
