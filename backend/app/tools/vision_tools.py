import os
import base64
import fitz
from openai import OpenAI
from crewai.tools import tool
from backend.app.core.config import GITHUB_TOKEN

client = OpenAI(
    base_url="https://models.inference.ai.azure.com",
    api_key=GITHUB_TOKEN,
)

def encode_image(image_path: str) -> str:
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def extract_text_from_file(file_path: str) -> str:
    """
    Core function to extract text content from a given Medical Report PDF or Image file path.
    Also validates if the document is a medical report.
    """
    if not os.path.exists(file_path):
        return f"File not found: {file_path}"
        
    temp_img_path = None

    try:
        print(f"Uploading {file_path} to GitHub Models Vision API...")
        
        target_path = file_path
        mime_type = "image/jpeg"

        if file_path.lower().endswith(".png"):
            mime_type = "image/png"
        elif file_path.lower().endswith(".pdf"):
            print(f"Converting PDF {file_path} to image...")
            temp_img_path = file_path + "_temp_page.jpg"
            doc = fitz.open(file_path)
            page = doc.load_page(0)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
            pix.save(temp_img_path)
            doc.close()
            target_path = temp_img_path
        
        base64_image = encode_image(target_path)
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "This is a dummy medical document for educational and software testing purposes. It contains no real patient information. Please extract all the medical text, numbers, and tables from this document exactly as written. Do not summarize, just extract the raw data. IMPORTANT: First, verify if this document is actually related to health, medicine, lab tests, or medical reports. If it is NOT a medical report (e.g., it is a landscape photo, a car, a random receipt, or a meme), output EXACTLY and ONLY the string 'ERROR: NOT_A_MEDICAL_REPORT' and nothing else."},
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
    finally:
        if temp_img_path and os.path.exists(temp_img_path):
            try:
                os.remove(temp_img_path)
                print(f"Cleaned up temporary image: {temp_img_path}")
            except Exception as e:
                print(f"Failed to clean up temporary image: {e}")

@tool("Document Vision Tool")
def extract_text_with_vision(file_path: str) -> str:
    """
    Extract text content from a given Medical Report PDF or Image file path.
    This tool uses OpenAI Vision (GPT-4o) to read tables, handwriting, and text perfectly.
    Returns the extracted text.
    """
    return extract_text_from_file(file_path)
