"""
MediPredict — Train All 4 Disease Models
==========================================
This script trains RandomForest models for Diabetes, Heart Disease,
Kidney Disease, and Liver Disease using the CSV datasets.

Outputs:  8 .pkl files saved to backend/models/
  - diabetes_model.pkl   + diabetes_scaler.pkl
  - heart_model.pkl      + heart_scaler.pkl
  - kidney_model.pkl     + kidney_scaler.pkl
  - liver_model.pkl      + liver_scaler.pkl

Usage:
  cd "d:\Health Insite Engine web app\backend"
  python train_models.py
"""

import os
import sys
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import warnings
warnings.filterwarnings('ignore')

# ── Paths ─────────────────────────────────────────────────────
DATASET_DIR = os.path.join(os.path.dirname(__file__), '..', 'back end part', 'dataset_ML_training')
MODEL_DIR   = os.path.join(os.path.dirname(__file__), 'models')

os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 60)
print("   🏥  MediPredict — Model Training Pipeline")
print("=" * 60)
print(f"   Dataset dir: {os.path.abspath(DATASET_DIR)}")
print(f"   Model dir:   {os.path.abspath(MODEL_DIR)}")
print("=" * 60)


# ══════════════════════════════════════════════════════════════
#   1. DIABETES MODEL
# ══════════════════════════════════════════════════════════════
def train_diabetes():
    print("\n" + "─" * 50)
    print("🩸  Training DIABETES model...")
    print("─" * 50)

    df = pd.read_csv(os.path.join(DATASET_DIR, 'diabetes_prediction_dataset.csv'))
    print(f"   Loaded: {df.shape[0]} rows, {df.shape[1]} columns")

    # Encode text columns
    le_gender = LabelEncoder()
    df['gender'] = le_gender.fit_transform(df['gender'])

    le_smoke = LabelEncoder()
    df['smoking_history'] = le_smoke.fit_transform(df['smoking_history'])

    # Separate features and target
    X = df.drop('diabetes', axis=1)
    y = df['diabetes']

    # Scale
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    # Train
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"   ✅ Accuracy: {acc * 100:.2f}%")
    print(classification_report(y_test, y_pred,
          target_names=['No Diabetes', 'Has Diabetes']))

    # Save
    joblib.dump(model,  os.path.join(MODEL_DIR, 'diabetes_model.pkl'))
    joblib.dump(scaler, os.path.join(MODEL_DIR, 'diabetes_scaler.pkl'))
    print("   💾 Saved: diabetes_model.pkl + diabetes_scaler.pkl")

    return acc


# ══════════════════════════════════════════════════════════════
#   2. HEART DISEASE MODEL
# ══════════════════════════════════════════════════════════════
def train_heart():
    print("\n" + "─" * 50)
    print("❤️  Training HEART DISEASE model...")
    print("─" * 50)

    df = pd.read_csv(os.path.join(DATASET_DIR, 'HeartDiseaseTrain-Test.csv'))
    print(f"   Loaded: {df.shape[0]} rows, {df.shape[1]} columns")

    # Encode all text columns
    text_cols = [
        'sex', 'chest_pain_type', 'fasting_blood_sugar', 'rest_ecg',
        'exercise_induced_angina', 'slope', 'vessels_colored_by_flourosopy',
        'thalassemia'
    ]

    df_clean = df.copy()
    for col in text_cols:
        le = LabelEncoder()
        df_clean[col] = le.fit_transform(df_clean[col])

    # Separate features and target
    X = df_clean.drop('target', axis=1)
    y = df_clean['target']

    # Scale
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    # Train
    model = RandomForestClassifier(
        n_estimators=200, max_depth=10, random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"   ✅ Accuracy: {acc * 100:.2f}%")
    print(classification_report(y_test, y_pred,
          target_names=['No Heart Disease', 'Has Heart Disease']))

    # Save
    joblib.dump(model,  os.path.join(MODEL_DIR, 'heart_model.pkl'))
    joblib.dump(scaler, os.path.join(MODEL_DIR, 'heart_scaler.pkl'))
    print("   💾 Saved: heart_model.pkl + heart_scaler.pkl")

    return acc


# ══════════════════════════════════════════════════════════════
#   3. KIDNEY DISEASE MODEL
# ══════════════════════════════════════════════════════════════
def train_kidney():
    print("\n" + "─" * 50)
    print("🫘  Training KIDNEY DISEASE model...")
    print("─" * 50)

    df = pd.read_csv(os.path.join(DATASET_DIR, 'kidney_disease.csv'))
    print(f"   Loaded: {df.shape[0]} rows, {df.shape[1]} columns")

    df_clean = df.copy()

    # Drop id column
    df_clean.drop('id', axis=1, inplace=True)

    # Fix target column
    df_clean['classification'] = df_clean['classification'].str.strip()
    df_clean['classification'] = df_clean['classification'].map({
        'ckd': 1, 'notckd': 0
    })

    # Fix numeric columns stored as text
    for col in ['pcv', 'wc', 'rc']:
        df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')

    # Fill missing values
    for col in df_clean.columns:
        if df_clean[col].isnull().sum() == 0:
            continue
        if str(df_clean[col].dtype) in ('object', 'str', 'string'):
            df_clean[col] = df_clean[col].fillna(df_clean[col].mode()[0])
        else:
            df_clean[col] = df_clean[col].fillna(df_clean[col].median())

    # Encode text columns (handle both 'object' and 'str' dtypes for Python 3.14 compat)
    text_cols = [col for col in df_clean.columns
                 if str(df_clean[col].dtype) in ('object', 'str', 'string')]
    text_cols = [c for c in text_cols if c != 'classification']

    for col in text_cols:
        le = LabelEncoder()
        df_clean[col] = le.fit_transform(df_clean[col])

    # Separate features and target
    X = df_clean.drop('classification', axis=1)
    y = df_clean['classification']

    # Scale
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    # Train
    model = RandomForestClassifier(
        n_estimators=200, max_depth=10, min_samples_split=4, random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"   ✅ Accuracy: {acc * 100:.2f}%")
    print(classification_report(y_test, y_pred,
          target_names=['No Kidney Disease', 'Has Kidney Disease']))

    # Save
    joblib.dump(model,  os.path.join(MODEL_DIR, 'kidney_model.pkl'))
    joblib.dump(scaler, os.path.join(MODEL_DIR, 'kidney_scaler.pkl'))
    print("   💾 Saved: kidney_model.pkl + kidney_scaler.pkl")

    return acc


