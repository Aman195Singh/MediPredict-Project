@echo off
echo Starting MediPredict Backend and Frontend...

:: Start the Backend in a new window
echo Starting FastAPI Backend on port 8000...
start "MediPredict Backend" cmd /c "cd backend && .\venv\Scripts\activate && uvicorn main:app --reload --port 8000"

:: Start the Frontend in a new window
echo Starting React Frontend on port 5173...
start "MediPredict Frontend" cmd /c "cd front end part && npm run dev"

echo Both servers are starting up!
echo Please wait a few seconds, then open your browser to: http://localhost:5173
pause
