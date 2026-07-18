from crewai import Task
from backend.app.agents.medical_agents import document_reader, health_analyst, friendly_explainer

def create_medical_tasks(pdf_file_path: str):
    extract_task = Task(
        description=f"Read and extract all text and numerical test results from the medical report located at: {pdf_file_path}",
        expected_output="A structured text summary of all the tests and their corresponding numerical results found in the document.",
        agent=document_reader
    )

    analyze_task = Task(
        description="Take the extracted medical data from the previous task. Use your vast medical knowledge to compare the patient's results against standard WHO reference ranges. Identify what is normal, what is high, and what is low. If the previous task failed to extract any data or returned an error/refusal message, you MUST immediately output exactly 'ERROR: NO_DATA_FOUND' and nothing else.",
        expected_output="A detailed medical analysis report highlighting which tests are normal and which are out of range, citing the standard reference ranges. Or 'ERROR: NO_DATA_FOUND' if data is missing.",
        agent=health_analyst
    )

    translate_task = Task(
        description="Take the medical analysis report and translate the findings into simple, friendly Sinhala. Explain what the abnormal results mean in plain language. CRITICAL INSTRUCTION: Retain all English medical jargons and test names exactly as they are (e.g., use 'Hemoglobin', 'WBC', 'Cholesterol', 'Fasting Blood Sugar'). You can write them in English letters or English words in Sinhala script. Do NOT translate test names into pure Sinhala. Add a disclaimer at the end that this is an AI analysis and they must consult a doctor. \n\nCRITICAL RULE: If the input analysis report contains 'ERROR: NO_DATA_FOUND' or indicates that no medical data was provided, you MUST NOT hallucinate or create a fake report. Instead, you MUST output exactly this string and nothing else: 'ERROR: AI failed to read the document. Please try a clearer image.'",
        expected_output='''A friendly, easy-to-read explanation in Sinhala (with English medical terms mixed in natively). 
You MUST strictly follow this exact Markdown structure. The very first line MUST be the title starting with "TITLE: ". Extract the patient's name and report type. If the name is missing, use "Unknown Patient".
IMPORTANT: Do NOT wrap your output in ```markdown or ``` code blocks. Output the raw markdown text directly!

If and only if you received a NO_DATA_FOUND error, output ONLY: "ERROR: AI failed to read the document."

TITLE: [Patient Name] - [Report Type]

## 🩺 රෝගී වාර්තාවේ සාරාංශය
[A short 2-3 sentence friendly summary of the overall report]

## ⚠️ විශේෂ අවධානය යොමු කළ යුතු කරුණු
- **[Test Name]**: [Result] - [Simple explanation of what this means and if it is High or Low]
(List only the abnormal tests here. If everything is normal, state that clearly)

## ✅ සාමාන්‍ය තත්ත්වයේ ඇති කරුණු
- **[Test Name]**: [Result] - සාමාන්‍යයි
(List the normal results here)

## 💡 උපදෙස්
- [Actionable, simple lifestyle or diet advice based on the abnormalities]

---
**සටහන:** මෙය AI මගින් සපයන ලද විශ්ලේෂණයක් පමණි. නිවැරදි වෛද්‍ය උපදෙස් සඳහා කරුණාකර වෛද්‍යවරයෙකු හමුවන්න.''' ,
        agent=friendly_explainer
    )

    return [extract_task, analyze_task, translate_task]