# ══════════════════════════════════════════════════════════════
#   4. LIVER DISEASE MODEL
# ══════════════════════════════════════════════════════════════
def train_liver():
    print("\n" + "─" * 50)
    print("🫀  Training LIVER DISEASE model...")
    print("─" * 50)

    df = pd.read_csv(os.path.join(DATASET_DIR, 'Indian Liver Patient Dataset.csv'))
    print(f"   Loaded: {df.shape[0]} rows, {df.shape[1]} columns")

    df_clean = df.copy()

    # Fix target: 1=disease, 2=no disease → 1=disease, 0=no disease
    df_clean['is_patient'] = df_clean['is_patient'].map({1: 1, 2: 0})

    # Encode gender
    le_gender = LabelEncoder()
    df_clean['gender'] = le_gender.fit_transform(df_clean['gender'])

    # Fill missing ag_ratio values
    df_clean['ag_ratio'].fillna(df_clean['ag_ratio'].median(), inplace=True)

    # Separate features and target
    X = df_clean.drop('is_patient', axis=1)
    y = df_clean['is_patient']

    # Scale
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    # Train
    model = RandomForestClassifier(
        n_estimators=200, max_depth=8,
        min_samples_split=5, min_samples_leaf=2, random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"   ✅ Accuracy: {acc * 100:.2f}%")
    print(classification_report(y_test, y_pred,
          target_names=['No Liver Disease', 'Has Liver Disease']))

    # Save
    joblib.dump(model,  os.path.join(MODEL_DIR, 'liver_model.pkl'))
    joblib.dump(scaler, os.path.join(MODEL_DIR, 'liver_scaler.pkl'))
    print("   💾 Saved: liver_model.pkl + liver_scaler.pkl")

    return acc


# ══════════════════════════════════════════════════════════════
#   MAIN — Run All 4 Trainers
# ══════════════════════════════════════════════════════════════
if __name__ == '__main__':
    results = {}

    try:
        results['Diabetes']       = train_diabetes()
    except Exception as e:
        print(f"   ❌ Diabetes training FAILED: {e}")
        results['Diabetes'] = 0

    try:
        results['Heart Disease']  = train_heart()
    except Exception as e:
        print(f"   ❌ Heart training FAILED: {e}")
        results['Heart Disease'] = 0

    try:
        results['Kidney Disease'] = train_kidney()
    except Exception as e:
        print(f"   ❌ Kidney training FAILED: {e}")
        results['Kidney Disease'] = 0

    try:
        results['Liver Disease']  = train_liver()
    except Exception as e:
        print(f"   ❌ Liver training FAILED: {e}")
        results['Liver Disease'] = 0

    # ── Final Summary ─────────────────────────────────────────
    print("\n" + "=" * 60)
    print("   🏆  TRAINING COMPLETE — FINAL SUMMARY")
    print("=" * 60)

    all_pass = True
    for disease, acc in results.items():
        bar  = "█" * int(acc * 30) if acc > 0 else ""
        flag = "✅" if acc >= 0.70 else "❌"
        print(f"   {flag} {disease:<18} {acc*100:6.2f}%  {bar}")
        if acc < 0.70:
            all_pass = False

    print("=" * 60)

    # Check files exist
    print("\n   📦 Saved model files:")
    expected_files = [
        'diabetes_model.pkl', 'diabetes_scaler.pkl',
        'heart_model.pkl',    'heart_scaler.pkl',
        'kidney_model.pkl',   'kidney_scaler.pkl',
        'liver_model.pkl',    'liver_scaler.pkl',
    ]
    all_files_ok = True
    for f in expected_files:
        path = os.path.join(MODEL_DIR, f)
        if os.path.exists(path):
            size_kb = os.path.getsize(path) / 1024
            print(f"      ✅ {f} ({size_kb:.0f} KB)")
        else:
            print(f"      ❌ {f} — MISSING!")
            all_files_ok = False

    if all_pass and all_files_ok:
        print(f"""
   {'='*50}
   🎉  ALL 4 MODELS TRAINED AND SAVED SUCCESSFULLY!
   {'='*50}
   
   All accuracy scores are above 70%.
   All 8 .pkl files are saved in: {os.path.abspath(MODEL_DIR)}
   
   ✅ Phase 1 COMPLETE — Ready for Phase 2 (FastAPI Backend)
""")
    else:
        print("\n   ⚠️  Some models need attention. Check the ❌ items above.")

    sys.exit(0 if (all_pass and all_files_ok) else 1)
