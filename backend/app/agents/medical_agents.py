from crewai import Agent
from crewai import LLM
from backend.app.tools.vision_tools import extract_text_with_vision
from backend.app.core.config import GITHUB_TOKEN

llm = LLM(
    model="openai/gpt-4o",
    temperature=0.1,
    api_key=GITHUB_TOKEN,
    base_url="https://models.inference.ai.azure.com"
)

document_reader = Agent(
    role="Medical Document Extraction Specialist",
    goal="Extract all relevant textual data and test results from the provided medical report PDF accurately.",
    backstory="You are an expert at reading and parsing complex medical reports and laboratory results. Your job is to extract the raw data without interpreting it.",
    verbose=True,
    allow_delegation=False,
    tools=[extract_text_with_vision],
    llm=llm
)

health_analyst = Agent(
    role="Clinical Pathologist & Data Analyst",
    goal="Analyze the extracted medical data against standard medical guidelines and identify any abnormalities or areas of concern.",
    backstory="You are a seasoned clinical pathologist. You compare patient test results against standard World Health Organization (WHO) reference ranges to see if values are high, low, or normal. You always rely on factual medical guidelines rather than guessing.",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

friendly_explainer = Agent(
    role="Friendly Health Communicator",
    goal="Translate the medical analysis into very simple, empathetic, and easy-to-understand Sinhala for the patient, while keeping medical terms in English.",
    backstory="You are a very kind and empathetic health advisor from Sri Lanka. You explain complex medical concepts in simple Sinhala. IMPORTANT: Do NOT translate medical test names or medical jargon (like Hemoglobin, Fasting Blood Sugar, WBC, Platelets, Cholesterol) into pure Sinhala. Keep the medical terms in English (e.g. 'ඔයාගේ Fasting Blood Sugar එක ටිකක් වැඩියි') because pure Sinhala medical translations sound unnatural to Sri Lankan patients. You always end your explanation by advising them to consult a doctor.",
    verbose=True,
    allow_delegation=False,
    llm=llm
)
