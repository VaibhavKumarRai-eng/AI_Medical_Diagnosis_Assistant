import os
import sys

# Setup paths
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

os.environ["DATABASE_URL"] = "sqlite:///./test_scratch.db"

# Import app.main to load all models and configure mappings
from app.main import app

from app.core.database import Base, engine, SessionLocal
from app.models.user import User
from app.services.auth import auth_service
from app.core.security import hash_password

# Reinitialize the test database
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    # Create test user
    email = "test@example.com"
    pwd = hash_password("Password123!")
    user = User(email=email, hashed_password=pwd, full_name="Test User", is_active=True)
    db.add(user)
    db.commit()

    # Generate OTP
    otp = auth_service.generate_password_reset_token(db, email=email)
    print(f"Generated OTP: {otp}")

    # Fetch user from DB and inspect fields
    db.expire_all()
    user_db = db.query(User).filter_by(email=email).first()
    print(f"Stored OTP: {user_db.otp_code}")
    print(f"Stored Expiry: {user_db.otp_expires_at} (tzinfo: {getattr(user_db.otp_expires_at, 'tzinfo', None)})")

    # Verify / Reset Password
    success = auth_service.reset_password(db, email=email, otp=otp, new_password="NewPassword123!")
    print(f"Reset Password Success: {success}")
finally:
    db.close()
    Base.metadata.drop_all(bind=engine)
    engine.dispose() # Dispose engine to unlock file
    if os.path.exists("./test_scratch.db"):
        os.remove("./test_scratch.db")
