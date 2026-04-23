"""
MediPredict — ML Service
=========================
Loads all 4 trained RandomForest models + scalers from .pkl files.
Provides:
  - predict(disease, params)  → risk percentage + prediction label
  - explain(disease, params)  → SHAP-based feature importances

The encoding logic here EXACTLY mirrors train_models.py so that
the models receive data in the same format they were trained on.
"""

import os
import logging
import numpy as np
import joblib
import shap

logger = logging.getLogger(__name__)

# ── Paths ─────────────────────────────────────────────────────
MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

# ── Load models + scalers at module level (once on startup) ───
_models = {}
_scalers = {}

def _load():
    """Load all .pkl files into memory. Called once at import time."""
    for disease in ('diabetes', 'heart', 'kidney', 'liver'):
        model_path  = os.path.join(MODEL_DIR, f'{disease}_model.pkl')
        scaler_path = os.path.join(MODEL_DIR, f'{disease}_scaler.pkl')

        if os.path.exists(model_path) and os.path.exists(scaler_path):
            _models[disease]  = joblib.load(model_path)
            _scalers[disease] = joblib.load(scaler_path)
            logger.info(f"Loaded {disease} model + scaler")
        else:
            logger.warning(f"Missing model files for {disease}: {model_path}")

_load()


# ══════════════════════════════════════════════════════════════
#   FEATURE DEFINITIONS — exact column order & encoding
#   Must match train_models.py EXACTLY
# ══════════════════════════════════════════════════════════════

# --- DIABETES ---
DIABETES_FEATURES = [
    'gender', 'age', 'hypertension', 'heart_disease',
    'smoking_history', 'bmi', 'HbA1c_level', 'blood_glucose_level'
]
DIABETES_DISPLAY = {
    'gender': 'Gender', 'age': 'Age', 'hypertension': 'Hypertension',
    'heart_disease': 'Heart Disease History', 'smoking_history': 'Smoking History',
    'bmi': 'BMI', 'HbA1c_level': 'HbA1c Level',
    'blood_glucose_level': 'Blood Glucose Level'
}
# LabelEncoder sorted alphabetically: Female=0, Male=1, Other=2
_DIABETES_GENDER = {'Female': 0, 'Male': 1, 'Other': 2}
# LabelEncoder: 'No Info'=0, current=1, ever=2, former=3, never=4, 'not current'=5
_DIABETES_SMOKING = {
    'No Info': 0, 'current': 1, 'ever': 2,
    'former': 3, 'never': 4, 'not current': 5
}


# --- HEART DISEASE ---
HEART_FEATURES = [
    'age', 'sex', 'chest_pain_type', 'resting_blood_pressure',
    'cholestoral', 'fasting_blood_sugar', 'rest_ecg', 'Max_heart_rate',
    'exercise_induced_angina', 'oldpeak', 'slope',
    'vessels_colored_by_flourosopy', 'thalassemia'
]
HEART_DISPLAY = {
    'age': 'Age', 'sex': 'Sex', 'chest_pain_type': 'Chest Pain Type',
    'resting_blood_pressure': 'Resting Blood Pressure',
    'cholestoral': 'Serum Cholesterol',
    'fasting_blood_sugar': 'Fasting Blood Sugar',
    'rest_ecg': 'Resting ECG', 'Max_heart_rate': 'Max Heart Rate',
    'exercise_induced_angina': 'Exercise-Induced Angina',
    'oldpeak': 'ST Depression (Oldpeak)',
    'slope': 'Slope of ST Segment',
    'vessels_colored_by_flourosopy': 'Major Vessels',
    'thalassemia': 'Thalassemia'
}
_HEART_ENCODINGS = {
    'sex': {'Female': 0, 'Male': 1},
    'chest_pain_type': {
        'Asymptomatic': 0, 'Atypical angina': 1,
        'Non-anginal pain': 2, 'Typical angina': 3
    },
    'fasting_blood_sugar': {
        'Greater than 120 mg/ml': 0, 'Lower than 120 mg/ml': 1
    },
    'rest_ecg': {
        'Left ventricular hypertrophy': 0, 'Normal': 1,
        'ST-T wave abnormality': 2
    },
    'exercise_induced_angina': {'No': 0, 'Yes': 1},
    'slope': {'Downsloping': 0, 'Flat': 1, 'Upsloping': 2},
    'vessels_colored_by_flourosopy': {
        'Four': 0, 'One': 1, 'Three': 2, 'Two': 3, 'Zero': 4
    },
    'thalassemia': {
        'Fixed Defect': 0, 'No': 1, 'Normal': 2, 'Reversable Defect': 3
    },
}
# Map frontend values (0, 1, 2, 3) to text that LabelEncoder expects
_VESSELS_NUM_TO_TEXT = {'0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three'}


