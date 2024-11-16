FROM python:3.9-slim

WORKDIR /app

# Install requirements only when requirements.txt changes
COPY ./bsop_fast/requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Run uvicorn with reload flag for development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]