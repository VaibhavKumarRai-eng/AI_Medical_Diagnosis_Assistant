"""
User Profile API Routers.

Exposes endpoints to view and modify patient profile details and credentials.
"""

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate, ChangePassword
from app.schemas.common import MessageResponse
from app.services.auth import auth_service

router = APIRouter()


@router.get("", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_profile(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Retrieve details of the currently authenticated user."""
    return current_user


@router.put("", response_model=UserResponse, status_code=status.HTTP_200_OK)
def update_profile(
    updates: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Update profile parameters for the currently authenticated user."""
    try:
        updated_user = auth_service.update_profile(db, user=current_user, updates=updates)
        return updated_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/change-password", response_model=MessageResponse, status_code=status.HTTP_200_OK)
def change_password(
    password_data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """Modify account passwords after validating current credentials."""
    try:
        auth_service.change_password(db, user=current_user, password_data=password_data)
        return MessageResponse(message="Password successfully modified.")
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
