"""
User Repository Module.

Handles DB transactions for the User model.
"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.repositories.base import BaseRepository
from app.models.user import User


class UserRepository(BaseRepository[User]):
    """Repository class for DB actions on the User model."""

    def __init__(self) -> None:
        super().__init__(User)

    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        """Fetch a user record by email address.
        
        Args:
            db (Session): Database transaction session.
            email (str): Email address to search for.
            
        Returns:
            User | None: The user model if found.
        """
        email_clean = email.strip().lower() if email else ""
        query = select(self.model).where(self.model.email == email_clean)
        return db.scalar(query)


# Singleton user repository instance
user_repository = UserRepository()
