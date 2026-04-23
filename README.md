# MediPredict: Health Insite Engine 🩺

MediPredict is an advanced, full-stack Machine Learning application designed to predict the risk of four major diseases: **Diabetes**, **Heart Disease**, **Kidney Disease**, and **Liver Disease**. 

Built for robust performance and clinical clarity, this system not only predicts disease risk using trained Random Forest classifiers but also utilizes SHAP (SHapley Additive exPlanations) to provide transparent **Risk Factor Analysis**, ensuring that every prediction is fully explainable.

---

## 🌟 Key Features
- **Multi-Disease Prediction:** Highly accurate models trained specifically for 4 critical health conditions.
- **Explainable Machine Learning:** Uses SHAP to visually explain *why* the model made its prediction and exactly which patient vitals increased or decreased their risk.
- **Automated Health Guidelines:** Dynamically generates personalized health suggestions based on the patient's exact input parameters and risk profile.
- **PDF Exporting:** Doctors or patients can export their Risk Analysis dashboard instantly to a professionally formatted PDF.
- **Secure Patient History:** Uses a local SQLite database to securely store past predictions, allowing users to track their health over time.

## 💻 Tech Stack
- **Frontend UI:** React, TypeScript, Tailwind CSS, Shadcn UI, Vite
- **Backend API:** FastAPI, Python, SQLite, SQLAlchemy, JWT Authentication
- **Machine Learning:** Scikit-Learn (Random Forest), Pandas, NumPy, SHAP

## 🚀 How to Run the Project

Running the project locally is incredibly simple. You do not need to type any manual commands.

1. Ensure you have **Python** and **Node.js** installed on your system.
2. Open the main project folder (`Health Insite Engine web app`).
3. Double-click the **`run_app.bat`** script.
4. Two terminal windows will open automatically to start the Backend server (port 8000) and Frontend server (port 5173).
5. Open your web browser and navigate to:
   👉 **http://localhost:5173**

*(To stop the servers, simply close the two black terminal windows).*

## 📁 Project Structure
- `/backend`: Contains the FastAPI server, SQLite database logic, user authentication routing, and the `models/` directory housing the exported `.pkl` Machine Learning models.
- `/front end part`: Contains the React UI code, components, and Tailwind styling.
- `/preprocessing`: Contains the Jupyter Notebook showcasing the data cleaning, feature engineering, and training process for the Machine Learning models.

## 🔐 Environment Setup
If you are running this on a new machine, ensure the `.env` files are properly populated:
- `backend/.env` requires a `JWT_SECRET` (for user sessions) and `GEMINI_API_KEY` (for the automated medical guidelines).
- `front end part/.env` requires `VITE_API_URL=http://localhost:8000`.
