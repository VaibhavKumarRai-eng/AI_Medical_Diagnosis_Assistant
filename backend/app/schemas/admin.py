"""
Admin Panel Pydantic schemas.

Validates payloads for dashboard telemetry and model analytics.
"""

from typing import List, Dict, Any
from pydantic import BaseModel, ConfigDict
from app.schemas.prediction import PredictionResponse


class DiseaseFrequency(BaseModel):
    """Analytics representation of predicted disease frequencies."""
    disease: str
    count: int


class SystemHealthStatus(BaseModel):
    """Hardware and database status statistics."""
    database_status: str  # "healthy", "unreachable"
    uptime_seconds: float
    platform: str
    python_version: str


class AdminDashboardResponse(BaseModel):
    """Consolidated metrics bundle for the administrative dashboard."""
    total_users: int
    total_predictions: int
    most_predicted_diseases: List[DiseaseFrequency]
    recent_predictions: List[PredictionResponse]
    system_health: SystemHealthStatus
    model_version: str

    model_config = ConfigDict(from_attributes=True)
