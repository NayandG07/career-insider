import json
from pydantic import BaseModel
from llm_manager import llm_manager


class SummaryResponse(BaseModel):
    summary: str


async def generate_progress_summary(skill_profile: dict, roadmap: dict, user_context: dict) -> SummaryResponse:
    """Generates a concise, personalised AI progress summary for the Reports page."""

    name = user_context.get("name", "the user")
    readiness = user_context.get("readinessScore", 0)

    # Extract key facts to keep prompt short
    categories = skill_profile.get("categories", [])
    top_skills = [c.get("name", "") for c in categories[:3]]
    gaps = [g.get("name", "") for g in skill_profile.get("gapAnalysis", [])[:2]]
    milestones = roadmap.get("milestones", [])
    completed_ms = [m.get("title", "") for m in milestones if m.get("status") == "completed"]
    in_progress_ms = [m.get("title", "") for m in milestones if m.get("status") == "in-progress"]

    prompt = f"""Write a 2-3 sentence professional progress summary for a developer profile report card.

User: {name}
Overall readiness: {readiness}%
Top skill areas: {', '.join(top_skills) if top_skills else 'Not yet analyzed'}
Active gaps: {', '.join(gaps) if gaps else 'None identified'}
Completed milestones: {', '.join(completed_ms) if completed_ms else 'None yet'}
Currently working on: {', '.join(in_progress_ms) if in_progress_ms else 'Not started'}

Return ONLY the summary paragraph — no labels, no JSON, no markdown. Be specific, concise, and encouraging. Mention concrete skills and next steps."""

    result = await llm_manager.invoke(task="mentor_chat", prompt=prompt)
    return SummaryResponse(summary=result.strip().strip('"'))