# --- KIDNEY DISEASE ---
KIDNEY_FEATURES = [
    'age', 'bp', 'sg', 'al', 'su', 'rbc', 'pc', 'pcc', 'ba',
    'bgr', 'bu', 'sc', 'sod', 'pot', 'hemo', 'pcv', 'wc', 'rc',
    'htn', 'dm', 'cad', 'appet', 'pe', 'ane'
]
KIDNEY_DISPLAY = {
    'age': 'Age', 'bp': 'Blood Pressure', 'sg': 'Specific Gravity',
    'al': 'Albumin', 'su': 'Sugar', 'rbc': 'Red Blood Cells',
    'pc': 'Pus Cells', 'pcc': 'Pus Cell Clumps', 'ba': 'Bacteria',
    'bgr': 'Blood Glucose Random', 'bu': 'Blood Urea',
    'sc': 'Serum Creatinine', 'sod': 'Sodium', 'pot': 'Potassium',
    'hemo': 'Hemoglobin', 'pcv': 'Packed Cell Volume',
    'wc': 'White Blood Cell Count', 'rc': 'Red Blood Cell Count',
    'htn': 'Hypertension', 'dm': 'Diabetes Mellitus',
    'cad': 'Coronary Artery Disease', 'appet': 'Appetite',
    'pe': 'Pedal Edema', 'ane': 'Anemia'
}
_KIDNEY_ENCODINGS = {
    'rbc':   {'abnormal': 0, 'normal': 1},
    'pc':    {'abnormal': 0, 'normal': 1},
    'pcc':   {'notpresent': 0, 'present': 1},
    'ba':    {'notpresent': 0, 'present': 1},
    'htn':   {'no': 0, 'yes': 1},
    # dm has messy values in dataset: '\tno'=0, '\tyes'=1, ' yes'=2, 'no'=3, 'yes'=4
    # For inference from clean frontend input, map 'no'→3, 'yes'→4
    'dm':    {'no': 3, 'yes': 4},
    # cad has '\tno'=0, 'no'=1, 'yes'=2. Clean input: 'no'→1, 'yes'→2
    'cad':   {'no': 1, 'yes': 2},
    'appet': {'good': 0, 'poor': 1},
    'pe':    {'no': 0, 'yes': 1},
    'ane':   {'no': 0, 'yes': 1},
}


# --- LIVER DISEASE ---
LIVER_FEATURES = [
    'age', 'gender', 'tot_bilirubin', 'direct_bilirubin',
    'tot_proteins', 'albumin', 'ag_ratio', 'sgpt', 'sgot', 'alkphos'
]
LIVER_DISPLAY = {
    'age': 'Age', 'gender': 'Gender', 'tot_bilirubin': 'Total Bilirubin',
    'direct_bilirubin': 'Direct Bilirubin', 'tot_proteins': 'Total Proteins',
    'albumin': 'Albumin', 'ag_ratio': 'Albumin/Globulin Ratio',
    'sgpt': 'SGPT (ALT)', 'sgot': 'SGOT (AST)',
    'alkphos': 'Alkaline Phosphatase'
}
_LIVER_GENDER = {'Female': 0, 'Male': 1}


# ── Mapping: disease key → (features, display names) ─────────
DISEASE_CONFIG = {
    'diabetes': (DIABETES_FEATURES, DIABETES_DISPLAY),
    'heart':    (HEART_FEATURES,    HEART_DISPLAY),
    'kidney':   (KIDNEY_FEATURES,   KIDNEY_DISPLAY),
    'liver':    (LIVER_FEATURES,    LIVER_DISPLAY),
}


# ══════════════════════════════════════════════════════════════
#   ENCODING FUNCTIONS — convert frontend params to model input
# ══════════════════════════════════════════════════════════════

