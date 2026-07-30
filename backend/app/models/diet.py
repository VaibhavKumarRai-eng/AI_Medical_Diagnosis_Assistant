"""
SQLAlchemy database models for the Diet Planner module.

Defines FoodItem, MealPlan, MealHistory, and BMIHistory tables.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy import String, DateTime, Float, ForeignKey, JSON, Boolean, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class FoodItem(Base):
    """Database model for storing processed food items and nutritional properties."""
    
    __tablename__ = "food_items"

    id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    food_name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    calories: Mapped[float] = mapped_column(Float, default=0.0)
    protein: Mapped[float] = mapped_column(Float, default=0.0)
    carbs: Mapped[float] = mapped_column(Float, default=0.0)
    fat: Mapped[float] = mapped_column(Float, default=0.0)
    fiber: Mapped[float] = mapped_column(Float, default=0.0)
    sugar: Mapped[float] = mapped_column(Float, default=0.0)
    sodium: Mapped[float] = mapped_column(Float, default=0.0)
    potassium: Mapped[float] = mapped_column(Float, default=0.0)
    vitamin_c: Mapped[float] = mapped_column(Float, default=0.0)
    calcium: Mapped[float] = mapped_column(Float, default=0.0)
    iron: Mapped[float] = mapped_column(Float, default=0.0)
    is_indian: Mapped[bool] = mapped_column(Boolean, default=False)
    region: Mapped[str] = mapped_column(String(100), default="International")
    cooking_method: Mapped[str] = mapped_column(String(100), default="Various")
    spice_level: Mapped[str] = mapped_column(String(50), default="Mild")
    
    # Feature engineered columns
    protein_ratio: Mapped[float] = mapped_column(Float, default=0.0)
    fat_ratio: Mapped[float] = mapped_column(Float, default=0.0)
    carb_ratio: Mapped[float] = mapped_column(Float, default=0.0)
    health_score: Mapped[float] = mapped_column(Float, default=0.0)
    
    # Friendliness categories
    diabetic_friendly: Mapped[bool] = mapped_column(Boolean, default=False)
    heart_friendly: Mapped[bool] = mapped_column(Boolean, default=False)
    weight_loss_friendly: Mapped[bool] = mapped_column(Boolean, default=False)
    muscle_gain_friendly: Mapped[bool] = mapped_column(Boolean, default=False)
    bmi_friendly_category: Mapped[str] = mapped_column(String(50), default="moderate_density")


class MealPlan(Base):
    """Holds active recommended targets and meal plan suggestions for users."""
    
    __tablename__ = "meal_plans"

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
    
    # Calculated Targets
    target_calories: Mapped[float] = mapped_column(Float, nullable=False)
    target_protein: Mapped[float] = mapped_column(Float, nullable=False)
    target_carbs: Mapped[float] = mapped_column(Float, nullable=False)
    target_fat: Mapped[float] = mapped_column(Float, nullable=False)
    target_water_ml: Mapped[float] = mapped_column(Float, default=2500.0)
    
    # Recommended Meals
    # JSON containing structured meals e.g. {"breakfast": [...], "lunch": [...], "dinner": [...], "snacks": [...]}
    recommended_meals: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="meal_plans")


class MealHistory(Base):
    """Logs meals consumed by the user to track actual calories/macros against targets."""
    
    __tablename__ = "meal_history"

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
    
    # Consumed Metrics
    food_name: Mapped[str] = mapped_column(String(255), nullable=False)
    meal_type: Mapped[str] = mapped_column(String(50), nullable=False)  # Breakfast, Lunch, Dinner, Snack
    serving_count: Mapped[float] = mapped_column(Float, default=1.0)
    calories: Mapped[float] = mapped_column(Float, default=0.0)
    protein: Mapped[float] = mapped_column(Float, default=0.0)
    carbs: Mapped[float] = mapped_column(Float, default=0.0)
    fat: Mapped[float] = mapped_column(Float, default=0.0)
    
    log_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="meal_histories")


class BMIHistory(Base):
    """Tracks height, weight, and BMI progress trends over time for users."""
    
    __tablename__ = "bmi_history"

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
    
    weight_kg: Mapped[float] = mapped_column(Float, nullable=False)
    height_cm: Mapped[float] = mapped_column(Float, nullable=False)
    bmi: Mapped[float] = mapped_column(Float, nullable=False)
    classification: Mapped[str] = mapped_column(String(50), nullable=False) # Underweight, Normal, Overweight, Obese
    
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="bmi_records")
