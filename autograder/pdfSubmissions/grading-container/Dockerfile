FROM ubuntu:20.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install common dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip \
    openjdk-11-jdk \
    gcc \
    cmake \
    wget \
    awscli

# Install language-specific testing tools
RUN pip3 install pytest coverage \
    && apt-get install -y maven \
    && wget https://github.com/junit-team/junit5/releases/download/r5.8.1/junit-platform-console-standalone-1.8.1.jar

# Copy grading scripts
COPY grade.py /grade.py
COPY run_tests.sh /run_tests.sh
RUN chmod +x /run_tests.sh

# Set working directory
WORKDIR /workspace

# Entry point script to handle different languages
ENTRYPOINT ["/run_tests.sh"]