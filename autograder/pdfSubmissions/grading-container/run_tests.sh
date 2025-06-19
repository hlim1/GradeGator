#!/bin/bash
set -e

# Input and output directories
SUBMISSION_DIR="/input"
TEST_DIR="/tests"
OUTPUT_DIR="/output"

# Check if a submission path is provided
if [ $# -eq 0 ]; then
    echo "No submission path provided"
    exit 1
fi

SUBMISSION_PATH=$1

# Detect language and run appropriate tests
FILE_TYPE=$(file -b --mime-type "$SUBMISSION_PATH")
FILENAME=$(basename "$SUBMISSION_PATH")
EXTENSION="${FILENAME##*.}"

# Download test cases from S3
aws s3 sync s3://professor-test-cases/$COURSE_ID/$ASSIGNMENT_ID/tests "$TEST_DIR"

# Language-specific test runners
case "$EXTENSION" in
    "py")
        # Python testing
        python3 /grade.py "$SUBMISSION_PATH"
        ;;
    "java")
        # Java testing with Maven
        mvn test -f "$SUBMISSION_PATH" 
        ;;
    "c" | "cpp")
        # C/C++ testing with CMake
        mkdir build && cd build
        cmake .. && make && ctest
        ;;
    *)
        echo "Unsupported file type"
        exit 1
        ;;
esac

# Always generate results
python3 /generate_results.py