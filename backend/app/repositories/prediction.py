"""
Prediction Repository Module.

Handles DB transactions for the Prediction model.
"""

from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.prediction import Prediction


class PredictionRepository(BaseRepository[Prediction]):
    """Repository class for DB actions on the Prediction model."""

    def __init__(self) -> None:
        super().__init__(Prediction)

    def get_by_user(
        self, db: Session, *, user_id: str, skip: int = 0, limit: int = 100
    ) -> List[Prediction]:
        """Fetch all prediction records for a specific user.
        
        Args:
            db (Session): Database transaction session.
            user_id (str): User ID.
            skip (int): Records to skip.
            limit (int): Maximum records to retrieve.
            
        Returns:
            List[Prediction]: List of matching predictions.
        """
        query = (
            select(self.model)
            .where(self.model.user_id == user_id)
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(db.scalars(query).all())


# Singleton prediction repository instance
prediction_repository = PredictionRepository()
