# Use official Python image
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc g++ gfortran curl && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install local cosinorage package
COPY ../cosinorage-0.1.4.tar.gz .
RUN pip install --no-cache-dir cosinorage-0.1.4.tar.gz

# Copy backend code
COPY . .

# Create directory for extracted files
RUN mkdir -p extracted_files

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 