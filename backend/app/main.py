from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.app.api.routes import router as api_router
from backend.app.db.database import engine, Base
import os

# Create DB tables
Base.metadata.create_all(bind=engine)

# Ensure uploads directory exists
os.makedirs("backend/uploads", exist_ok=True)

app = FastAPI(title="Medical Report Translator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files statically
app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Medical Report Translator Backend API. Use /docs to test the API endpoints."}
