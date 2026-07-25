"""
History Service Module.

Coordinates user history fetches, query filtering, and audit log deletions.
"""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.core.logger import get_logger
from app.models.history import History
from app.repositories.history import history_repository
from app.repositories.prediction import prediction_repository
from app.repositories.conversation import conversation_repository

logger = get_logger(__name__)


class HistoryService:
    """Service class for coordinating patient prediction history data."""

    def get_user_history(
        self, db: Session, *, user_id: str, skip: int = 0, limit: int = 100
    ) -> List[History]:
        """Fetch all consolidated history logs for a user.
        
        Args:
            db (Session): Database transaction session.
            user_id (str): User ID.
            skip (int): Records to skip.
            limit (int): Maximum records to retrieve.
            
        Returns:
            List[History]: User history logs.
        """
        return history_repository.get_by_user_detailed(db, user_id=user_id, skip=skip, limit=limit)

    def get_history_details(self, db: Session, *, history_id: str, user_id: str) -> Optional[History]:
        """Retrieve full details of a specific history log.
        
        Args:
            db (Session): Database transaction session.
            history_id (str): History primary key.
            user_id (str): User ID (verifies ownership).
            
        Returns:
            History | None: Eager-loaded History log, or None.
        """
        record = history_repository.get_detailed(db, history_id=history_id)
        if not record or record.user_id != user_id:
            return None
        return record

    def search_user_history(
        self, db: Session, *, user_id: str, query: str, skip: int = 0, limit: int = 100
    ) -> List[History]:
        """Search user history logs matching query terms.
        
        Args:
            db (Session): Database transaction session.
            user_id (str): User ID.
            query (str): Search term.
            skip (int): Records to skip.
            limit (int): Maximum records to retrieve.
            
        Returns:
            List[History]: Filtered list.
        """
        if not query or not query.strip():
            return self.get_user_history(db, user_id=user_id, skip=skip, limit=limit)
        return history_repository.search_history(db, user_id=user_id, query=query.strip(), skip=skip, limit=limit)

    def delete_history_record(self, db: Session, *, history_id: str, user_id: str) -> bool:
        """Delete user history, clearing predictions and associated chat logs.
        
        Args:
            db (Session): Database transaction session.
            history_id (str): History record ID.
            user_id (str): User ID (verifies ownership).
            
        Returns:
            bool: True if delete succeeded, False otherwise.
        """
        record = history_repository.get(db, id=history_id)
        if not record or record.user_id != user_id:
            logger.warning(f"Delete history attempt failed: record {history_id} not found or unauthorized.")
            return False

        # Retrieve related entities to remove them explicitly (to ensure cascade behaviors)
        pred_id = record.prediction_id
        conv_id = record.conversation_id

        # Delete the main History log (foreign key cascades are handled by DB schema/declarations)
        history_repository.remove(db, id=history_id)
        
        # Explicitly clean up related Prediction
        if pred_id:
            prediction_repository.remove(db, id=pred_id)
            
        # Explicitly clean up related Conversation
        if conv_id:
            conversation_repository.remove(db, id=conv_id)

        logger.info(f"History record {history_id} and related prediction/chat successfully deleted.")
        return True


# Singleton history service instance
history_service = HistoryService()
