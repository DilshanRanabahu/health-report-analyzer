FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir passlib bcrypt PyJWT httpx sqlalchemy

# We copy the entire directory into /app/api_manager since the structure
# seems to rely on being run from the root or being a module.
# Let's copy everything needed for api_manager.
COPY api_manager/ /app/api_manager/

EXPOSE 8000

CMD ["uvicorn", "api_manager.main:app", "--host", "0.0.0.0", "--port", "8000"]
