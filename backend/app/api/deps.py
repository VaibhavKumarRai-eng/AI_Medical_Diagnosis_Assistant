"""
API Dependencies Module.

Provides reusable FastAPI Dependency Injection components, including DB session injection,
OAuth2 token extraction, and role-based access validation.
"""

from typing import Generator, Any, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_token
from app.core.logger import get_logger
from app.models.user import User
from app.repositories.user import user_repository
from app.schemas.user import TokenPayload

from fastapi.security import OAuth2PasswordBearer, HTTPBearer

logger = get_logger(__name__)

# Configures OAuth2 token scheme extraction
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/login"
)
optional_token_scheme = HTTPBearer(auto_error=False)


def get_current_user_optional(
    db: Session = Depends(get_db),
    token_obj: Any = Depends(optional_token_scheme)
) -> Optional[User]:
    """Retrieve user from JWT optional token without raising exceptions for anonymous users."""
    if not token_obj:
        return None
        
    token = token_obj.credentials
    payload = decode_token(token)
    if not payload:
        return None
        
    user_id = payload.get("sub")
    token_type = payload.get("type")
    
    if user_id is None or token_type != "access":
        return None
        
    return user_repository.get(db, id=user_id)


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    """Decodes JWT access token and retrieves the current authenticated user.
    
    Args:
        db (Session): Database transaction session.
        token (str): JWT credentials string.
        
    Returns:
        User: The authenticated User database model.
        
    Raises:
        HTTPException: For invalid credentials or missing users.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Decode token
    payload = decode_token(token)
    if not payload:
        raise credentials_exception
        
    user_id = payload.get("sub")
    token_type = payload.get("type")
    
    if user_id is None or token_type != "access":
        raise credentials_exception
        
    # 2. Query user
    user = user_repository.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
        
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Enforces that the current authenticated user account is enabled."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user account"
        )
    return current_user


def get_current_active_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """Enforces that the authenticated user possesses administrative privileges."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have administrative privileges"
        )
    return current_user
