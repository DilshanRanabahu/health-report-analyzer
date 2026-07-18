from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse
from crewai import Crew
from backend.app.agents.medical_agents import document_reader, health_analyst, friendly_explainer
from backend.app.agents.tasks import create_medical_tasks
import os
import shutil

router = APIRouter()

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/analyze-report")
async def analyze_report(file: UploadFile = File(...)):
    allowed_extensions = ('.pdf', '.jpg', '.jpeg', '.png')
    if not file.filename.lower().endswith(allowed_extensions):
        return JSONResponse(status_code=400, content={"error": "Only PDF, JPG, or PNG files are supported."})
        
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        tasks = create_medical_tasks(file_path)
        
        medical_crew = Crew(
            agents=[document_reader, health_analyst, friendly_explainer],
            tasks=tasks,
            verbose=True
        )
        
        # Start the Crew AI process asynchronously to avoid event loop conflicts in FastAPI
        print("Starting Medical Analysis Crew...")
        result = await medical_crew.kickoff_async()
        
        os.remove(file_path)
        
        # We need to extract the string representation of the CrewOutput object
        # CrewOutput has a raw property containing the final string
        output_text = str(result.raw) if hasattr(result, 'raw') else str(result)
        
        return {"status": "success", "result": output_text}
        
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        return JSONResponse(status_code=500, content={"error": str(e)})
