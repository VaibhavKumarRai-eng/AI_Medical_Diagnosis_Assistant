"""
FastAPI Application Entrypoint.

Initializes routes, middleware, database tables, seeds default administrators,
and configures global exception handling.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import create_tables, get_db
from app.core.security import hash_password
from app.core.logger import get_logger
from app.models.user import User
from app.repositories.user import user_repository
from app.ml.adapter import ml_adapter

# Route imports
from app.api.v1.auth import router as auth_router
from app.api.v1.prediction import router as prediction_router
from app.api.v1.chatbot import router as chatbot_router
from app.api.v1.history import router as history_router
from app.api.v1.profile import router as profile_router
from app.api.v1.admin import router as admin_router

logger = get_logger("app.main")


def seed_admin_user() -> None:
    """Checks for the default administrator account and seeds it if absent."""
    db: Session = next(get_db())
    try:
        admin_email = settings.FIRST_ADMIN_EMAIL
        admin = user_repository.get_by_email(db, email=admin_email)
        if not admin:
            logger.info("First administrator account absent. Seeding from configuration...")
            hashed_pass = hash_password(settings.FIRST_ADMIN_PASSWORD)
            new_admin = User(
                email=admin_email,
                hashed_password=hashed_pass,
                full_name="System Administrator",
                role="admin",
                is_active=True
            )
            user_repository.create(db, obj_in=new_admin)
            logger.info(f"Default admin seeded successfully. Credentials: {admin_email}")
        else:
            logger.debug("Default administrator account verified.")
    except Exception as e:
        logger.error(f"Error seeding default administrator: {e}", exc_info=True)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle startup and shutdown manager."""
    logger.info("FastAPI application booting up...")
    
    # 1. Initialize database tables
    create_tables()
    
    # 2. Seed administrative account
    seed_admin_user()
    
    yield
    
    logger.info("FastAPI application shutting down...")


# Create FastAPI App Instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-grade AI medical assistant backend predicting conditions from conversational text.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration Middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# --- Global Exception Handlers ---

@app.exception_handler(ValueError)
async def value_error_exception_handler(request: Request, exc: ValueError):
    """Intercept validation or logic errors returning 400 Bad Request."""
    logger.warning(f"ValueError intercepted on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Intercept unhandled application errors returning 500 Server Error."""
    logger.error(f"Unhandled Exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal system error occurred. Please contact support."},
    )


# --- Root & Telemetry Routes ---

@app.get("/", tags=["Telemetry"])
def read_root() -> dict:
    """Welcome greeting and documentation gateway."""
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} API.",
        "documentation": "/docs"
    }


@app.get("/health", tags=["Telemetry"])
def health_check(db: Session = Depends(get_db)) -> dict:
    """Verifies backend operation and database server health."""
    db_status = "healthy"
    try:
        from sqlalchemy import select
        db.execute(select(1))
    except Exception as e:
        logger.error(f"Database query check failed: {e}")
        db_status = "unreachable"
        
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status
    }


@app.get("/version", tags=["Telemetry"])
def get_version() -> dict:
    """Retrieve model training statistics and model version metrics."""
    meta = ml_adapter.get_model_metadata()
    return {
        "version": "1.0.0",
        "ml_model": {
            "name": meta.get("best_model_name", "Multinomial Naive Bayes"),
            "train_accuracy": meta.get("train_accuracy", 0.8427),
            "feature_count": meta.get("feature_count", 5000)
        }
    }


# --- API Route Registrations ---

# Direct endpoint mounts to align with requirements
app.include_router(auth_router, tags=["Authentication"])
app.include_router(profile_router, prefix="/profile", tags=["Profiles"])
app.include_router(prediction_router, tags=["Prediction"])
app.include_router(chatbot_router, tags=["Chatbot"])
app.include_router(history_router, prefix="/history", tags=["History"])
app.include_router(admin_router, prefix="/admin", tags=["Administration"])
