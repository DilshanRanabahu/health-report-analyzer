from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.db.models import Report
from crewai import Crew
from backend.app.agents.medical_agents import document_reader, health_analyst, friendly_explainer
from backend.app.agents.tasks import create_medical_tasks
import os
import shutil
import uuid

router = APIRouter()

UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/analyze-report")
async def analyze_report(file: UploadFile = File(...), db: Session = Depends(get_db)):
    allowed_extensions = ('.pdf', '.jpg', '.jpeg', '.png')
    if not file.filename.lower().endswith(allowed_extensions):
        return JSONResponse(status_code=400, content={"error": "Only PDF, JPG, or PNG files are supported."})
        
    # Create a unique filename to prevent overwrites
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        tasks = create_medical_tasks(file_path)
        
        medical_crew = Crew(
            agents=[document_reader, health_analyst, friendly_explainer],
            tasks=tasks,
            verbose=True
        )
        
        print("Starting Medical Analysis Crew...")
        result = await medical_crew.kickoff_async()
        
        output_text = str(result.raw) if hasattr(result, 'raw') else str(result)
        
        # Save to database instead of deleting the file
        new_report = Report(
            filename=file.filename,
            file_path=file_path,
            result=output_text
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        
        return {
            "status": "success", 
            "id": new_report.id,
            "filename": new_report.filename,
            "date": new_report.date.isoformat(),
            "result": new_report.result
        }
        
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.date.desc()).all()
    # Format dates for frontend
    return [
        {
            "id": r.id, 
            "filename": r.filename, 
            "date": r.date.strftime("%B %d, %Y - %H:%M:%S") if r.date else "Unknown", 
            "result": r.result
        } 
        for r in reports
    ]


@router.delete("/reports/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    # Delete the physical file as well
    if report.file_path and os.path.exists(report.file_path):
        try:
            os.remove(report.file_path)
        except Exception as e:
            print(f"Failed to delete file {report.file_path}: {e}")
            
    db.delete(report)
    db.commit()
    
    return {"status": "success", "message": "Report deleted"}
