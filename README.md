# AI Health Report Analyzer 🏥🧠

An advanced AI-powered web application that analyzes complex medical reports (PDF/Images) and translates the medical jargon into a simple, easy-to-understand Sinhala explanation using a multi-agent AI system. 

![Architecture Diagram](architecture%20diagram.png)

## 🚀 Key Features

* **Multi-Agent AI Processing (CrewAI):** 
  * **Agent 1 (Vision Specialist):** Extracts raw text and tables accurately from medical report images and PDFs.
  * **Agent 2 (Health Analyst):** Compares extracted data against standard WHO guidelines to identify abnormal values.
  * **Agent 3 (Friendly Explainer):** Translates the clinical analysis into a natural, easy-to-read Sinhala summary while preserving English medical terminology.
* **Progressive Loading UI:** Provides real-time simulated feedback of the AI's thought process (Reading -> Analyzing -> Translating).
* **PDF Export:** Download the generated Sinhala medical summary as a beautifully formatted PDF.
* **History Management:** Saves all previously analyzed reports locally using SQLite so you can revisit them anytime.
* **Premium UI/UX:** Built with React and Framer Motion, featuring glassmorphism elements, dark mode, and smooth animations.

## 🛠️ Technology Stack

* **Frontend:** React, Vite, Framer Motion, Axios, html2pdf.js, Lucide Icons
* **Backend:** FastAPI, Python, SQLAlchemy, SQLite, Uvicorn, PyMuPDF
* **AI Layer:** CrewAI, GitHub Models (`gpt-4o-mini` / Vision API)

## 📦 Getting Started

### Prerequisites
* Python 3.10+
* Node.js & npm
* A GitHub Personal Access Token (for GitHub Models AI)

### 1. Backend Setup (FastAPI)

```bash
# Navigate to the backend folder
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate # (On Windows: venv\Scripts\activate)

# Install dependencies
pip install -r requirements.txt

# Set your API Key inside backend/app/core/config.py
# GITHUB_TOKEN = "your-github-token-here"

# Run the FastAPI server
uvicorn app.main:app --reload
```
The backend will start on `http://127.0.0.1:8000`.

### 2. Frontend Setup (React)

```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend will start on `http://localhost:5173`.

## 🛡️ Privacy & Security Note
*By default, the AI is prompted to ignore/redact Personally Identifiable Information (PII). However, since this uses a Cloud LLM API, it is recommended to crop out patient names and ID numbers from images before uploading to ensure maximum privacy.*

---
*Built with ❤️ for a healthier, more accessible future.*
