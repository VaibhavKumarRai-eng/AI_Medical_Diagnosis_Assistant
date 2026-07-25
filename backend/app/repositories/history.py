"""
History Repository Module.

Handles DB transactions for consolidated history entries and system-wide telemetry.
"""

from typing import List, Optional, Tuple, Dict
from sqlalchemy import select, func, desc, or_
from sqlalchemy.orm import Session, joinedload
from app.repositories.base import BaseRepository
from app.models.history import History
from app.models.prediction import Prediction
from app.models.user import User
from app.models.conversation import Conversation


class HistoryRepository(BaseRepository[History]):
    """Repository class for DB actions on user diagnosis logs and administrative telemetry."""

    def __init__(self) -> None:
        super().__init__(History)

    def get_by_user_detailed(
        self, db: Session, *, user_id: str, skip: int = 0, limit: int = 100
    ) -> List[History]:
        """Fetch user histories, pre-loading predictions and chatbot sessions.
        
        Args:
            db (Session): Database transaction session.
            user_id (str): User ID.
            skip (int): Records to skip.
            limit (int): Maximum records to retrieve.
            
        Returns:
            List[History]: Consolidated diagnostic logs with preloaded records.
        """
        query = (
            select(self.model)
            .where(self.model.user_id == user_id)
            .options(
                joinedload(self.model.prediction),
                joinedload(self.model.conversation).joinedload(Conversation.messages)
            )
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(db.scalars(query).unique().all())

    def get_detailed(self, db: Session, *, history_id: str) -> Optional[History]:
        """Fetch a specific history record with eager loading.
        
        Args:
            db (Session): Database transaction session.
            history_id (str): History primary key.
            
        Returns:
            History | None: Detailed history.
        """
        query = (
            select(self.model)
            .where(self.model.id == history_id)
            .options(
                joinedload(self.model.prediction),
                joinedload(self.model.conversation).joinedload(Conversation.messages)
            )
        )
        return db.scalars(query).unique().one_or_none()

    def search_history(
        self, db: Session, *, user_id: str, query: str, skip: int = 0, limit: int = 100
    ) -> List[History]:
        """Search a user's diagnostic history by symptoms or predicted disease names.
        
        Args:
            db (Session): Database transaction session.
            user_id (str): User ID.
            query (str): Search term.
            skip (int): Records to skip.
            limit (int): Maximum records to retrieve.
            
        Returns:
            List[History]: Filtered list of history records.
        """
        search_filter = or_(
            Prediction.symptom_text.ilike(f"%{query}%"),
            Prediction.predicted_disease.ilike(f"%{query}%")
        )
        
        db_query = (
            select(self.model)
            .join(Prediction, self.model.prediction_id == Prediction.id)
            .where(self.model.user_id == user_id, search_filter)
            .options(
                joinedload(self.model.prediction),
                joinedload(self.model.conversation).joinedload(Conversation.messages)
            )
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return list(db.scalars(db_query).unique().all())

    def get_system_aggregates(self, db: Session, recent_limit: int = 10) -> Dict[str, Any]:
        """Compute high-level aggregates for administrative analysis.
        
        Args:
            db (Session): Database transaction session.
            recent_limit (int): Number of recent predictions to return.
            
        Returns:
            Dict[str, Any]: Consolidated metrics dict.
        """
        # 1. Count total users
        total_users = db.scalar(select(func.count(User.id))) or 0
        
        # 2. Count total predictions
        total_predictions = db.scalar(select(func.count(Prediction.id))) or 0
        
        # 3. Aggregate most predicted diseases
        disease_query = (
            select(Prediction.predicted_disease, func.count(Prediction.id).label("disease_count"))
            .group_by(Prediction.predicted_disease)
            .order_by(desc("disease_count"))
            .limit(5)
        )
        disease_results = db.execute(disease_query).all()
        most_predicted = [
            {"disease": row[0], "count": row[1]} 
            for row in disease_results
        ]
        
        # 4. Fetch recent predictions
        recent_predictions_query = (
            select(Prediction)
            .order_by(Prediction.created_at.desc())
            .limit(recent_limit)
        )
        recent_predictions = list(db.scalars(recent_predictions_query).all())

        return {
            "total_users": total_users,
            "total_predictions": total_predictions,
            "most_predicted_diseases": most_predicted,
            "recent_predictions": recent_predictions
        }


# Singleton history repository instance
history_repository = HistoryRepository()