def _encode_diabetes(params: dict) -> np.ndarray:
    """Convert raw params dict to the numeric array the diabetes model expects."""
    gender_str = str(params.get('gender', 'Male'))
    smoking_str = str(params.get('smoking_history', 'never'))

    return np.array([[
        _DIABETES_GENDER.get(gender_str, 1),           # gender
        float(params.get('age', 30)),                   # age
        int(params.get('hypertension', 0)),             # hypertension
        int(params.get('heart_disease', 0)),            # heart_disease
        _DIABETES_SMOKING.get(smoking_str, 4),          # smoking_history
        float(params.get('bmi', 25.0)),                 # bmi
        float(params.get('HbA1c_level', 5.5)),          # HbA1c_level
        float(params.get('blood_glucose_level', 100)),  # blood_glucose_level
    ]])


def _encode_heart(params: dict) -> np.ndarray:
    """Convert raw params dict to the numeric array the heart model expects."""
    if 'gender' in params and 'sex' not in params:
        params['sex'] = params['gender']
        
    # Handle vessels: frontend sends 0-3 as numbers, model expects text encoding
    vessels_val = str(params.get('vessels_colored_by_flourosopy', '0'))
    vessels_text = _VESSELS_NUM_TO_TEXT.get(vessels_val, vessels_val)

    row = []
    for feat in HEART_FEATURES:
        if feat in _HEART_ENCODINGS:
            if feat == 'vessels_colored_by_flourosopy':
                val = _HEART_ENCODINGS[feat].get(vessels_text, 4)  # default Zero=4
            else:
                raw = str(params.get(feat, ''))
                val = _HEART_ENCODINGS[feat].get(raw, 0)
            row.append(float(val))
        else:
            row.append(float(params.get(feat, 0)))

    return np.array([row])


def _encode_kidney(params: dict) -> np.ndarray:
    """Convert raw params dict to the numeric array the kidney model expects."""
    row = []
    for feat in KIDNEY_FEATURES:
        if feat in _KIDNEY_ENCODINGS:
            raw = str(params.get(feat, '')).lower().strip()
            val = _KIDNEY_ENCODINGS[feat].get(raw, 0)
            row.append(float(val))
        else:
            row.append(float(params.get(feat, 0)))

    return np.array([row])


def _encode_liver(params: dict) -> np.ndarray:
    """Convert raw params dict to the numeric array the liver model expects."""
    gender_str = str(params.get('gender', 'Male'))
    return np.array([[
        float(params.get('age', 45)),
        _LIVER_GENDER.get(gender_str, 1),
        float(params.get('tot_bilirubin', 1.0)),
        float(params.get('direct_bilirubin', 0.3)),
        float(params.get('tot_proteins', 6.5)),
        float(params.get('albumin', 3.5)),
        float(params.get('ag_ratio', 1.0)),
        float(params.get('sgpt', 25)),
        float(params.get('sgot', 30)),
        float(params.get('alkphos', 200)),
    ]])


_ENCODERS = {
    'diabetes': _encode_diabetes,
    'heart':    _encode_heart,
    'kidney':   _encode_kidney,
    'liver':    _encode_liver,
}


# ══════════════════════════════════════════════════════════════
#   PREDICTION
# ══════════════════════════════════════════════════════════════

def predict(disease: str, params: dict) -> dict:
    """
    Run a prediction for a single disease.

    Returns:
        {
            'risk_percentage': float (0-100),
            'prediction': int (0 or 1),
            'risk_level': str ('Low Risk' | 'Moderate Risk' | 'High Risk')
        }
    """
    if disease not in _models:
        raise ValueError(f"Model not loaded for disease: {disease}")

    model  = _models[disease]
    scaler = _scalers[disease]

    # Encode raw params into numeric array
    encode_fn = _ENCODERS[disease]
    X_raw = encode_fn(params)

    # Scale with the same scaler used during training
    X_scaled = scaler.transform(X_raw)

    # Predict probability of class 1 (has disease)
    proba = model.predict_proba(X_scaled)[0]

    # Class 1 probability → risk percentage
    risk_pct = round(float(proba[1]) * 100, 1)
    prediction = int(model.predict(X_scaled)[0])

    # Risk level
    if risk_pct >= 60:
        risk_level = 'High Risk'
    elif risk_pct >= 30:
        risk_level = 'Moderate Risk'
    else:
        risk_level = 'Low Risk'

    return {
        'risk_percentage': risk_pct,
        'prediction': prediction,
        'risk_level': risk_level,
    }


