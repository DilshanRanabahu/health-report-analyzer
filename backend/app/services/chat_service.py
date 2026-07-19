from sqlalchemy.orm import Session
from backend.app.db.models import ChatMessage

class ChatService:
    def save_message(self, db: Session, report_id: int, role: str, content: str) -> ChatMessage:
        """Saves a single chat message to the database."""
        msg = ChatMessage(report_id=report_id, role=role, content=content)
        db.add(msg)
        db.commit()
        db.refresh(msg)
        return msg

    def get_chat_history(self, db: Session, report_id: int) -> list[ChatMessage]:
        """Retrieves the chat history for a given report, ordered by date."""
        return db.query(ChatMessage).filter(ChatMessage.report_id == report_id).order_by(ChatMessage.date.asc()).all()

chat_service = ChatService()
