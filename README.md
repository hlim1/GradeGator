# GradeGator

GradeGator is a web-based grading and course management system designed to support programming courses. It provides tools for instructors to manage courses, assignments, submissions, grading, and feedback, while allowing students to submit work and review their grades and feedback.

GradeGator combines a Django REST backend, a Next.js frontend, PostgreSQL for data storage, and Docker-based environments for automated grading.

## Features

### User Management

* Support for student, instructor, and administrator roles
* User authentication and authorization
* Role-based access to application features
* Course enrollment and roster management

### Course Management

* Create, view, update, and manage courses
* Manage students and instructors
* View current and previous courses
* Search and organize course information

### Assignment Management

* Create and manage assignments
* Configure assignment information and deadlines
* Accept student file submissions
* Support programming assignments
* Track submissions by student and assignment

### Grading

* Instructor-facing grading tools
* Grade tracking and management
* Rubric-based grading and feedback
* Automated grading support for programming assignments
* Student access to grades and feedback

### Autograding

GradeGator includes a Docker-based autograding system for executing student programs in isolated environments.

Currently supported languages include:

* **Python 3.10**, with `pytest`
* **Java 17**, with JUnit
* **C**, with GCC

The general autograding workflow is:

1. A student submits source code.
2. GradeGator determines the programming language.
3. The appropriate Docker grading environment is started.
4. Predefined tests are executed against the submission.
5. Test results are collected.
6. The results are returned to the grading system.

Autograder results may include:

* Test pass/fail status
* Runtime information
* Memory usage where supported
* Error messages and stack traces

## Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* React Icons
* npm
* ESLint

### Backend

* Python
* Django
* Django REST Framework
* PostgreSQL
* drf-spectacular
* REST API
* Session and token-based authentication

### Autograder

* Docker
* Python 3.10
* pytest
* Java 17
* JUnit
* GCC

### Storage and Services

* PostgreSQL
* AWS S3 support for file storage

## Repository Structure

```text
GradeGator/
├── autograder/          # Automated grading environments and scripts
├── front-end/           # Earlier frontend implementation
├── react-front-end/     # Current Next.js/React frontend
├── web-server/          # Django backend and REST API
├── ProjectManagement/   # Project planning and management documents
└── README.md
```

The primary application components are:

```text
react-front-end/
```

for the user interface,

```text
web-server/
```

for the backend and REST API, and

```text
autograder/
```

for automated evaluation of programming submissions.

## Development Environment

The recommended development environment is:

* Visual Studio Code
* Git
* Python
* Node.js and npm
* PostgreSQL
* Docker Desktop

Developers may run the frontend and backend locally while using Docker for isolated grading environments.

## Prerequisites

Before setting up GradeGator, install:

* Git
* Python 3
* Node.js
* npm
* PostgreSQL
* Docker
* Visual Studio Code, recommended

Verify the major tools with:

```bash
git --version
python3 --version
node --version
npm --version
docker --version
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/hlim1/GradeGator.git
cd GradeGator
```

## Backend Setup

### 2. Enter the Backend Directory

```bash
cd web-server
```

### 3. Create a Python Virtual Environment

On macOS or Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

On Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

### 4. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure PostgreSQL

Create a PostgreSQL database for GradeGator.

For example:

```sql
CREATE DATABASE grade_gator;
```

Configure the backend to use your local database credentials.

Database passwords, application secrets, API keys, and other credentials should be stored using environment variables and must not be committed to the repository.

### 6. Apply Database Migrations

```bash
python manage.py migrate
```

### 7. Create an Administrator Account

If needed:

```bash
python manage.py createsuperuser
```

Follow the prompts to create the account.

### 8. Start the Django Development Server

```bash
python manage.py runserver
```

The backend should then be available at:

```text
http://localhost:8000
```

## API Documentation

When the backend is running, API documentation is available through the Django server.

Open:

```text
http://localhost:8000/api/docs/
```

The API documentation is generated using `drf-spectacular`.

## Frontend Setup

Open a second terminal from the GradeGator repository.

### 1. Enter the Frontend Directory

```bash
cd react-front-end
```

### 2. Install Dependencies

Because the repository contains a `package-lock.json`, the recommended command for a reproducible installation is:

```bash
npm ci
```

For development when intentionally modifying dependencies, you may instead use:

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

in your browser.

The frontend communicates with the Django backend through its REST API.

## Autograder Setup

GradeGator uses Docker containers to provide isolated grading environments.

Make sure Docker is installed and running before working with the autograder.

Enter the autograder directory:

```bash
cd autograder
```

The autograder contains language-specific environments and scripts used to compile or execute student submissions.

Example environments include:

### Python

```dockerfile
FROM python:3.10-slim
RUN pip install pytest
```

### Java

Java submissions use a Java 17 environment with JUnit support.

### C

C submissions are compiled using GCC inside a containerized environment.

Developers modifying the autograder should avoid executing untrusted student code directly on the host operating system.

## Environment Variables

Application-specific configuration should be stored in environment variables rather than directly in source code.

Typical configuration may include:

```text
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_HOST=
DATABASE_PORT=

DJANGO_SECRET_KEY=

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=

NEXT_PUBLIC_API_URL=
```

Do not commit real credentials to Git.

A `.env.example` file should contain the names of required configuration variables without containing real secrets.

## Dependency Management

Dependencies should be pinned so that development and production environments do not unexpectedly use incompatible versions.

### Frontend

The frontend uses:

```text
package.json
package-lock.json
```

Developers should use:

```bash
npm ci
```

for normal reproducible installations.

