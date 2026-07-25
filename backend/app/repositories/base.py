"""
Generic Repository Base Module.

Provides reusable database CRUD operations for all SQLAlchemy models.
"""

from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base class for database access, encapsulating generic CRUD methods."""

    def __init__(self, model: Type[ModelType]) -> None:
        """Initialize the repository.
        
        Args:
            model: A SQLAlchemy model class.
        """
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        """Fetch a single record by primary key ID.
        
        Args:
            db (Session): Database transaction session.
            id (Any): Primary key.
            
        Returns:
            ModelType | None: The database record if found.
        """
        return db.get(self.model, id)

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[ModelType]:
        """Fetch multiple records with pagination parameters.
        
        Args:
            db (Session): Database transaction session.
            skip (int): Records to skip.
            limit (int): Maximum records to retrieve.
            
        Returns:
            List[ModelType]: List of database records.
        """
        query = select(self.model).offset(skip).limit(limit)
        return list(db.scalars(query).all())

    def create(self, db: Session, *, obj_in: Any) -> ModelType:
        """Create and persist a new record.
        
        Args:
            db (Session): Database transaction session.
            obj_in (Any): Instantiated SQLAlchemy model or keyword dict.
            
        Returns:
            ModelType: The saved database record.
        """
        if isinstance(obj_in, self.model):
            db_obj = obj_in
        else:
            db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[Dict[str, Any], Any]
    ) -> ModelType:
        """Update an existing database record.
        
        Args:
            db (Session): Database transaction session.
            db_obj (ModelType): Original database record.
            obj_in (dict | Any): Fields to update.
            
        Returns:
            ModelType: The updated database record.
        """
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: Any) -> Optional[ModelType]:
        """Remove a database record by primary key ID.
        
        Args:
            db (Session): Database transaction session.
            id (Any): Primary key.
            
        Returns:
            ModelType | None: The deleted record, or None if not found.
        """
        obj = db.get(self.model, id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj
