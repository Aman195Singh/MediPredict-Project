"""
Prediction router — Execute ML models, compute SHAP, generate Gemini suggestions,
and save the entire result to the database.

Endpoints:
  POST /predict/disease — Predict a single specific disease
  POST /predict/all     — Predict all 4 diseases at once
"""

import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User, Submission, PredictionResult
from routers.auth import get_current_user
from schemas.schemas import PredictDiseaseRequest, PredictAllRequest, PredictResponse, DiseaseResult, FeatureImportance
from services import ml_service, gemini_service

router = APIRouter(prefix="/predict", tags=["Prediction"])


# ══════════════════════════════════════════════════════════════
#   HELPER FUNCTIONS
# ══════════════════════════════════════════════════════════════

async def process_disease_prediction(disease: str, params: dict) -> DiseaseResult:
    """Run full pipeline for a single disease."""
    try:
        # 1. Run ML Prediction
        ml_result = ml_service.predict(disease, params)
        
        # 2. Compute SHAP values
        shap_values = ml_service.explain(disease, params)
        
        # 3. Generate Gemini Health Suggestions
        suggestions = await gemini_service.get_health_suggestions(
            disease=disease,
            risk_pct=ml_result['risk_percentage'],
            params=params,
            shap_explanation=shap_values
        )
        
        # 4. Generate Plain English Explanation
        explanation = ml_service.generate_explanation_text(
            disease=disease,
            risk_pct=ml_result['risk_percentage'],
            importances=shap_values
        )
        
        # Convert SHAP dicts to Pydantic FeatureImportance
        features = [FeatureImportance(**f) for f in shap_values]
        
        disease_names = {
            'diabetes': 'Diabetes',
            'heart': 'Heart Disease',
            'kidney': 'Kidney Disease',
            'liver': 'Liver Disease'
        }

        return DiseaseResult(
            disease_name=disease_names.get(disease, disease.title()),
            risk_percentage=ml_result['risk_percentage'],
            risk_level=ml_result['risk_level'],
            prediction=ml_result['prediction'],
            feature_importances=features,
            explanation=explanation,
            suggestions=suggestions,
            input_parameters=params
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed for {disease}: {str(e)}"
        )


def save_submission_to_db(db: Session, user_id: int, mode: str, title: str, results: list[DiseaseResult]) -> Submission:
    """Save the submission and all its prediction results to SQLite."""
    # Create main submission record
    submission = Submission(
        user_id=user_id,
        mode=mode,
        title=title,
        created_at=datetime.now(timezone.utc)
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    # Create individual result records
    for res in results:
        # Convert objects to JSON strings for storage
        db_result = PredictionResult(
            submission_id=submission.id,
            disease_name=res.disease_name,
            risk_percentage=res.risk_percentage,
            input_parameters=json.dumps(res.input_parameters),
            shap_values=json.dumps([f.model_dump() for f in res.feature_importances]),
            ai_suggestions=json.dumps(res.suggestions),
            plain_english_explanation=res.explanation
        )
        db.add(db_result)
        
    db.commit()
    return submission


def generate_title(disease: str = None) -> str:
    """Generate a human-readable title for the submission."""
    date_str = datetime.now().strftime("%d %b %Y")
    if disease:
        disease_names = {
            'diabetes': 'Diabetes',
            'heart': 'Heart Disease',
            'kidney': 'Kidney Disease',
            'liver': 'Liver Disease'
        }
        name = disease_names.get(disease, disease.title())
        return f"{name} Assessment — {date_str}"
    return f"Comprehensive Analysis — {date_str}"


# ══════════════════════════════════════════════════════════════
#   ENDPOINTS
# ══════════════════════════════════════════════════════════════

@router.post("/disease", response_model=PredictResponse)
async def predict_single_disease(
    request: PredictDiseaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Predict risk for a single specific disease."""
    
    # Process pipeline
    result = await process_disease_prediction(request.disease, request.params)
    
    # Save to DB
    title = generate_title(request.disease)
    submission = save_submission_to_db(
        db=db, 
        user_id=current_user.id, 
        mode="specific", 
        title=title, 
        results=[result]
    )
    
    return PredictResponse(
        submission_id=submission.id,
        mode=submission.mode,
        title=submission.title,
        results=[result],
        created_at=submission.created_at
    )


@router.post("/all", response_model=PredictResponse)
async def predict_all_diseases(
    request: PredictAllRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Predict risk for all 4 diseases at once."""
    diseases = ['diabetes', 'heart', 'kidney', 'liver']
    results = []
    
    for disease in diseases:
        res = await process_disease_prediction(disease, request.params)
        results.append(res)
        
    # Save to DB
    title = generate_title(None)
    submission = save_submission_to_db(
        db=db, 
        user_id=current_user.id, 
        mode="all", 
        title=title, 
        results=results
    )
    
    return PredictResponse(
        submission_id=submission.id,
        mode=submission.mode,
        title=submission.title,
        results=results,
        created_at=submission.created_at
    )
