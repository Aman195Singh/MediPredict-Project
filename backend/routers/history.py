"""
History router — Manage user's previous prediction submissions.

Endpoints:
  GET /history         — Return all submissions for logged-in user
  GET /history/{id}    — Return full detailed result for a single submission
  DELETE /history/{id} — Delete a submission
"""

import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User, Submission, PredictionResult
from routers.auth import get_current_user
from schemas.schemas import HistoryItem, HistoryDetailResponse, DiseaseResult, FeatureImportance

router = APIRouter(prefix="/history", tags=["History"])


@router.get("", response_model=list[HistoryItem])
def get_user_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all past prediction submissions for the current user.
    Ordered by newest first.
    """
    submissions = (
        db.query(Submission)
        .filter(Submission.user_id == current_user.id)
        .order_by(Submission.created_at.desc())
        .all()
    )
    
    # Format into HistoryItem schema
    history_items = []
    for sub in submissions:
        diseases = []
        risk_pcts = {}
        for res in sub.results:
            diseases.append(res.disease_name)
            risk_pcts[res.disease_name.lower().replace(" disease", "")] = res.risk_percentage
            
        history_items.append(HistoryItem(
            id=sub.id,
            mode=sub.mode,
            title=sub.title,
            created_at=sub.created_at,
            diseases=diseases,
            risk_percentages=risk_pcts
        ))
        
    return history_items


@router.get("/{submission_id}", response_model=HistoryDetailResponse)
def get_submission_detail(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the full detailed result for a specific submission.
    Includes all SHAP explanations and Gemini AI suggestions.
    """
    submission = (
        db.query(Submission)
        .filter(Submission.id == submission_id)
        .first()
    )
    
    # 1. Ensure submission exists
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
        
    # 2. Ensure user owns the submission
    if submission.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this submission"
        )
        
    # Reconstruct the DiseaseResult objects from the DB JSON fields
    results = []
    for res in submission.results:
        # Parse JSON fields safely
        try:
            params = json.loads(res.input_parameters) if res.input_parameters else {}
            shap_list = json.loads(res.shap_values) if res.shap_values else []
            suggs = json.loads(res.ai_suggestions) if res.ai_suggestions else []
        except json.JSONDecodeError:
            params, shap_list, suggs = {}, [], []
            
        features = [FeatureImportance(**f) for f in shap_list]
        
        # Risk level determination based on original logic
        if res.risk_percentage >= 60:
            risk_level = "High Risk"
        elif res.risk_percentage >= 30:
            risk_level = "Moderate Risk"
        else:
            risk_level = "Low Risk"
            
        # We didn't save `prediction` int specifically, but we can infer from risk %
        # as per ml_service logic (usually threshold is around 50%)
        prediction = 1 if res.risk_percentage >= 50 else 0
        
        results.append(DiseaseResult(
            disease_name=res.disease_name,
            risk_percentage=res.risk_percentage,
            risk_level=risk_level,
            prediction=prediction,
            feature_importances=features,
            explanation=res.plain_english_explanation or "",
            suggestions=suggs,
            input_parameters=params
        ))
        
    return HistoryDetailResponse(
        id=submission.id,
        mode=submission.mode,
        title=submission.title,
        created_at=submission.created_at,
        results=results
    )


@router.delete("/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a submission and all its associated results.
    """
    submission = (
        db.query(Submission)
        .filter(Submission.id == submission_id)
        .first()
    )
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
        
    if submission.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this submission"
        )
        
    db.delete(submission)
    db.commit()
    
    return None
