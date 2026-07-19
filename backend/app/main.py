from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.api.routes import router as api_router
from backend.app.db.database import engine, Base
import os

Base.metadata.create_all(bind=engine)

os.makedirs("backend/uploads", exist_ok=True)

app = FastAPI(title="Medical Report Translator API")

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:8000,http://127.0.0.1:8000,http://localhost:5173,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Medical Report Translator Backend API. Use /docs to test the API endpoints."}
