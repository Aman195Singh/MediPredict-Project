"""
MediPredict — Gemini AI Service
=================================
Calls the Google Gemini API to generate personalized health suggestions
based on the patient's medical data, SHAP explanations, and risk level.

Falls back to pre-written generic suggestions if:
  - GEMINI_API_KEY is not set
  - The API call fails or times out
  - Any other error occurs

This ensures the app NEVER crashes due to Gemini unavailability.
"""

import os
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# ── Try to import Gemini SDK ──────────────────────────────────
_gemini_available = False
try:
    import google.generativeai as genai
    if GEMINI_API_KEY and GEMINI_API_KEY != "your-gemini-api-key-here":
        genai.configure(api_key=GEMINI_API_KEY)
        _gemini_available = True
        logger.info("Gemini API configured successfully")
    else:
        logger.warning("GEMINI_API_KEY not set or is placeholder — using fallback suggestions")
except ImportError:
    logger.warning("google-generativeai not installed — using fallback suggestions")
except Exception as e:
    logger.warning(f"Gemini setup failed: {e} — using fallback suggestions")


# ══════════════════════════════════════════════════════════════
#   FALLBACK SUGGESTIONS (used when Gemini is unavailable)
# ══════════════════════════════════════════════════════════════

_FALLBACK_SUGGESTIONS = {
    'diabetes': [
        "Monitor your blood glucose levels regularly and maintain a daily log to track patterns.",
        "Follow a balanced diet low in refined sugars and processed carbohydrates. Focus on whole grains, lean proteins, and vegetables.",
        "Engage in at least 150 minutes of moderate aerobic exercise per week, such as brisk walking or cycling.",
        "Maintain a healthy BMI through portion control and regular physical activity.",
        "Schedule regular check-ups with your healthcare provider, including HbA1c tests every 3-6 months.",
        "Manage stress through meditation, yoga, deep breathing exercises, or other relaxation techniques.",
        "Ensure adequate sleep of 7-8 hours per night, as poor sleep can affect blood sugar regulation.",
        "Stay well-hydrated by drinking sufficient water throughout the day.",
    ],
    'heart': [
        "Monitor your blood pressure regularly and take prescribed medications as directed by your doctor.",
        "Follow a heart-healthy diet rich in fruits, vegetables, whole grains, and omega-3 fatty acids (found in fish, flaxseeds, and walnuts).",
        "Reduce sodium intake to less than 2,300 mg per day to help manage blood pressure.",
        "Engage in regular cardiovascular exercise — at least 30 minutes of moderate activity, 5 days a week.",
        "Maintain cholesterol levels within the recommended range through diet, exercise, and medication if prescribed.",
        "Quit smoking completely and avoid exposure to secondhand smoke.",
        "Limit alcohol consumption to moderate levels (up to 1 drink per day for women, 2 for men).",
        "Manage stress and anxiety through regular relaxation practices. Consider counseling if needed.",
    ],
    'kidney': [
        "Stay well-hydrated by drinking 8-10 glasses of water daily, unless your doctor advises otherwise.",
        "Limit sodium and potassium intake as recommended by your healthcare provider.",
        "Control blood pressure and blood sugar levels, as both high BP and diabetes are leading causes of kidney damage.",
        "Avoid over-the-counter painkillers (NSAIDs) that may harm kidney function when used frequently.",
        "Follow a kidney-friendly diet with moderate protein intake. Consult a renal dietitian.",
        "Get regular kidney function tests including GFR, serum creatinine, and urine analysis.",
        "Quit smoking, as it reduces blood flow to the kidneys and worsens kidney disease.",
        "Maintain a healthy weight and engage in regular, moderate physical activity.",
    ],
    'liver': [
        "Limit alcohol consumption significantly or abstain completely to reduce liver stress.",
        "Maintain a balanced diet rich in fruits, vegetables, whole grains, and lean proteins.",
        "Avoid unnecessary medications, supplements, and herbal remedies that may burden the liver.",
        "Get vaccinated for Hepatitis A and B if you haven't already.",
        "Exercise regularly (at least 30 minutes daily) to maintain a healthy weight and reduce liver fat.",
        "Get liver function tests (LFTs) done periodically to monitor your liver health.",
        "Avoid exposure to toxins and chemicals. Use protective equipment if working with industrial chemicals.",
        "Ensure adequate hydration and limit consumption of processed and fried foods.",
    ],
}


# ══════════════════════════════════════════════════════════════
#   GEMINI API CALL
# ══════════════════════════════════════════════════════════════

_SYSTEM_PROMPT = """You are a compassionate medical assistant. Based on the patient's data and AI explanation provided, give specific, actionable, point-wise health suggestions covering:

1. Dietary changes
2. Exercise recommendations
3. Lifestyle adjustments
4. Medical follow-up advice
5. Mental health and stress management

Rules:
- Give exactly 8 numbered suggestions
- Keep each suggestion concise (1-2 sentences) and in plain English
- Do NOT diagnose the patient
- Do NOT prescribe specific medications
- Always recommend consulting a doctor
- Be empathetic and encouraging in tone
- Tailor suggestions to the specific parameters that are out of range

Output ONLY the 8 numbered suggestions, one per line. No preamble, no conclusion, no markdown."""


