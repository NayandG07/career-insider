# CareerOS Project Documentation

## The Problem We Want to Solve

Modern developers and students use a variety of platforms to learn, practice, and showcase their skills. These platforms include:
- **GitHub** (projects, contributions)
- **LeetCode / Codeforces / CodeChef** (problem-solving, algorithmic skills)
- **Kaggle** (data science, machine learning)
- **Certifications & Resumes** (credentials, experience)

**The issue:** Each of these platforms provides isolated metrics. A developer might know they have solved 300 LeetCode problems or made 500 GitHub contributions, but they cannot easily answer crucial career questions:
- *Am I job-ready for a Backend Developer role?*
- *What specific skills am I missing?*
- *Why am I not getting interviews at my target companies?*
- *What should I learn next to maximize my employability?*

Developers invest significant effort but lack clarity on whether their activities actually translate into career readiness.

**The Solution:** CareerOS is an AI-powered Career Intelligence Platform that aggregates these fragmented, isolated signals into actionable career guidance. It functions like a GPS for a user's career—taking their current activity as input, understanding their career goals, and telling them exactly what they should do next to achieve them.

---

## Current Updated Project Architecture

CareerOS is built on a two-service architecture with a modern, responsive frontend.

### 1. React Frontend (UI)
- **Tech Stack:** React, Vite, Tailwind CSS
- **Purpose:** A clean, responsive, and immutable design system that visualizes the user's career progress.
- **Key Features:** Dashboard (Readiness and Growth), Career Roadmap, Skill Intelligence, Company Matches, AI Mentor Chat, and a dedicated Admin Panel.

### 2. Node.js Express Backend (Primary API)
- **Tech Stack:** Node.js, Express, MongoDB (Atlas), Mongoose
- **Purpose:** Handles all core application logic, data persistence, and external data fetching.
- **Key Features:**
  - **Authentication:** Supports standard Email/Password and OAuth (Google, GitHub).
  - **Telemetry Fetching:** Uses cron jobs to periodically fetch user statistics from GitHub, LeetCode, Codeforces, CodeChef, and Kaggle.
  - **File Uploads:** Parses uploaded PDF resumes into raw text for further AI processing.
  - **Proxy to AI:** Routes complex AI requests to the Python microservice.
  - **Admin API:** Manages API keys, users, AI routing configurations, and sync jobs.

### 3. Python FastAPI (AI Microservice)
- **Tech Stack:** Python, FastAPI, Gemini/OpenAI/HuggingFace SDKs
- **Purpose:** A dedicated, scalable microservice for all AI workflows and LLM inferences.
- **Key Features:**
  - **LLM Manager:** A robust engine that handles task-to-model routing, API key rotation, and fallback chains (e.g., if Gemini fails, fallback to OpenAI).
  - **AI Workflows:**
    - **Resume Parser:** Converts raw text into structured JSON.
    - **Roadmap Generator:** Creates personalized learning milestones based on target roles.
    - **Skill Analyzer:** Re-computes skill profiles from raw telemetry data.
    - **Company Matcher:** Scores compatibility with target companies.
    - **AI Mentor:** Stateful, conversational career guidance.

---

## How It Works Together
1. **Data Aggregation:** The Node.js backend continuously aggregates raw data from a user's connected platforms.
2. **AI Processing:** The Python microservice processes this raw data, leveraging the most appropriate AI model via the LLM Manager, turning raw stats into structured skill scores and readiness metrics.
3. **Actionable Insights:** The React frontend displays these insights, providing the user with a clear, actionable roadmap, company matches, and an AI mentor to guide their next steps.
