"""
Repository classes for database transactions on the diet planning models.
"""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.diet import FoodItem, MealPlan, MealHistory, BMIHistory


class FoodItemRepository(BaseRepository[FoodItem]):
    """Repository class for DB actions on the FoodItem model."""

    def __init__(self) -> None:
        super().__init__(FoodItem)

    def get_by_name(self, db: Session, *, food_name: str) -> Optional[FoodItem]:
        """Fetch food record by name."""
        query = select(self.model).where(self.model.food_name == food_name)
        return db.scalar(query)

    def search_foods(self, db: Session, *, query_str: str, limit: int = 20) -> List[FoodItem]:
        """Search foods by partial string match."""
        query = select(self.model).where(self.model.food_name.ilike(f"%{query_str}%")).limit(limit)
        return list(db.scalars(query).all())

    def filter_foods(
        self,
        db: Session,
        *,
        category: Optional[str] = None,
        is_indian: Optional[bool] = None,
        diabetic_friendly: Optional[bool] = None,
        heart_friendly: Optional[bool] = None,
        weight_loss_friendly: Optional[bool] = None,
        muscle_gain_friendly: Optional[bool] = None,
        limit: int = 50
    ) -> List[FoodItem]:
        """Retrieve food items matching filter parameters."""
        query = select(self.model)
        if category:
            query = query.where(self.model.category == category)
        if is_indian is not None:
            query = query.where(self.model.is_indian == is_indian)
        if diabetic_friendly:
            query = query.where(self.model.diabetic_friendly == True)
        if heart_friendly:
            query = query.where(self.model.heart_friendly == True)
        if weight_loss_friendly:
            query = query.where(self.model.weight_loss_friendly == True)
        if muscle_gain_friendly:
            query = query.where(self.model.muscle_gain_friendly == True)
        
        query = query.limit(limit)
        return list(db.scalars(query).all())


class MealPlanRepository(BaseRepository[MealPlan]):
    """Repository class for DB actions on the MealPlan model."""

    def __init__(self) -> None:
        super().__init__(MealPlan)

    def get_latest_by_user(self, db: Session, *, user_id: str) -> Optional[MealPlan]:
        """Get the latest meal plan generated for a user."""
        query = select(self.model).where(self.model.user_id == user_id).order_by(self.model.created_at.desc()).limit(1)
        return db.scalar(query)


class MealHistoryRepository(BaseRepository[MealHistory]):
    """Repository class for DB actions on the MealHistory model."""

    def __init__(self) -> None:
        super().__init__(MealHistory)

    def get_user_logs(self, db: Session, *, user_id: str, limit: int = 100) -> List[MealHistory]:
        """Fetch all meal log entries for a user."""
        query = select(self.model).where(self.model.user_id == user_id).order_by(self.model.log_date.desc()).limit(limit)
        return list(db.scalars(query).all())


class BMIHistoryRepository(BaseRepository[BMIHistory]):
    """Repository class for DB actions on the BMIHistory model."""

    def __init__(self) -> None:
        super().__init__(BMIHistory)

    def get_user_records(self, db: Session, *, user_id: str, limit: int = 50) -> List[BMIHistory]:
        """Fetch all historical BMI records logged by a user."""
        query = select(self.model).where(self.model.user_id == user_id).order_by(self.model.recorded_at.desc()).limit(limit)
        return list(db.scalars(query).all())


# Singleton repository instances
food_repository = FoodItemRepository()
meal_plan_repository = MealPlanRepository()
meal_history_repository = MealHistoryRepository()
bmi_history_repository = BMIHistoryRepository()
