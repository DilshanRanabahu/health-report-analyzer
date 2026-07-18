import os
import base64
from openai import OpenAI
from crewai.tools import tool
from backend.app.core.config import GITHUB_TOKEN

# Initialize OpenAI client with GitHub Models base URL
client = OpenAI(
    base_url="https://models.inference.ai.azure.com",
    api_key=GITHUB_TOKEN,
)

def encode_image(image_path: str) -> str:
    """Encodes an image to base64 string"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

@tool("Document Vision Tool")
def extract_text_with_vision(file_path: str) -> str:
    """
    Extract text content from a given Medical Report PDF or Image file path.
    This tool uses OpenAI Vision (GPT-4o) to read tables, handwriting, and text perfectly.
    Returns the extracted text.
    """
    if not os.path.exists(file_path):
        return f"File not found: {file_path}"
        
    try:
        print(f"Uploading {file_path} to GitHub Models Vision API...")
        
        # Convert image to base64
        base64_image = encode_image(file_path)
        
        # Determine mime type (rough guess based on extension)
        mime_type = "image/jpeg"
        if file_path.lower().endswith(".png"):
            mime_type = "image/png"
        elif file_path.lower().endswith(".pdf"):
            return "Error: GitHub Models Vision currently only supports images (JPG/PNG), not PDFs directly. Please convert PDF to image first."
        
        # Call the OpenAI API for vision
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Extract all the medical text, numbers, and tables from this document exactly as written. Do not summarize, just extract the raw data."},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{base64_image}"}
                        }
                    ]
                }
            ]
        )
        
        extracted_text = response.choices[0].message.content
        return extracted_text if extracted_text else "No text could be extracted."
    except Exception as e:
        return f"Error extracting text with Vision AI: {str(e)}"
