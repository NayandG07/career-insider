import os
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from utils.db import get_db
from workflows.resume_parser import parse_resume, ResumeAnalysis
from workflows.skill_analyzer import analyze_skills, SkillProfile
from workflows.roadmap_generator import generate_roadmap, Roadmap
from workflows.company_matcher import match_companies, MatchResponse
from workflows.mentor_chat import chat_with_mentor, MentorResponse
from workflows.progress_summary import generate_progress_summary, SummaryResponse

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="CareerOS AI Service")

# CORS for Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await get_db()

@app.get("/ai/health")
async def health_check():
    return {"status": "healthy"}

# ─── Resume Parsing ────────────────────────────────────────
class ResumeRequest(BaseModel):
    resume_text: str

@app.post("/ai/resume")
async def process_resume(req: ResumeRequest):
    """Extract structured skills and experience from resume text."""
    try:
        result = await parse_resume(req.resume_text)
        return result
    except Exception as e:
        logging.error(f"Resume parsing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ─── Skill Analysis ────────────────────────────────────────
class SkillRequest(BaseModel):
    telemetry: Dict[str, Any] = {}
    user_context: Dict[str, Any] = {}

@app.post("/ai/skills/analyze")
async def process_skills(req: SkillRequest):
    """Analyze telemetry data and produce a skill profile."""
    try:
        resume_skills = req.user_context.get("resume_skills", [])
        result = await analyze_skills(req.telemetry, resume_skills)
        return result
    except Exception as e:
        logging.error(f"Skill analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ─── Roadmap Generation ───────────────────────────────────
class RoadmapRequest(BaseModel):
    target_roles: List[str]
    skill_profile: Dict[str, Any] = {}
    user_context: Dict[str, Any] = {}

@app.post("/ai/roadmap")
async def process_roadmap(req: RoadmapRequest):
    """Generate career roadmap milestones for target roles."""
    try:
        # Build gaps string from skill profile gap analysis
        gaps = ""
        gap_analysis = req.skill_profile.get("gapAnalysis", [])
        if gap_analysis:
            gaps = "; ".join([f"{g.get('name', '')}: {g.get('delta', '')}" for g in gap_analysis])
        result = await generate_roadmap(req.target_roles, req.skill_profile, gaps)
        return result
    except Exception as e:
        logging.error(f"Roadmap generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ─── Company Matching ─────────────────────────────────────
class CompanyRequest(BaseModel):
    skill_profile: Dict[str, Any] = {}
    user_context: Dict[str, Any] = {}

@app.post("/ai/companies")
async def process_companies(req: CompanyRequest):
    """Score and explain company compatibility."""
    try:
        result = await match_companies(req.skill_profile)
        return result
    except Exception as e:
        logging.error(f"Company matching error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ─── AI Mentor Chat ───────────────────────────────────────
class MentorRequest(BaseModel):
    message: str
    chat_history: List[Dict[str, str]] = []
    user_context: Dict[str, Any] = {}

@app.post("/ai/mentor/chat")
async def process_mentor_chat(req: MentorRequest):
    """Send a message to the AI mentor and get a contextual response."""
    try:
        # Append the current message to chat history for context
        history = req.chat_history + [{"sender": "user", "text": req.message}]
        result = await chat_with_mentor(history, req.user_context)
        return result
    except Exception as e:
        logging.error(f"Mentor chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ─── Progress Summary ─────────────────────────────────────
class ProgressSummaryRequest(BaseModel):
    skill_profile: Dict[str, Any] = {}
    roadmap: Dict[str, Any] = {}
    user_context: Dict[str, Any] = {}

@app.post("/ai/progress-summary")
async def process_progress_summary(req: ProgressSummaryRequest):
    """Generate a short personalised AI progress summary for the Reports page."""
    try:
        result = await generate_progress_summary(req.skill_profile, req.roadmap, req.user_context)
        return result
    except Exception as e:
        logging.error(f"Progress summary error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