def _build_user_prompt(
    disease: str, risk_pct: float, params: dict,
    shap_explanation: list[dict]
) -> str:
    """Build the user prompt with patient data for Gemini."""
    disease_names = {
        'diabetes': 'Diabetes', 'heart': 'Heart Disease',
        'kidney': 'Kidney Disease', 'liver': 'Liver Disease',
    }
    disease_name = disease_names.get(disease, disease.title())

    # Format top SHAP factors
    top_factors = shap_explanation[:5] if shap_explanation else []
    factors_text = "\n".join(
        f"  - {f['display_name']}: {'increases risk' if f['direction'] == 'risk' else 'lowers risk'} "
        f"(impact: {f['impact_percentage']}%)"
        for f in top_factors
    )

    # Format patient parameters
    params_text = "\n".join(f"  - {k}: {v}" for k, v in params.items() if v)

    return f"""Patient Assessment:
- Disease: {disease_name}
- Risk Score: {risk_pct}%
- Risk Level: {'High' if risk_pct >= 60 else 'Moderate' if risk_pct >= 30 else 'Low'}

Patient Parameters:
{params_text}

Key Contributing Factors (from AI analysis):
{factors_text}

Based on this assessment, provide 8 personalized health suggestions."""


def _parse_suggestions(text: str) -> list[str]:
    """Parse Gemini response into a clean list of suggestions."""
    lines = text.strip().split('\n')
    suggestions = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        # Remove numbered prefix like "1.", "1)", "1 -", etc.
        for prefix_len in range(1, 4):
            if line[:prefix_len + 1].rstrip() and line[prefix_len] in '.)-:':
                line = line[prefix_len + 1:].strip()
                break
        if line and len(line) > 10:  # Skip very short or empty lines
            suggestions.append(line)

    return suggestions[:8] if suggestions else []


async def get_health_suggestions(
    disease: str, risk_pct: float, params: dict,
    shap_explanation: list[dict]
) -> list[str]:
    """
    Get personalized health suggestions using Gemini API.
    Falls back to generic suggestions on any failure.

    Args:
        disease: Disease key ('diabetes', 'heart', 'kidney', 'liver')
        risk_pct: Risk percentage (0-100)
        params: Raw patient parameters
        shap_explanation: List of SHAP feature importances

    Returns:
        List of 6-8 suggestion strings
    """
    # If Gemini is not available, return fallback immediately
    if not _gemini_available:
        logger.info(f"Using fallback suggestions for {disease} (Gemini unavailable)")
        return _FALLBACK_SUGGESTIONS.get(disease, _FALLBACK_SUGGESTIONS['diabetes'])

    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        user_prompt = _build_user_prompt(disease, risk_pct, params, shap_explanation)

        response = model.generate_content(
            [
                {"role": "user", "parts": [_SYSTEM_PROMPT + "\n\n" + user_prompt]}
            ],
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 1024,
            }
        )

        if response and response.text:
            suggestions = _parse_suggestions(response.text)
            if len(suggestions) >= 3:
                logger.info(f"Gemini returned {len(suggestions)} suggestions for {disease}")
                return suggestions

        # If parsing failed, fall back
        logger.warning(f"Gemini response parsing failed for {disease}, using fallback")
        return _FALLBACK_SUGGESTIONS.get(disease, _FALLBACK_SUGGESTIONS['diabetes'])

    except Exception as e:
        logger.warning(f"Gemini API call failed for {disease}: {e}")
        return _FALLBACK_SUGGESTIONS.get(disease, _FALLBACK_SUGGESTIONS['diabetes'])


def get_health_suggestions_sync(
    disease: str, risk_pct: float, params: dict,
    shap_explanation: list[dict]
) -> list[str]:
    """
    Synchronous version of get_health_suggestions.
    Used by routers that don't need async.
    """
    if not _gemini_available:
        return _FALLBACK_SUGGESTIONS.get(disease, _FALLBACK_SUGGESTIONS['diabetes'])

    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        user_prompt = _build_user_prompt(disease, risk_pct, params, shap_explanation)

        response = model.generate_content(
            [
                {"role": "user", "parts": [_SYSTEM_PROMPT + "\n\n" + user_prompt]}
            ],
            generation_config={
                "temperature": 0.7,
                "max_output_tokens": 1024,
            }
        )

        if response and response.text:
            suggestions = _parse_suggestions(response.text)
            if len(suggestions) >= 3:
                return suggestions

        return _FALLBACK_SUGGESTIONS.get(disease, _FALLBACK_SUGGESTIONS['diabetes'])

    except Exception as e:
        logger.warning(f"Gemini API call failed for {disease}: {e}")
        return _FALLBACK_SUGGESTIONS.get(disease, _FALLBACK_SUGGESTIONS['diabetes'])
