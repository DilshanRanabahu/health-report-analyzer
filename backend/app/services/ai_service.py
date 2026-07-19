import os
from openai import OpenAI
from crewai import Crew
from backend.app.agents.medical_agents import document_reader, health_analyst, dietitian_agent, friendly_explainer
from backend.app.agents.tasks import create_medical_tasks
from backend.app.core.config import GITHUB_TOKEN
from typing import List, Dict

class AIService:
    def __init__(self):
        self.openai_client = OpenAI(
            base_url="https://models.inference.ai.azure.com",
            api_key=GITHUB_TOKEN,
        )

    async def analyze_medical_report(self, file_path: str) -> str:
        """
        Runs the CrewAI agents to extract and analyze medical report data.
        """
        from backend.app.tools.vision_tools import extract_text_from_file
        
        print("Pre-validating document...")
        extracted_text = extract_text_from_file(file_path)
        
        if "ERROR: NOT_A_MEDICAL_REPORT" in extracted_text:
            raise ValueError("මෙය වෛද්‍ය වාර්තාවක් නොවන බව පෙනේ. කරුණාකර නිවැරදි වෛද්‍ය වාර්තාවක් (Medical Report) ඇතුළත් කරන්න.")
            
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
            raise ValueError("The AI could not extract medical data from this document. Please ensure it is a clear medical report.")
            
        return output_text

    def generate_chat_response(self, report_context: str, history: List[Dict[str, str]], user_message: str) -> str:
        """
        Generates an AI chat response using OpenAI based on the report context.
        """
        system_prompt = f"""You are a helpful Medical and Dietary AI assistant from Sri Lanka. 
You are chatting with a patient about their medical report.
Answer the user's questions in simple Sinhala based on the provided Medical Report Context.
If the user asks a question completely unrelated to health, medicine, diet, or the report (e.g. sports, movies, politics), politely refuse to answer.

Medical Report Context:
{report_context}
"""
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(history)
        messages.append({"role": "user", "content": user_message})
        
        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3
        )
        return response.choices[0].message.content

ai_service = AIService()
