# Base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /grader

# Copy files (if needed)
COPY . /grader

# Ensure Java is installed
RUN apt-get update && apt-get install -y openjdk-17-jdk

# Default command (can be overridden)
CMD ["java", "--version"]
