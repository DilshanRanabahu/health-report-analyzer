from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Header
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List

from backend.app.db.database import get_db
from backend.app.schemas import ChatRequest, ReportResponse, ChatMessageResponse
from backend.app.services.ai_service import ai_service
from backend.app.services.report_service import report_service
from backend.app.services.chat_service import chat_service

router = APIRouter()

from datetime import timezone

@router.post("/analyze-report")
async def analyze_report(file: UploadFile = File(...), db: Session = Depends(get_db), x_user_id: str = Header(...)):
    try:
        file_path = report_service.save_upload_file(file)
    except ValueError as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
        
    try:
        output_text = await ai_service.analyze_medical_report(file_path)
        report_title, clean_text = report_service.extract_title(output_text, file.filename)
        
        new_report = report_service.create_report(db, report_title, file_path, clean_text, x_user_id)
        
        return {
            "status": "success", 
            "id": new_report.id,
            "filename": new_report.filename,
            "date": new_report.date.replace(tzinfo=timezone.utc).isoformat() if new_report.date else None,
            "result": new_report.result
        }
        
    except ValueError as e:
        report_service.delete_physical_file(file_path)
        return JSONResponse(status_code=400, content={"error": str(e)})
    except Exception as e:
        report_service.delete_physical_file(file_path)
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/reports", response_model=List[ReportResponse])
def get_reports(db: Session = Depends(get_db), x_user_id: str = Header(...)):
    reports = report_service.get_all_reports(db, x_user_id)
    return [
        {
            "id": r.id, 
            "filename": r.filename, 
            "date": r.date.replace(tzinfo=timezone.utc).isoformat() if r.date else None, 
            "result": r.result
        } 
        for r in reports
    ]


@router.delete("/reports/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db), x_user_id: str = Header(...)):
    report_service.delete_report(db, report_id, x_user_id)
    return {"status": "success", "message": "Report deleted"}


@router.post("/chat")
def chat_with_report(request: ChatRequest, db: Session = Depends(get_db), x_user_id: str = Header(...)):
    try:
        report_service.verify_ownership(db, request.report_id, x_user_id)
        chat_service.save_message(db, request.report_id, "user", request.message)
        
        assistant_content = ai_service.generate_chat_response(
            request.report_context, 
            request.history, 
            request.message
        )
        
        chat_service.save_message(db, request.report_id, "assistant", assistant_content)
        
        return {"response": assistant_content}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@router.get("/reports/{report_id}/chat", response_model=List[ChatMessageResponse])
def get_chat_history(report_id: int, db: Session = Depends(get_db), x_user_id: str = Header(...)):
    report_service.verify_ownership(db, report_id, x_user_id)
    messages = chat_service.get_chat_history(db, report_id)
    return [{"role": msg.role, "content": msg.content} for msg in messages]
