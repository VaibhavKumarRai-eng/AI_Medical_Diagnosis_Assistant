"""
FastAPI router definition for the Personalized Diet Planner module.
"""

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user, get_current_user_optional
from app.models.user import User
from app.schemas.diet import (
    BMIRequest,
    BMIResponse,
    DietRequest,
    DietPlanResponse,
    FoodResponse,
    MealHistoryCreate,
    MealHistoryResponse,
    BMIHistoryResponse
)
from app.services.diet import diet_service
from app.repositories.diet import food_repository, meal_history_repository, bmi_history_repository, meal_plan_repository

router = APIRouter()


@router.post("/calculate-bmi", response_model=BMIResponse, status_code=status.HTTP_200_OK)
def calculate_bmi(
    request: BMIRequest
) -> Any:
    """Calculate and return BMI and classification stats."""
    res = diet_service.calculate_bmi(request.weight_kg, request.height_cm)
    return res


@router.post("/generate", response_model=DietPlanResponse, status_code=status.HTTP_201_CREATED)
def generate_diet_plan(
    request: DietRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Dynamically generate a personalized meal recommendation plan using the trained ML model."""
    try:
        # Generate and save meal plan for current active user
        meal_plan = diet_service.generate_recommendations(
            db,
            weight_kg=request.weight_kg,
            height_cm=request.height_cm,
            age=request.age,
            gender=request.gender,
            goal=request.goal,
            activity_level=request.activity_level,
            food_preference=request.food_preference,
            allergies=request.allergies,
            medical_conditions=request.medical_conditions,
            user_id=current_user.id
        )
        return meal_plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate diet recommendations: {str(e)}"
        )


@router.get("/latest", response_model=Optional[DietPlanResponse], status_code=status.HTTP_200_OK)
def get_latest_diet_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Fetch the latest generated diet recommendation plan for the logged-in user."""
    latest_plan = meal_plan_repository.get_latest_by_user(db, user_id=current_user.id)
    if not latest_plan:
        return None
    return latest_plan


@router.get("/foods/search", response_model=List[FoodResponse], status_code=status.HTTP_200_OK)
def search_foods(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Search for food items inside the nutrition database."""
    res = food_repository.search_foods(db, query_str=q)
    return res


@router.get("/foods/filter", response_model=List[FoodResponse], status_code=status.HTTP_200_OK)
def filter_foods(
    category: Optional[str] = None,
    is_indian: Optional[bool] = None,
    diabetic_friendly: Optional[bool] = None,
    heart_friendly: Optional[bool] = None,
    weight_loss_friendly: Optional[bool] = None,
    muscle_gain_friendly: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Retrieve food items matching filter criteria."""
    res = food_repository.filter_foods(
        db,
        category=category,
        is_indian=is_indian,
        diabetic_friendly=diabetic_friendly,
        heart_friendly=heart_friendly,
        weight_loss_friendly=weight_loss_friendly,
        muscle_gain_friendly=muscle_gain_friendly
    )
    return res


@router.post("/meal-history", response_model=MealHistoryResponse, status_code=status.HTTP_201_CREATED)
def log_meal_consumed(
    request: MealHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Log a meal consumed by the user to track nutrition history."""
    try:
        from app.models.diet import MealHistory
        log_obj = MealHistory(
            user_id=current_user.id,
            food_name=request.food_name,
            meal_type=request.meal_type,
            serving_count=request.serving_count,
            calories=request.calories,
            protein=request.protein,
            carbs=request.carbs,
            fat=request.fat
        )
        saved_log = meal_history_repository.create(db, obj_in=log_obj)
        return saved_log
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log meal: {str(e)}"
        )


@router.get("/meal-history", response_model=List[MealHistoryResponse], status_code=status.HTTP_200_OK)
def get_meal_history_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Fetch meal logs consumed by the logged-in user."""
    logs = meal_history_repository.get_user_logs(db, user_id=current_user.id)
    return logs


@router.get("/bmi-history", response_model=List[BMIHistoryResponse], status_code=status.HTTP_200_OK)
def get_bmi_history_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Fetch BMI/Weight history records logged by the user."""
    records = bmi_history_repository.get_user_records(db, user_id=current_user.id)
    return records


@router.delete("/meal-history/{log_id}", status_code=status.HTTP_200_OK)
def delete_meal_history_log(
    log_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Delete a specific meal history log for the current active user."""
    log = meal_history_repository.get(db, log_id)
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal log not found."
        )
    if log.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this meal log."
        )
    meal_history_repository.remove(db, id=log_id)
    return {"status": "success", "message": "Meal history log successfully deleted."}

