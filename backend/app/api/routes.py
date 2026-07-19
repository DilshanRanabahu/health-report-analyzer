from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.db.models import Report
from crewai import Crew
from backend.app.agents.medical_agents import document_reader, health_analyst, dietitian_agent, friendly_explainer
from backend.app.agents.tasks import create_medical_tasks
from backend.app.core.config import GITHUB_TOKEN
from pydantic import BaseModel
from openai import OpenAI
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
        
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        tasks = create_medical_tasks(file_path)
        
        medical_crew = Crew(
            agents=[document_reader, health_analyst, dietitian_agent, friendly_explainer],
            tasks=tasks,
            verbose=True
        )
        
        print("Starting Medical Analysis Crew...")
        result = await medical_crew.kickoff_async()
        
        output_text = str(result.raw) if hasattr(result, 'raw') else str(result)
        
        if "ERROR:" in output_text:
            if os.path.exists(file_path):
                os.remove(file_path)
            return JSONResponse(
                status_code=400, 
                content={"error": "The AI could not extract medical data from this document. Please ensure it is a clear medical report."}
            )
            
        report_title = file.filename
        lines = output_text.split('\n')
        
        for i, line in enumerate(lines):
            if line.strip().startswith("TITLE:"):
                report_title = line.replace("TITLE:", "").strip()
                lines.pop(i)
                output_text = '\n'.join(lines).strip()
                break
                
        if output_text.startswith("```markdown"):
            output_text = output_text[11:].strip()
        elif output_text.startswith("```"):
            output_text = output_text[3:].strip()
            
        if output_text.endswith("```"):
            output_text = output_text[:-3].strip()
        
        new_report = Report(
            filename=report_title,
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
        
    if report.file_path and os.path.exists(report.file_path):
        try:
            os.remove(report.file_path)
        except Exception as e:
            print(f"Failed to delete file {report.file_path}: {e}")
            
    db.delete(report)
    db.commit()
    
    return {"status": "success", "message": "Report deleted"}

class ChatRequest(BaseModel):
    message: str
    report_context: str
    history: list = []

@router.post("/chat")
def chat_with_report(request: ChatRequest):
    client = OpenAI(
        base_url="https://models.inference.ai.azure.com",
        api_key=GITHUB_TOKEN,
    )
    
    system_prompt = f"""You are a helpful Medical and Dietary AI assistant from Sri Lanka. 
You are chatting with a patient about their medical report.
Answer the user's questions in simple Sinhala based on the provided Medical Report Context.
If the user asks a question completely unrelated to health, medicine, diet, or the report (e.g. sports, movies, politics), politely refuse to answer.

Medical Report Context:
{request.report_context}
"""
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(request.history)
    messages.append({"role": "user", "content": request.message})
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