Dependency changes should update both `package.json` and `package-lock.json`.

### Backend

Python dependencies are maintained in:

```text
web-server/requirements.txt
```

Production dependencies should use explicit versions where practical.

Dependency updates should be performed intentionally, tested locally, and reviewed before being merged.

## Linting and Formatting

### Frontend

The Next.js frontend uses ESLint.

Run:

```bash
npm run lint
```

before submitting frontend changes.

Prettier is recommended for automatic formatting of:

* TypeScript
* JavaScript
* React components
* JSON
* CSS
* Markdown

Recommended scripts are:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

### Backend

Ruff is recommended for Python linting and formatting.

Example commands:

```bash
ruff check .
ruff format --check .
```

To automatically format Python code:

```bash
ruff format .
```

## Testing

Changes should be tested before being merged.

### Backend

Run the Django tests with:

```bash
python manage.py test
```

### Frontend

Run linting with:

```bash
npm run lint
```

Additional frontend tests should be run when test suites are available.

### Autograder

Changes to grading environments should be tested using sample submissions before being used with real student submissions.

Both passing and failing submissions should be tested.

## Git Workflow

Create a separate branch for each feature, bug fix, or development task.

```bash
git checkout -b feature/your-feature-name
```

After making changes:

```bash
git status
git add .
git commit -m "Describe the change"
git push -u origin feature/your-feature-name
```

Open a pull request on GitHub for review.

Avoid committing directly to `main` for normal development work.

## Branch Naming

Suggested branch prefixes include:

```text
feature/
fix/
docs/
refactor/
test/
chore/
```

Examples:

```text
feature/assignment-upload
fix/student-login
docs/development-setup
test/autograder-python
```

## Commit Messages

Commit messages should briefly describe what changed.

Examples:

```text
Add course creation form
Fix assignment submission validation
Add Python autograder tests
Update frontend setup instructions
```

Prefer small, focused commits instead of combining unrelated changes into one commit.

## AI-Assisted Development

AI development tools such as GitHub Copilot or ChatGPT may be used when permitted by the project's AI policy.

Appropriate uses may include:

* Code completion
* Explaining code
* Generating test ideas
* Finding possible bugs
* Suggesting refactorings
* Drafting documentation

Developers remain responsible for all AI-generated code.

AI-generated code must be:

1. Reviewed by a developer.
2. Understood before it is committed.
3. Tested using the project's normal testing process.
4. Checked for security problems.
5. Checked for incompatible or invented APIs and dependencies.

Do not provide external AI systems with:

* Student submissions
* Student grades
* Personally identifiable student information
* Authentication tokens
* API keys
* Passwords
* Database contents
* Other confidential project data

## Development Costs

The standard GradeGator development environment should use free or institutionally provided tools whenever possible.

Developers should not be expected to personally pay for required development infrastructure.

Potential paid services may include:

* GitHub Codespaces
* GitHub Copilot
* Cloud hosting
* AWS services
* Managed databases
* Commercial AI tools

Any paid service used for the project should have:

* A documented purpose
* An identified funding source
* An identified account owner
* A documented expected cost or usage limit
* Approval from the appropriate project supervisor or owner

Free educational or institutional resources should be preferred when available.

## Security

GradeGator processes sensitive educational information and student submissions. Security should therefore be considered throughout development.

Developers should:

* Never commit passwords or API keys.
* Use environment variables for secrets.
* Keep `.env` files out of version control.
* Review authentication and authorization changes carefully.
* Validate uploaded files.
* Run untrusted student programs only inside isolated environments.
* Avoid logging sensitive student information.
* Keep dependencies updated.
* Review security-related dependency alerts.
* Use test credentials rather than production credentials during development.

If credentials have previously been committed to Git history, removing them from the current file is not sufficient. The affected credentials should also be revoked and replaced.

## Recommended Development Tools

### IDE

Visual Studio Code is the recommended IDE.

Useful extensions include:

* Python
* Ruff
* ESLint
* Prettier
* Docker
* GitHub Pull Requests and Issues

### Optional AI Tools

* GitHub Copilot
* ChatGPT

Use of AI tools must follow the project's AI policy and data privacy requirements.

## Dev Containers and Codespaces

GradeGator may provide a `.devcontainer` configuration to create a consistent development environment.

A Dev Container can provide:

* Python
* Node.js
* npm
* PostgreSQL client tools
* Git
* Ruff
* ESLint
* Prettier
* Docker tooling

The same configuration can also support GitHub Codespaces.

Using a Dev Container is recommended for developers who want a reproducible environment, but local development remains supported.

## Contributing

Contributions to GradeGator should follow this general process:

1. Pull the latest changes from `main`.
2. Create a development branch.
3. Implement one focused change.
4. Add or update tests when appropriate.
5. Run linting and formatting tools.
6. Test the affected application components.
7. Commit the changes with a descriptive message.
8. Push the branch.
9. Open a pull request.
10. Address review comments before merging.

Example:

```bash
git checkout main
git pull
git checkout -b feature/my-feature

# Make changes

git add .
git commit -m "Add my feature"
git push -u origin feature/my-feature
```

## Project Status

GradeGator is under active development.

Some functionality, documentation, security configuration, testing infrastructure, and deployment processes may still be incomplete or subject to change.

Developers should review the repository and open issues before beginning major changes.

## License

## Contact

For project questions, bug reports, and development discussions, use the repository's GitHub Issues page:

`https://github.com/hlim1/GradeGator/issues`

---

**GradeGator**
A course management, grading, and programming autograding platform.
