FROM python:3.10-slim

WORKDIR /app

# Install system dependencies required by PyMuPDF and other image processing libs
RUN apt-get update && apt-get install -y \
    libmupdf-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir passlib bcrypt PyJWT httpx sqlalchemy PyMuPDF

COPY backend/ /app/backend/

EXPOSE 8001

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8001"]
