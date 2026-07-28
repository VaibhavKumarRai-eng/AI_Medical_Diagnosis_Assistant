"""
Authentication and User Profile Service Module.

Orchestrates password flows, user creation, token lifecycles, and profiles.
"""

from datetime import timedelta
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.core.logger import get_logger
from app.models.user import User
from app.repositories.user import user_repository
from app.schemas.user import UserCreate, UserUpdate, Token, ChangePassword

logger = get_logger(__name__)


class AuthService:
    """Service class encapsulating authentication and profile logic."""

    def register_user(self, db: Session, *, user_in: UserCreate) -> User:
        """Register a new patient/user in the system.
        
        Args:
            db (Session): Database transaction session.
            user_in (UserCreate): Input schema fields.
            
        Returns:
            User: Created database record.
            
        Raises:
            ValueError: If user email already exists.
        """
        existing = user_repository.get_by_email(db, email=user_in.email)
        if existing:
            logger.warning(f"Registration attempt failed: email {user_in.email} already exists.")
            raise ValueError("A user with this email address is already registered.")

        # Hash password and save user
        hashed = hash_password(user_in.password)
        db_obj = User(
            email=user_in.email,
            hashed_password=hashed,
            full_name=user_in.full_name,
            role="user"  # Default registration role
        )
        return user_repository.create(db, obj_in=db_obj)

    def authenticate_user(self, db: Session, *, email: str, password: str) -> Optional[User]:
        """Authenticate user credentials.
        
        Args:
            db (Session): Database transaction session.
            email (str): Account email.
            password (str): Cleartext password.
            
        Returns:
            User | None: Authenticated user model, or None if invalid.
        """
        user = user_repository.get_by_email(db, email=email)
        if not user or not user.is_active:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
            
        return user

    def login_user(self, db: Session, *, user: User) -> Token:
        """Create token credentials bundle for authenticated users.
        
        Args:
            db (Session): Database transaction session.
            user (User): Database user model.
            
        Returns:
            Token: JWT token pair.
        """
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)
        logger.info(f"User authenticated successfully: {user.email}")
        return Token(access_token=access_token, refresh_token=refresh_token)

    def refresh_access_token(self, db: Session, *, refresh_token: str) -> Token:
        """Generate a new access token from a valid refresh token.
        
        Args:
            db (Session): Database transaction session.
            refresh_token (str): Stored refresh token.
            
        Returns:
            Token: Updated JWT token pair.
            
        Raises:
            ValueError: If token is expired or claims are invalid.
        """
        payload = decode_token(refresh_token, is_refresh=True)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid or expired refresh token.")

        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Token does not specify user identity.")

        user = user_repository.get(db, id=user_id)
        if not user or not user.is_active:
            raise ValueError("User account is disabled or does not exist.")

        # Re-issue both tokens
        new_access = create_access_token(subject=user.id)
        new_refresh = create_refresh_token(subject=user.id)
        logger.info(f"Tokens re-issued for user ID: {user_id}")
        return Token(access_token=new_access, refresh_token=new_refresh)

    def update_profile(self, db: Session, *, user: User, updates: UserUpdate) -> User:
        """Update active user profile fields.
        
        Args:
            db (Session): Database transaction session.
            user (User): Current user model.
            updates (UserUpdate): Modified fields.
            
        Returns:
            User: Updated user model.
        """
        if updates.email and updates.email != user.email:
            existing = user_repository.get_by_email(db, email=updates.email)
            if existing:
                raise ValueError("This email address is already in use by another account.")
        return user_repository.update(db, db_obj=user, obj_in=updates)

    def change_password(self, db: Session, *, user: User, password_data: ChangePassword) -> None:
        """Modify password after confirming existing hash.
        
        Args:
            db (Session): Database transaction session.
            user (User): Current user model.
            password_data (ChangePassword): Old and new passwords.
            
        Raises:
            ValueError: If original password verification fails.
        """
        if not verify_password(password_data.old_password, user.hashed_password):
            raise ValueError("Current password verification failed.")

        hashed_new = hash_password(password_data.new_password)
        user_repository.update(db, db_obj=user, obj_in={"hashed_password": hashed_new})
        logger.info(f"Password updated for user: {user.email}")

    def generate_password_reset_token(self, db: Session, *, email: str) -> Optional[str]:
        """Generate a 6-digit One-Time Password (OTP) for password reset request.
        
        Args:
            db (Session): Database transaction session.
            email (str): Target email.
            
        Returns:
            str | None: Generated OTP code, or None if user not found.
        """
        import random
        import os
        import smtplib
        from datetime import datetime, timezone
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        user = user_repository.get_by_email(db, email=email)
        if not user or not user.is_active:
            logger.warning(f"OTP generation requested for non-existent or inactive email: {email}")
            return None
        
        # Generate 6-digit numeric OTP
        otp = f"{random.randint(100000, 999999)}"
        expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
        
        # Update user record
        user_repository.update(db, db_obj=user, obj_in={
            "otp_code": otp,
            "otp_expires_at": expiry
        })
        logger.info(f"OTP saved in database for user: {email}")
        
        # Try to send SMTP email or fallback to developer console log
        logger.info(f"\n========================================\n[OTP DEV LOG] Generated OTP for email: {email} is [{otp}]\n========================================\n")
        
        smtp_host = os.getenv("SMTP_HOST")
        smtp_port = os.getenv("SMTP_PORT")
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")
        
        if smtp_host and smtp_port and smtp_user and smtp_pass:
            try:
                msg = MIMEMultipart()
                msg['From'] = smtp_user
                msg['To'] = email
                msg['Subject'] = "Aegis AI - Password Reset OTP"
                
                body = f"Your 6-digit One-Time Password (OTP) for Aegis AI password reset is: {otp}\n\nThis OTP is valid for 10 minutes."
                msg.attach(MIMEText(body, 'plain'))
                
                server = smtplib.SMTP(smtp_host, int(smtp_port))
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, email, msg.as_string())
                server.quit()
                logger.info(f"OTP email successfully sent via SMTP to {email}")
            except Exception as e:
                logger.error(f"Failed to send OTP email to {email} via SMTP: {e}", exc_info=True)
        else:
            logger.warning("SMTP settings missing from env. Falling back to terminal OTP log.")
            
        return otp

    def reset_password(self, db: Session, *, email: str, otp: str, new_password: str) -> bool:
        """Reset password utilizing the email and 6-digit OTP code verification.
        
        Args:
            db (Session): Database transaction session.
            email (str): User email.
            otp (str): Submitted OTP code.
            new_password (str): New password structure.
            
        Returns:
            bool: True if reset succeeded, False otherwise.
        """
        from datetime import datetime, timezone

        user = user_repository.get_by_email(db, email=email)
        if not user or not user.is_active:
            logger.warning(f"Reset password failed: user not found or inactive for email {email}")
            return False

        # Validate OTP
        if not user.otp_code or user.otp_code != otp:
            logger.warning(f"Reset password failed: incorrect OTP for email {email}")
            return False

        # Verify expiration
        # Ensure user.otp_expires_at is timezone-aware
        expires_at = user.otp_expires_at
        if expires_at:
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if datetime.now(timezone.utc) > expires_at:
                logger.warning(f"Reset password failed: expired OTP for email {email}")
                return False

        # Clear OTP and hash new password
        hashed_new = hash_password(new_password)
        user_repository.update(db, db_obj=user, obj_in={
            "hashed_password": hashed_new,
            "otp_code": None,
            "otp_expires_at": None
        })
        logger.info(f"Password successfully reset via OTP for email: {email}")
        return True


# Singleton auth service instance
auth_service = AuthService()
