# Base image
FROM python:3.10-slim

# Set working directory
WORKDIR /grader

# Copy files (if needed)
COPY . /grader

# Install dependencies
RUN pip install --no-cache-dir pytest

# Default command (can be overridden)
CMD ["python3"]
