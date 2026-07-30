"""
Pydantic schemas for request validation and response formatting in the Diet Planner module.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class BMIRequest(BaseModel):
    weight_kg: float = Field(..., gt=10, lt=500)
    height_cm: float = Field(..., gt=50, lt=300)


class BMIResponse(BaseModel):
    bmi: float
    classification: str


class DietRequest(BaseModel):
    weight_kg: float = Field(..., gt=10, lt=500)
    height_cm: float = Field(..., gt=50, lt=300)
    age: int = Field(..., gt=2, lt=120)
    gender: str = Field(..., description="male or female")
    goal: str = Field(..., description="weight_loss, weight_gain, maintain_weight, muscle_gain, fat_loss")
    activity_level: str = Field(..., description="sedentary, light, moderate, active, extra_active")
    food_preference: str = Field("Veg", description="Veg, Non-Veg")
    allergies: List[str] = Field(default_factory=list)
    medical_conditions: List[str] = Field(default_factory=list)


class FoodResponse(BaseModel):
    id: str
    food_name: str
    category: str
    calories: float
    protein: float
    carbs: float
    fat: float
    fiber: float
    sugar: float
    sodium: float
    potassium: float
    vitamin_c: float
    calcium: float
    iron: float
    is_indian: bool
    region: str
    health_score: float
    diabetic_friendly: bool
    heart_friendly: bool
    weight_loss_friendly: bool
    muscle_gain_friendly: bool

    class Config:
        from_attributes = True


class MealHistoryCreate(BaseModel):
    food_name: str
    meal_type: str  # Breakfast, Lunch, Dinner, Snack
    serving_count: float = 1.0
    calories: float
    protein: float
    carbs: float
    fat: float


class MealHistoryResponse(BaseModel):
    id: str
    food_name: str
    meal_type: str
    serving_count: float
    calories: float
    protein: float
    carbs: float
    fat: float
    log_date: datetime

    class Config:
        from_attributes = True


class DietPlanResponse(BaseModel):
    id: str
    target_calories: float
    target_protein: float
    target_carbs: float
    target_fat: float
    target_water_ml: float
    recommended_meals: Dict[str, List[FoodResponse]]
    created_at: datetime

    class Config:
        from_attributes = True


class BMIHistoryResponse(BaseModel):
    id: str
    weight_kg: float
    height_cm: float
    bmi: float
    classification: str
    recorded_at: datetime

    class Config:
        from_attributes = True