# ══════════════════════════════════════════════════════════════
#   SHAP EXPLAINABILITY
# ══════════════════════════════════════════════════════════════

def explain(disease: str, params: dict) -> list[dict]:
    """
    Compute SHAP values for a single prediction.

    Returns a sorted list of dicts:
        [
            {
                'feature': str,
                'display_name': str,
                'shap_value': float,
                'impact_percentage': float,
                'direction': 'risk' | 'protective'
            },
            ...
        ]
    Sorted by absolute SHAP value descending (most important first).
    """
    if disease not in _models:
        raise ValueError(f"Model not loaded for disease: {disease}")

    model  = _models[disease]
    scaler = _scalers[disease]

    encode_fn = _ENCODERS[disease]
    X_raw = encode_fn(params)
    X_scaled = scaler.transform(X_raw)

    features, display_names = DISEASE_CONFIG[disease]

    try:
        # Use TreeExplainer for Random Forest models
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_scaled)

        # For binary classification, shap_values might be a list or a 3D array
        # We want class 1 (disease positive) for the first (only) sample
        if isinstance(shap_values, list):
            sv = shap_values[1][0]  # class 1, first (only) sample
        elif isinstance(shap_values, np.ndarray) and len(shap_values.shape) == 3:
            sv = shap_values[0, :, 1] # shape (1, n_features, 2) -> (n_features,)
        else:
            sv = shap_values[0]  # single array

    except Exception as e:
        logger.warning(f"SHAP computation failed for {disease}: {e}")
        # Fallback: use feature_importances_ from RandomForest
        importances = model.feature_importances_
        sv = importances  # Use built-in feature importance as proxy

    # Build result list
    total_abs = sum(abs(v) for v in sv) or 1.0
    result = []
    for i, feat in enumerate(features):
        shap_val = float(sv[i]) if i < len(sv) else 0.0
        impact_pct = round(abs(shap_val) / total_abs * 100, 1)
        result.append({
            'feature': feat,
            'display_name': display_names.get(feat, feat),
            'shap_value': round(shap_val, 4),
            'impact_percentage': impact_pct,
            'direction': 'risk' if shap_val > 0 else 'protective',
        })

    # Sort by absolute impact descending
    result.sort(key=lambda x: abs(x['shap_value']), reverse=True)

    return result


def generate_explanation_text(disease: str, risk_pct: float, importances: list[dict]) -> str:
    """
    Generate a plain-English paragraph explaining the prediction result.
    Uses the top SHAP features to describe why the risk is what it is.
    """
    disease_name = {
        'diabetes': 'Diabetes',
        'heart': 'Heart Disease',
        'kidney': 'Kidney Disease',
        'liver': 'Liver Disease',
    }.get(disease, disease.title())

    risk_level = 'high' if risk_pct >= 60 else 'moderate' if risk_pct >= 30 else 'low'
    top_factors = importances[:5]

    risk_factors = [f['display_name'] for f in top_factors if f['direction'] == 'risk']
    protective_factors = [f['display_name'] for f in top_factors if f['direction'] == 'protective']

    parts = [
        f"Based on the analysis of your medical parameters, your {disease_name} risk is "
        f"estimated at {risk_pct}%, which is considered {risk_level} risk."
    ]

    if risk_factors:
        factors_str = ', '.join(risk_factors[:3])
        parts.append(
            f"The primary factors contributing to your risk are: {factors_str}. "
            f"These parameters are outside the optimal range and increase your disease likelihood."
        )

    if protective_factors:
        factors_str = ', '.join(protective_factors[:2])
        parts.append(
            f"On a positive note, your {factors_str} values are within a healthy range, "
            f"which helps lower your overall risk."
        )

    parts.append(
        "This analysis is provided by a Machine Learning model using SHAP (SHapley Additive exPlanations) "
        "to explain the key factors behind the prediction. Please consult a healthcare "
        "professional for a comprehensive evaluation."
    )

    return ' '.join(parts)
