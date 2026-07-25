"""
History API Routers.

Exposes endpoints for patients to retrieve, search, and delete their diagnostic logs.
"""

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.history import HistoryResponse
from app.schemas.common import MessageResponse
from app.services.history import history_service

router = APIRouter()


@router.get("", response_model=List[HistoryResponse], status_code=status.HTTP_200_OK)
def list_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    q: Optional[str] = Query(None, description="Search query matching symptom text or disease names"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Retrieve diagnostic log history for the authenticated patient user.
    
    Supports pagination and query-based search filters.
    """
    if q:
        return history_service.search_user_history(
            db, 
            user_id=current_user.id, 
            query=q, 
            skip=skip, 
            limit=limit
        )
    return history_service.get_user_history(
        db, 
        user_id=current_user.id, 
        skip=skip, 
        limit=limit
    )


@router.get("/{history_id}", response_model=HistoryResponse, status_code=status.HTTP_200_OK)
def get_history_detail(
    history_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Retrieve full diagnostic and chatbot details of a specific history log."""
    record = history_service.get_history_details(
        db, 
        history_id=history_id, 
        user_id=current_user.id
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History record not found or access denied."
        )
    return record


@router.delete("/{history_id}", response_model=MessageResponse, status_code=status.HTTP_200_OK)
def delete_history_detail(
    history_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Delete a history record and clear related conversation and prediction entries."""
    success = history_service.delete_history_record(
        db, 
        history_id=history_id, 
        user_id=current_user.id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History record not found or access denied."
        )
    return MessageResponse(message="Diagnostic history successfully deleted.")
