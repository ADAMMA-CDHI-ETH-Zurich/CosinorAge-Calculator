# Use official Python image
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y gcc g++ gfortran curl && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install local cosinorage package
COPY cosinorage-1.0.1.tar.gz .
RUN pip install --no-cache-dir cosinorage-1.0.1.tar.gz

# Create data directory structure and copy sample data
RUN mkdir -p data/sample
COPY data/sample/sample_data_single.csv data/sample/

# Copy backend code
COPY . .

# Create directory for extracted files
RUN mkdir -p extracted_files

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 