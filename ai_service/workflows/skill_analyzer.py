import json
from pydantic import BaseModel
from typing import List, Dict, Any
from llm_manager import llm_manager

class CategoryScore(BaseModel):
    name: str
    score: int  # 0-100
    tags: List[str] = []

class MasteryItem(BaseModel):
    title: str
    level: str  # "Beginner" | "Intermediate" | "Advanced" | "Expert"
    score: int
    trend: str  # "up" | "down" | "stable"

class GapItem(BaseModel):
    name: str
    delta: str
    priority: str

class TrendingItem(BaseModel):
    name: str
    demand: str

class SkillProfile(BaseModel):
    categories: List[CategoryScore]
    mastery_items: List[MasteryItem]
    gap_analysis: List[GapItem]
    trending_skills: List[TrendingItem]
    readiness_score: int = 0

async def analyze_skills(telemetry_data: Dict[str, Any], resume_skills: List[str]) -> SkillProfile:
    """Analyzes telemetry data and resume skills to build a skill profile."""
    prompt = f"""
    Analyze the following developer telemetry and resume skills.
    Produce a structured skill profile as a VALID JSON object only — no markdown, no extra text.

    Return this exact JSON structure:
    {{
        "categories": [
            {{"name": "Algorithms & DSA", "score": 85, "tags": ["Dynamic Programming", "Graph Theory", "Binary Search"]}},
            {{"name": "Backend Engineering", "score": 70, "tags": ["Node.js", "Python", "REST APIs"]}},
            {{"name": "Frontend", "score": 60, "tags": ["React", "TypeScript", "CSS"]}}
        ],
        "mastery_items": [
            {{"title": "Python", "level": "Advanced", "score": 88, "trend": "up"}},
            {{"title": "System Design", "level": "Intermediate", "score": 62, "trend": "stable"}}
        ],
        "gap_analysis": [
            {{"name": "Kubernetes", "delta": "High Delta (40%)", "priority": "P1 PRIORITY"}},
            {{"name": "Terraform", "delta": "Moderate Delta (25%)", "priority": "P2 PRIORITY"}}
        ],
        "trending_skills": [
            {{"name": "Rust", "demand": "+120% YoY demand"}},
            {{"name": "GraphQL Federation", "demand": "+85% YoY demand"}}
        ],
        "readiness_score": 72
    }}

    Telemetry Data:
    {json.dumps(telemetry_data)}

    Resume/Known Skills:
    {json.dumps(resume_skills)}

    Important: Return ONLY the JSON object. No markdown fences, no explanation.
    """

    result = await llm_manager.invoke(task="skill_analyze", prompt=prompt)

    # Strip markdown fences if present
    result = result.strip()
    if result.startswith("```json"):
        result = result[7:]
    if result.startswith("```"):
        result = result[3:]
    if result.endswith("```"):
        result = result[:-3]
    result = result.strip()

    try:
        data = json.loads(result)
        return SkillProfile(**data)
    except Exception as e:
        raise ValueError(f"Failed to parse LLM output: {e}\nOutput was: {result[:500]}")
