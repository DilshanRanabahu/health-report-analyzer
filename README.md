# AI Health Report Analyzer 🏥🧠

An advanced AI-powered web application that analyzes complex medical reports (PDF/Images) and translates the medical jargon into a simple, easy-to-understand Sinhala explanation using a multi-agent AI system. 

![Architecture Diagram](architecture%20diagram.png)

## 🚀 Key Features

* **Multi-Agent AI Processing (CrewAI):** 
  * **Agent 1 (Vision Specialist):** Extracts raw text and tables accurately from medical report images and PDFs.
  * **Agent 2 (Health Analyst):** Compares extracted data against standard WHO guidelines to identify abnormal values.
  * **Agent 3 (Friendly Explainer):** Translates the clinical analysis into a natural, easy-to-read Sinhala summary while preserving English medical terminology.
* **Secure Authentication & User Privacy:** Features a secure API Gateway that issues HTTP-Only JWT cookies. Reports are isolated per user, meaning you only see your own medical history.
* **Progressive Loading UI:** Provides real-time simulated feedback of the AI's thought process (Reading -> Analyzing -> Translating).
* **PDF Export:** Download the generated Sinhala medical summary as a beautifully formatted PDF.
* **History Management:** Saves all previously analyzed reports locally using SQLite so you can revisit them anytime.
* **Premium UI/UX:** Built with React and Framer Motion, featuring glassmorphism elements, dark mode, and smooth animations.

## 🏗️ System Architecture

The system utilizes a secure 3-tier architecture with a dedicated API Gateway for handling authentication and proxying requests to the Core AI Backend.

```text
// 1. User Interaction & Authentication
User [icon: user]
UI (React Frontend) [icon: react, color: blue]

User > UI (React Frontend): Login & Uploads Report

// 2. API Gateway & Security
API Gateway Group [color: orange] {
  API Manager (Port 8000) [icon: server]
  Auth Database (auth.db) [icon: database]
  JWT (HttpOnly Cookie) [icon: lock]
}

UI (React Frontend) <> API Manager (Port 8000): Authenticates & Sends APIs
API Manager (Port 8000) > Auth Database (auth.db): Verifies Credentials
API Manager (Port 8000) > JWT (HttpOnly Cookie): Issues Secure Token

// 3. Core Processing & Storage
Backend System [color: green] {
  FastAPI Backend (Port 8001) [icon: python]
  SQLite Database (health_reports.db) [icon: database]
  Local Storage (/uploads) [icon: folder]
  PyMuPDF (PDF Converter) [icon: file-pdf]
}

API Manager (Port 8000) > FastAPI Backend (Port 8001): Proxies Request (X-User-Id)
FastAPI Backend (Port 8001) > Local Storage (/uploads): Saves File
FastAPI Backend (Port 8001) > PyMuPDF (PDF Converter): Converts PDF to Image

// 4. Multi-Agent AI System
CrewAI Orchestration [icon: users, color: purple] {
  Document Reader [icon: bot, color: purple]
  Health Analyst [icon: bot, color: purple]
  Friendly Explainer [icon: bot, color: purple]
}

GitHub Models (GPT-4o-mini) [icon: github]
Vision Tool [icon: camera]

FastAPI Backend (Port 8001) > CrewAI Orchestration: Triggers Tasks
Document Reader <> Vision Tool: Extracts Text from Image
Document Reader <> GitHub Models (GPT-4o-mini): Analyzes Image
Document Reader > Health Analyst: Task 1 Done (Raw Text)
Health Analyst <> GitHub Models (GPT-4o-mini): Applies WHO Guidelines
Health Analyst > Friendly Explainer: Task 2 Done (Medical Analysis)
Friendly Explainer <> GitHub Models (GPT-4o-mini): Translates to Sinhala
Friendly Explainer > FastAPI Backend (Port 8001): Returns Final Report

// 5. User-Isolated History
FastAPI Backend (Port 8001) > SQLite Database (health_reports.db): Saves Result (with user_id)
FastAPI Backend (Port 8001) > UI (React Frontend): Shows Formatted Report

UI (React Frontend) > API Manager (Port 8000): GET /reports (Loads History)
API Manager (Port 8000) > FastAPI Backend (Port 8001): Proxies Request
FastAPI Backend (Port 8001) > SQLite Database (health_reports.db): Fetches User's Private History
```

## 🛠️ Technology Stack

* **Frontend:** React, Vite, Framer Motion, Axios, html2pdf.js, Lucide Icons
* **API Gateway (Auth):** FastAPI, PyJWT, bcrypt, httpx
* **Core Backend:** FastAPI, Python, SQLAlchemy, SQLite, Uvicorn, PyMuPDF
* **AI Layer:** CrewAI, GitHub Models (`gpt-4o-mini` / Vision API)

## 📦 Getting Started

### Prerequisites
* Python 3.10+
* Node.js & npm
* A GitHub Personal Access Token (for GitHub Models AI)

### 1. Setup Python Environment
Open a terminal in the root folder (`helth/`) and install all required backend dependencies:

```bash
# Create a virtual environment (optional but recommended)
python -m venv .venv
source .venv/bin/activate # (On Windows: .\.venv\Scripts\activate)

# Install dependencies
pip install -r requirements.txt
pip install passlib bcrypt PyJWT httpx sqlalchemy
```

### 2. Run the Core AI Backend (Port 8001)
Open a terminal in the root folder, activate your environment, and start the Core Backend:

```bash
uvicorn backend.app.main:app --reload --port 8001
```

### 3. Run the API Gateway (Port 8000)
Open a **new** terminal in the root folder, activate your environment, and start the API Manager:

```bash
uvicorn api_manager.main:app --reload --port 8000
```

### 4. Run the React Frontend (Port 5173)
Open a **new** terminal in the `frontend` folder and start the UI:

```bash
cd frontend
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`. To use the app, navigate to `http://localhost:8000/login` in your browser.

## 🛡️ Privacy & Security Note
*By default, the AI is prompted to ignore/redact Personally Identifiable Information (PII). However, since this uses a Cloud LLM API, it is recommended to crop out patient names and ID numbers from images before uploading to ensure maximum privacy.*

---
*Built with ❤️ for a healthier, more accessible future.*
