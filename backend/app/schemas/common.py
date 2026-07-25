"""
Shared Pydantic schemas for the Enterprise AI Medical Diagnosis Assistant.

Defines common response structures used across multiple API endpoints.
"""

from typing import Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")


class MessageResponse(BaseModel):
    """Generic message response model for basic notifications."""
    message: str


class StatusResponse(BaseModel):
    """System status check response model."""
    status: str
    version: str
    environment: str


class DataResponse(BaseModel, Generic[T]):
    """Standardized wrapper for endpoints returning data objects."""
    success: bool
    data: T
    message: Optional[str] = None
