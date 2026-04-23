"""
Database models (SQLAlchemy ORM tables).

Tables:
  - users: Registered user accounts
  - submissions: Each form submission (one per predict action)
  - prediction_results: One result per disease per submission
"""

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship: one user has many submissions
    submissions = relationship("Submission", back_populates="user", cascade="all, delete-orphan")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mode = Column(String(20), nullable=False)  # "all" or "specific"
    title = Column(String(255), nullable=False)  # auto-generated, e.g. "All Diseases — 22 Apr 2026"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="submissions")
    results = relationship("PredictionResult", back_populates="submission", cascade="all, delete-orphan")


class PredictionResult(Base):
    __tablename__ = "prediction_results"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    disease_name = Column(String(50), nullable=False)  # "diabetes", "heart", "kidney", "liver"
    risk_percentage = Column(Float, nullable=False)
    input_parameters = Column(Text, nullable=False)     # JSON string of form values
    shap_values = Column(Text, nullable=True)            # JSON string of SHAP explanations
    ai_suggestions = Column(Text, nullable=True)         # Health suggestions
    plain_english_explanation = Column(Text, nullable=True)  # Human-readable explanation

    # Relationship
    submission = relationship("Submission", back_populates="results")
