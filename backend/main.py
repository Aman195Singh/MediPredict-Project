"""
MediPredict — FastAPI Backend Entry Point

Run locally:
  cd backend
  .\\venv\\Scripts\\activate
  uvicorn main:app --reload --port 8000

Then open: http://localhost:8000/docs  (Swagger UI)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables FIRST (before any other imports use them)
load_dotenv()

from db.database import engine
from db.models import Base
from routers import auth, predict, history

# ── Create all database tables ────────────────────────────────
Base.metadata.create_all(bind=engine)

# ── Create FastAPI app ────────────────────────────────────────
app = FastAPI(
    title="MediPredict API",
    description="Multi-disease prediction with SHAP explainability",
    version="1.0.0"
)

# ── CORS — allow frontend to call this API ────────────────────
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:8080",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ─────────────────────────────────────────
app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(history.router)


# ── Health check endpoint ─────────────────────────────────────
@app.get("/health")
def health_check():
    """Simple health check — returns OK if server is running."""
    return {"status": "ok", "app": "MediPredict API", "version": "1.0.0"}
