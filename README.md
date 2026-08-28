# CareerOS

CareerOS is an AI-powered Career Intelligence Platform designed to help students, developers, and early-career professionals understand where they stand in their career journey, identify skill gaps, receive personalized growth recommendations, and measure progress toward specific career goals.

Unlike a standard analytics dashboard, CareerOS doesn't just tell you what you've done—it tells you **what you should do next**.

## 📖 The Problem

Modern developers use multiple platforms throughout their journey:

- **GitHub** for contributions and projects
- **LeetCode, Codeforces, CodeChef** for algorithmic problem solving
- **Kaggle** for data science
- **Resumes and Certifications** for credentials

However, each platform provides isolated metrics. Developers often struggle to answer critical questions:

- *Am I job-ready?*
- *What specific skills am I missing?*
- *Why am I not getting interviews?*
- *What should I learn next?*

**CareerOS** aggregates these fragmented signals into actionable career intelligence, acting as a GPS for your professional growth.

## 🚀 Key Features

- **Unified Career Profile:** Connects to GitHub, LeetCode, Codeforces, Kaggle, etc., to aggregate your activity.
- **Career Assessment & Skill Intelligence:** AI-driven analysis translates raw activity into meaningful capabilities and readiness scores.
- **Personalized Roadmap Generation:** Generates actionable, prioritized learning steps based on your target role.
- **Company Matches:** Compares your profile against real company requirements to determine your readiness.
- **AI Mentor:** An on-demand, context-aware AI assistant to provide career guidance.

## 🏗 Architecture

CareerOS operates on a modern, multi-service architecture:

1. **Frontend (React + Vite + Tailwind):** A clean, responsive UI to visualize your career progress.
2. **Backend (Node.js + Express):** The primary API handling authentication (Email/OAuth), data persistence (MongoDB), file uploads, and scheduled syncing of external platforms.
3. **AI Microservice (Python + FastAPI):** A dedicated service running the **LLM Manager** (handling routing, key rotation, and fallback between Gemini, OpenAI, and HuggingFace) and executing core AI workflows (Resume Parsing, Roadmap Generation, Skill Analysis).

## 📚 Documentation

For a deeper dive into the product vision, architecture, and implementation details, please refer to our dedicated documentation files:

- [Product Context &amp; Vision](./docs/CONTEXT.md)
- [Project Documentation](./docs/PROJECT_DOCUMENTATION.md)
- [Implementation Plan (v2 Architecture)](./docs/IMPLEMENTATION_PLAN.md)

## 🛠 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (3.10+)
- MongoDB Atlas cluster
- API Keys for Gemini/OpenAI (for the AI Service)

### Installation & Running Locally

The project consists of three main services. You'll need to run them concurrently for local development.

**1. Backend (Node.js)**

```bash
cd backend
npm install
# Ensure you have a .env file configured (see .env.example)
npm run dev
```

**2. AI Service (Python FastAPI)**

```bash
cd ai_service
pip install -r requirements.txt
# Ensure you have a .env file configured (see .env.example)
uvicorn main:app --reload
```

**3. Frontend (React)**

```bash
cd frontend
npm install
npm run dev
```

The frontend will typically be accessible at `http://localhost:5173`, connecting to the backend API at `http://localhost:5000`, which in turn proxies AI requests to the Python service at `http://localhost:8000`.

## 🤝 Team & Collaborators

- **Bikash Das** - Frontend - [GitHub Profile](https://github.com/Bikashthegoat)
- **Dhiman Saikia** - Frontend and Backend - [GitHub Profile](https://github.com/Dhiman07-cyber)

---

*Built with ❤️ to navigate your career journey.*
