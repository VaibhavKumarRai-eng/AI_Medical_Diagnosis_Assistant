"""
Security and JWT Authentication Utility Module.

Provides cryptographic routines for password hashing, password verification,
and JSON Web Token (JWT) lifecycle management (generation & decoding).
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Union
from jose import jwt, JWTError
import bcrypt
from app.core.config import settings
from app.core.logger import get_logger

logger = get_logger(__name__)


def hash_password(password: str) -> str:
    """Hash a cleartext password using bcrypt.
    
    Args:
        password (str): Cleartext password.
        
    Returns:
        str: Cryptographic bcrypt hash.
    """
    pwd_bytes = password.encode("utf-8")
    # Generates standard cost factors
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a cleartext password against a bcrypt hash.
    
    Args:
        plain_password (str): Cleartext password.
        hashed_password (str): Hashed password.
        
    Returns:
        bool: True if passwords match, False otherwise.
    """
    try:
        pwd_bytes = plain_password.encode("utf-8")
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception as e:
        logger.error(f"Error verifying password: {e}")
        return False


def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a JWT access token.
    
    Args:
        subject (str | Any): The subject claim (typically user ID).
        expires_delta (timedelta, optional): Expiration span override.
        
    Returns:
        str: Serialized JWT.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access"
    }
    
    try:
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    except JWTError as e:
        logger.error(f"Error encoding access token: {e}", exc_info=True)
        raise e


def create_refresh_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a JWT refresh token.
    
    Args:
        subject (str | Any): The subject claim (typically user ID).
        expires_delta (timedelta, optional): Expiration span override.
        
    Returns:
        str: Serialized JWT.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh"
    }
    
    try:
        encoded_jwt = jwt.encode(to_encode, settings.REFRESH_SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    except JWTError as e:
        logger.error(f"Error encoding refresh token: {e}", exc_info=True)
        raise e


def decode_token(token: str, is_refresh: bool = False) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT.
    
    Args:
        token (str): Serialized JWT.
        is_refresh (bool): Use the refresh secret key if True, access secret key otherwise.
        
    Returns:
        Dict[str, Any] | None: Decoded claims payload, or None if invalid.
    """
    key = settings.REFRESH_SECRET_KEY if is_refresh else settings.SECRET_KEY
    try:
        payload = jwt.decode(token, key, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"Failed to decode token (is_refresh={is_refresh}): {e}")
        return None
