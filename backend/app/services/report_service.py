import os
import shutil
import uuid
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException
from backend.app.db.models import Report

UPLOAD_DIR = "backend/uploads"

class ReportService:
    def __init__(self):
        os.makedirs(UPLOAD_DIR, exist_ok=True)

    def save_upload_file(self, file: UploadFile) -> str:
        """Saves an uploaded file to disk and returns the file path."""
        allowed_extensions = ('.pdf', '.jpg', '.jpeg', '.png')
        if not file.filename.lower().endswith(allowed_extensions):
            raise ValueError("Only PDF, JPG, or PNG files are supported.")
            
        unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return file_path

    def delete_physical_file(self, file_path: str):
        """Safely deletes a physical file."""
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Failed to delete file {file_path}: {e}")

    def extract_title(self, output_text: str, original_filename: str) -> tuple[str, str]:
        """Extracts the title from the AI output text."""
        report_title = original_filename
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
            
        return report_title, output_text

    def create_report(self, db: Session, filename: str, file_path: str, result_text: str, user_id: str) -> Report:
        """Creates a new report record in the database."""
        new_report = Report(
            filename=filename,
            file_path=file_path,
            result=result_text,
            user_id=user_id
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        return new_report

    def get_all_reports(self, db: Session, user_id: str) -> list[Report]:
        """Retrieves all reports for a specific user, ordered by date descending."""
        return db.query(Report).filter(Report.user_id == user_id).order_by(Report.date.desc()).all()

    def verify_ownership(self, db: Session, report_id: int, user_id: str) -> Report:
        """Verifies that a report belongs to the user."""
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        if report.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this report")
        return report

    def delete_report(self, db: Session, report_id: int, user_id: str):
        """Deletes a report from the database and removes its physical file."""
        report = self.verify_ownership(db, report_id, user_id)
            
        self.delete_physical_file(report.file_path)
            
        db.delete(report)
        db.commit()

report_service = ReportService()
