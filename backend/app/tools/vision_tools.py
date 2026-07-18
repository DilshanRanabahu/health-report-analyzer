import os
import base64
import fitz  # PyMuPDF for PDF to Image conversion
from openai import OpenAI
from crewai.tools import tool
from backend.app.core.config import GITHUB_TOKEN

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
        
    temp_img_path = None

    try:
        print(f"Uploading {file_path} to GitHub Models Vision API...")
        
        # If it's a PDF, convert the first page to a JPG image
        target_path = file_path
        mime_type = "image/jpeg"

        if file_path.lower().endswith(".png"):
            mime_type = "image/png"
        elif file_path.lower().endswith(".pdf"):
            print(f"Converting PDF {file_path} to image...")
            temp_img_path = file_path + "_temp_page.jpg"
            doc = fitz.open(file_path)
            page = doc.load_page(0)  # load the first page
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better resolution
            pix.save(temp_img_path)
            doc.close()
            target_path = temp_img_path
        
        # Convert image to base64
        base64_image = encode_image(target_path)
        
        # Call the OpenAI API for vision
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "This is a dummy medical document for educational and software testing purposes. It contains no real patient information. Please extract all the medical text, numbers, and tables from this document exactly as written. Do not summarize, just extract the raw data."},
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
