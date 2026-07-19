from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    filename = Column(String, index=True)
    file_path = Column(String)
    result = Column(Text)
    date = Column(DateTime(timezone=True), server_default=func.now())
    
    chat_messages = relationship("ChatMessage", back_populates="report", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    role = Column(String)
    content = Column(Text)
    date = Column(DateTime(timezone=True), server_default=func.now())
    
    report = relationship("Report", back_populates="chat_messages")
