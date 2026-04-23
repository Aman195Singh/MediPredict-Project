"""
Pydantic schemas for request/response validation.
These define the exact JSON shape for every API endpoint.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ══════════════════════════════════════════════════════════════
#   AUTH SCHEMAS
# ══════════════════════════════════════════════════════════════

class SignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: datetime

    class Config:
        from_attributes = True


# ══════════════════════════════════════════════════════════════
#   PREDICTION SCHEMAS
# ══════════════════════════════════════════════════════════════

class PredictDiseaseRequest(BaseModel):
    disease: str = Field(..., pattern="^(diabetes|heart|kidney|liver)$")
    params: dict

class PredictAllRequest(BaseModel):
    params: dict

class FeatureImportance(BaseModel):
    feature: str
    display_name: str
    shap_value: float
    impact_percentage: float
    direction: str  # "risk" or "protective"

class DiseaseResult(BaseModel):
    disease_name: str
    risk_percentage: float
    risk_level: str  # "High Risk", "Moderate Risk", "Low Risk"
    prediction: int  # 0 or 1
    feature_importances: list[FeatureImportance]
    explanation: str
    suggestions: list[str]
    input_parameters: dict

class PredictResponse(BaseModel):
    submission_id: int
    mode: str
    title: str
    results: list[DiseaseResult]
    created_at: datetime


# ══════════════════════════════════════════════════════════════
#   HISTORY SCHEMAS
# ══════════════════════════════════════════════════════════════

class HistoryItem(BaseModel):
    id: int
    mode: str
    title: str
    created_at: datetime
    diseases: list[str]
    risk_percentages: dict[str, float]  # e.g. {"diabetes": 72.5, "heart": 34.2}

    class Config:
        from_attributes = True

class HistoryDetailResponse(BaseModel):
    id: int
    mode: str
    title: str
    created_at: datetime
    results: list[DiseaseResult]

    class Config:
        from_attributes = True
