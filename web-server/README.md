Documentation for Grade Gator

Grade Gator is a Django-based grading management system.

## Important Notes
1. As of April 2025, there is no security build in to this repository! All secrets and keys are present in plain text, so do not publish this repo! Instead remove the changes, then clone or fork the repo so they aren't in the commit history.
2. API endpoint documentation can be found at the `/api/docs/` page of the web server, which by default runs at port 8000.

## Overview
This Grade Gator system has the following key features:

1. User management:
    - Different user roles (Students, Instructors, Admins)
    - Custom user authentication and authorization
    - Secure session and token-based login

2. Course management:
    - Create/Read/Update/Delete functions are implemented for courses, 
        students, and instructors
    - Dynamic course enrollment system

3. Assignment system:
    - Create, manage, and track assignments
    - File submission functionality (e.g., PDFs, code files)
    - Support for different grading methods (maunal, rubric-based, etc.)
    - AWS S3 integration for file storage

4. Grading system:
    - Grade tracking and calculation
    - Feedback system with rubric-based evaluation
    - Instructor-facing grade management dashboard

5. API architecture:
    - API built with Django REST framework
    - API documentation using drf-spectacular (Swagger/ReDoc)
    - Token and session-based authentication for security

Technical Implementation:

1. Database:
    - PostgreSQL database
2. Configuration:
    - Environment-based configuration for different environments (dev, prod)
3. CORS Support:
    - Pre-configured CORS support for frontend integration (e.g., React/Vue on port 3000)
4. API Documentation:
    - Auto-generated API documentation using drf-spectacular


The Frontend has the following key features:

1. Core stack (framework and styling):
    - Next.js (v15.2.4)
    - React (v19.0.0)
    - TypeScript
    - Tailwind CSS (v4.0.15)
    - React Icons (v5.5.0)

2. Authentication system
    - TBD! But there is infrastucture for JWT-based authentication located under the `dubose/jwt-auth` branch of this repo.

4. Course management
    - Dashboard with current and past courses
    - Course creation modal for instructors
    - Search and sort functionality for courses

5. Role views
    - Instructor: assignment/gradebook tools, roster/document management
    - Student: submission portal, grade/feedback dashboard

8. Setup
    - Node.js and npm required
    - Development server runs on port 3000
    - Environment variables for API configuration

The autograder system has the following key features:

1. Multi-langauge support:
    - Python 3.10 with pytest
    - Jave 17 (JUnit)
    - GCC (C language)

3. Preconfigured Test Environment

5. Supported Assignments (for test purpose):
    - Recursion.java
        - McCarthy91
        - Binary conversion
        - Stair climbing
        - Marker puzzle solver
    - OlympicResult.java
        - Custom comparison logic for Olympic medal results

6. Docker environments:
    -
    ##### Python:
    FROM python:3.10-slim
    RUN pip install pytest

    ##### Java:
    FROM openjdk:17-jdk-slim
    ENV CLASSPATH="/junit/*:."

    ##### C:
    FROM gcc:latest
    -

7. Test Orchestration:
    - Entrypoint scripts per language
    - Volume mounts for code submissions
    - JSON result output format

8. Workflow:
    - Student submits code file(s)
    - System detects language -> spins up matching container
    - Executes predefined test cases
    - Generates report with:
        - Test pass/fail status
        - Runtime metrics
        - Memeory usage (C/Python)
        - Stack traces for errors