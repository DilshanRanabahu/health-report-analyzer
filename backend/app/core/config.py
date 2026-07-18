import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# We can access GEMINI_API_KEY like this anywhere in the app
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

if not GITHUB_TOKEN:
    print("WARNING: GITHUB_TOKEN is not set correctly in the .env file!")
