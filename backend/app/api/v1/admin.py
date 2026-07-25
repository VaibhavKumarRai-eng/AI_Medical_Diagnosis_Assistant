"""
Admin Panel API Routers.

Exposes dashboard analytics, system telemetry, and model details to system administrators.
"""

import sys
import time
import platform
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_active_admin
from app.models.user import User
from app.schemas.admin import AdminDashboardResponse, SystemHealthStatus
from app.repositories.history import history_repository
from app.ml.adapter import ml_adapter

router = APIRouter()

# Records dashboard boot time to calculate server uptime
START_TIME = time.time()


@router.get("/dashboard", response_model=AdminDashboardResponse, status_code=status.HTTP_200_OK)
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_active_admin)
) -> Any:
    """Retrieve comprehensive telemetry and ML performance metrics.
    
    Access is strictly restricted to administrative accounts.
    """
    # 1. Test database health
    db_status = "healthy"
    try:
        db.execute(select(1))
    except Exception:
        db_status = "unreachable"

    # 2. Gather platform details
    uptime = time.time() - START_TIME
    health = SystemHealthStatus(
        database_status=db_status,
        uptime_seconds=round(uptime, 2),
        platform=platform.system() + " " + platform.release(),
        python_version=sys.version.split(" ")[0]
    )

    # 3. Retrieve system analytics from repository
    aggregates = history_repository.get_system_aggregates(db, recent_limit=5)

    # 4. Extract model metadata
    model_meta = ml_adapter.get_model_metadata()
    model_version_str = (
        f"{model_meta.get('best_model_name', 'Multinomial Naive Bayes')} "
        f"(Accuracy: {model_meta.get('train_accuracy', 0.8427) * 100:.2f}%)"
    )

    return AdminDashboardResponse(
        total_users=aggregates["total_users"],
        total_predictions=aggregates["total_predictions"],
        most_predicted_diseases=aggregates["most_predicted_diseases"],
        recent_predictions=aggregates["recent_predictions"],
        system_health=health,
        model_version=model_version_str
    )
