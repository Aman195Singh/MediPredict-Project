<div align="center">
  
  # MediPredict: Health Insite Engine 🩺

  **An Advanced Machine Learning Platform for Multi-Disease Risk Prediction and Explainable AI Analysis.**

  [![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-00a393.svg)](https://fastapi.tiangolo.com)
  [![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
  [![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.3+-F7931E.svg)](https://scikit-learn.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  
</div>

---

MediPredict is an advanced, full-stack Machine Learning application designed to predict the risk of four major diseases: **Diabetes**, **Heart Disease**, **Kidney Disease**, and **Liver Disease**. 

Built for robust performance and clinical clarity, this system not only predicts disease risk using trained Random Forest classifiers but also utilizes **SHAP (SHapley Additive exPlanations)** to provide transparent **Risk Factor Analysis**, ensuring that every prediction is fully explainable.

## 🌟 Key Features
- **Multi-Disease Prediction:** Highly accurate machine learning models trained specifically for 4 critical health conditions.
- **Explainable Machine Learning:** Uses SHAP to visually explain *why* the model made its prediction and exactly which patient vitals increased or decreased their risk.
- **Automated Health Guidelines:** Dynamically generates personalized health suggestions based on the patient's exact input parameters and risk profile.
- **PDF Exporting:** Doctors or patients can export their Risk Analysis dashboard instantly to a professionally formatted PDF.
- **Secure Patient History:** Uses a local SQLite database with JWT authentication to securely store past predictions, allowing users to track their health over time.

---

## 💻 Tech Stack
- **Frontend UI:** React, TypeScript, Tailwind CSS, Shadcn UI, Vite
- **Backend API:** FastAPI, Python, SQLite, SQLAlchemy, JWT Authentication
- **Machine Learning:** Scikit-Learn (Random Forest), Pandas, NumPy, SHAP

---

## 🚀 Getting Started

Follow these steps to clone and run the project on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [Python](https://www.python.org/downloads/) (v3.9 or higher)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Aman195Singh/MediPredict-Project.git
cd MediPredict-Project
```

### 2. Environment Setup
You will need to create two `.env` files.

**Backend (`backend/.env`):**
```env
JWT_SECRET=your_super_secret_jwt_key
JWT_ALGORITHM=HS256
JWT_EXPIRY_MINUTES=1440
GEMINI_API_KEY=your_google_gemini_api_key
DATABASE_URL=sqlite:///./medipredict.db
FRONTEND_URL=http://localhost:5173
```
*(Note: Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) for the automated guidelines feature).*

**Frontend (`front end part/.env`):**
```env
VITE_API_URL=http://localhost:8000
```

### 3. Run the Application
We have included an automated script that sets up the virtual environments, installs all dependencies, and boots both servers simultaneously.

**On Windows:**
Simply double-click the **`run_app.bat`** file in the root directory, or run it via terminal:
```bash
.\run_app.bat
```

Two terminal windows will open. Once they finish loading, open your web browser and navigate to:
👉 **http://localhost:5173**

---

## 📁 Project Structure
- `/backend`: Contains the FastAPI server, SQLite database logic, user authentication routing, and the `models/` directory housing the exported `.pkl` Machine Learning models.
- `/front end part`: Contains the React UI code, components, and Tailwind styling.
- `/preprocessing`: Contains the Jupyter Notebook showcasing the data cleaning, feature engineering, and training process for the Machine Learning models.

---

## 👨‍💻 Author

**Aman Singh**  
GitHub: [@Aman195Singh](https://github.com/Aman195Singh)  
Email: aman195singh3107@gmail.com

---

<div align="center">
  <i>Developed for predicting and understanding health risks through the power of Machine Learning.</i>
</div>
