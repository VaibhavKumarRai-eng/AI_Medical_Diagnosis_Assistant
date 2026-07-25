"""
Authentication API Routers.

Exposes user registration, login, token refresh, and password recovery endpoints.
"""

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.user import UserCreate, UserLogin, Token, ForgotPassword, ResetPassword
from app.schemas.common import MessageResponse, DataResponse
from app.services.auth import auth_service
from app.core.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.post("/register", response_model=DataResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    """Register a new patient account."""
    try:
        new_user = auth_service.register_user(db, user_in=user_in)
        # Avoid circular dependencies by converting to dict/schema manual response
        from app.schemas.user import UserResponse
        user_data = UserResponse.model_validate(new_user)
        return DataResponse(success=True, data=user_data, message="Registration successful.")
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 password login, returning JWT access and refresh tokens.
    
    Compatible with FastAPI Swagger interface authorizations.
    """
    user = auth_service.authenticate_user(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_service.login_user(db, user=user)


@router.post("/refresh-token", response_model=Token)
def refresh_token(
    refresh_token_in: str,
    db: Session = Depends(get_db)
) -> Any:
    """Refresh JWT access token using a valid refresh token."""
    try:
        return auth_service.refresh_access_token(db, refresh_token=refresh_token_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(
    data: ForgotPassword,
    db: Session = Depends(get_db)
) -> Any:
    """Request a password recovery token for an email address."""
    token = auth_service.generate_password_reset_token(db, email=data.email)
    
    # In production, send email with: /reset-password?token={token}
    # For project demonstration, we will return the token in the API response.
    if token:
        logger.info(f"Password reset requested for {data.email}. Token generated: {token}")
        return MessageResponse(
            message=f"If the email is registered, a password reset token was sent. Demonstrator Token: {token}"
        )
    
    return MessageResponse(
        message="If the email is registered, a password reset token was sent."
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(
    data: ResetPassword,
    db: Session = Depends(get_db)
) -> Any:
    """Reset user password using a valid email recovery token."""
    success = auth_service.reset_password(db, email_token=data.token, new_password=data.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )
    return MessageResponse(message="Password reset successful.")
