from pydantic import BaseModel
from typing import List

class ChatRequest(BaseModel):
    report_id: int
    message: str
    report_context: str
    history: list = []

class ChatMessageResponse(BaseModel):
    role: str
    content: str

class ReportResponse(BaseModel):
    id: int
    filename: str
    date: str
    result: str
