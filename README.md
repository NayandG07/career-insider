# 🚀 CareerOS — AI-Powered Career Intelligence Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.10+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

**CareerOS** is an AI-powered Career Intelligence Platform designed to help students, developers, and early-career professionals understand where they stand in their career journey, identify skill gaps, receive personalized growth recommendations, and measure progress toward specific career goals.

Unlike a standard analytics dashboard, CareerOS doesn't just tell you what you've done — it tells you **what you should do next**.

---

## 📖 The Problem

Modern developers use multiple platforms throughout their journey:
- **GitHub** for contributions and production code
- **LeetCode & Codeforces** for algorithmic problem solving and competitive ratings
- **Kaggle** for data science and machine learning
- **Resumes & Certifications** for formal credentials

However, each platform provides isolated metrics. Developers often struggle to answer critical questions:
- *Am I job-ready for my target role?*
- *What specific skills am I missing?*
- *Why am I not getting interviews?*
- *What should I learn next to maximize my employability?*

**CareerOS** aggregates these fragmented signals into actionable career intelligence, acting as a GPS for your professional growth.

---

## 🚀 Key Features

- **Unified Developer Profile:** Aggregates real-time telemetry from GitHub, LeetCode, Codeforces, Kaggle, and uploaded PDF resumes into one verified profile.
- **Skill Intelligence & Gap Analysis:** Synthesizes raw platform activity into 4 core pillars (*Languages*, *Frameworks*, *Systems*, *Algorithms*) and calculates readiness scores against target roles.
- **Personalized Career Roadmap GPS:** AI generates structured, chronological milestones with actionable subtasks and real-time completion tracking.
- **Company Compatibility Matcher:** Evaluates candidate profiles against specific company tech stacks and prerequisites (e.g., Google, Stripe, Meta) to highlight competency overlaps and gaps.
- **Context-Aware AI Mentor:** On-demand AI assistant with full context of your live telemetry, roadmaps, and skills for targeted interview prep, code reviews, and career guidance.
- **Admin Console & Dynamic AI Router:** Manage users, store encrypted API keys, and configure real-time LLM fallback chains per task without restarting servers.

---

## 🏗 Architecture Overview

CareerOS operates on a modern, decoupled **3-Tier Microservices Architecture**:

1. **Frontend (React 18 + Vite + Tailwind CSS):** Responsive SPA for visualizing career progress, roadmaps, and telemetry diagnostics.
2. **Backend Gateway (Node.js + Express):** Core API handling JWT/OAuth authentication, background telemetry syncing (`node-cron`), resume PDF text parsing, and proxying AI requests.
3. **AI Microservice (Python + FastAPI):** High-performance AI engine running the **LLM Manager** with dynamic multi-provider routing and automated fallback chains (Google Gemini, OpenAI GPT, HuggingFace).
4. **Database (MongoDB):** Centralized persistence layer for user credentials, cached telemetry, roadmaps, projects, skill profiles, and AI configurations.

> 📖 *For complete architecture diagrams, data pipelines, and database schemas, check out the dedicated [System Architecture Documentation](./docs/ARCHITECTURE.md).*

---

## 📚 Documentation

For in-depth guides and technical documentation, refer to our dedicated files:

- [Product Context & Vision](./docs/CONTEXT.md) — Product background, user personas, and core design principles
- [Project Documentation](./docs/PROJECT_DOCUMENTATION.md) — High-level project summary and problem statement
- [System Architecture & Schemas](./docs/ARCHITECTURE.md) — Detailed 3-tier microservice architecture, data flow diagrams, database schemas, and security model
- [Platform Integration Specs](./docs/) — Deep dives into [GitHub](./docs/Github.md), [LeetCode](./docs/Leetcode.md), and [Codeforces](./docs/CodeForces.md) telemetry ingestion

---

## 🛠 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Python** (3.10+)
- **MongoDB** (Local instance on `mongodb://localhost:27017` or MongoDB Atlas URI)
- **API Keys** for Google Gemini and/or OpenAI (for the AI Microservice)

---

### Installation & Running Locally

CareerOS consists of three services that run concurrently in local development.

#### 1. Backend Gateway (Node.js)

```bash
cd backend
npm install
# Configure your environment variables
cp .env.example .env
npm run dev
```
*Runs on `http://localhost:5000`*

#### 2. AI Microservice (Python FastAPI)

```bash
cd ai_service
# Create and activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
# Configure your environment variables
cp .env.example .env
python -m uvicorn main:app --reload --port 8000
```
*Runs on `http://localhost:8000`*

#### 3. Frontend Application (React)

```bash
cd frontend
npm install
# Configure your environment variables
cp .env.example .env
npm run dev
```
*Runs on `http://localhost:5173`*

Open [http://localhost:5173](http://localhost:5173) in your browser to start using CareerOS.

---

## ⚙ Environment Configuration

Quick reference for setting up `.env` files in each service directory:

| Service | File | Key Variables |
| :--- | :--- | :--- |
| **Backend** | `backend/.env` | `PORT=5000`, `CLIENT_URL=http://localhost:5173`, `AI_SERVICE_URL=http://localhost:8000`, `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` |
| **AI Service** | `ai_service/.env` | `PORT=8000`, `MONGO_URI`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `HUGGINGFACE_API_KEY` |
| **Frontend** | `frontend/.env` | `VITE_API_URL=http://localhost:5000/api` |

---

## 🤝 Team & Collaborators

- **Bikash Das** - Frontend - [GitHub Profile](https://github.com/Bikashthegoat)
- **Dhiman Saikia** - Frontend and Backend - [GitHub Profile](https://github.com/Dhiman07-cyber)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
