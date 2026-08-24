import json
from pydantic import BaseModel
from typing import List, Dict, Any
from llm_manager import llm_manager

class CategoryScore(BaseModel):
    category: str
    score: int # 0-100
    
class SkillProfile(BaseModel):
    categories: List[CategoryScore]
    mastery_items: List[str]
    gap_analysis: str
    trending_skills: List[str]

async def analyze_skills(telemetry_data: Dict[str, Any], resume_skills: List[str]) -> SkillProfile:
    """Analyzes telemetry data and resume skills to build a skill profile."""
    prompt = f"""
    Analyze the following developer telemetry and resume skills.
    Produce a structured skill profile.
    Return ONLY a valid JSON object with the following structure:
    {{
        "categories": [
            {{"category": "Algorithms", "score": 85}},
            {{"category": "Backend", "score": 70}}
        ],
        "mastery_items": ["Python", "Dynamic Programming"],
        "gap_analysis": "Needs more experience with System Design",
        "trending_skills": ["Go", "Kubernetes"]
    }}
    
    Telemetry Data:
    {json.dumps(telemetry_data)}
    
    Resume Skills:
    {json.dumps(resume_skills)}
    """
    
    result = await llm_manager.invoke(task="skill_analysis", prompt=prompt)
    
    if result.startswith("```json"):
        result = result[7:-3].strip()
    elif result.startswith("```"):
        result = result[3:-3].strip()
        
    try:
        data = json.loads(result)
        return SkillProfile(**data)
    except Exception as e:
        raise ValueError(f"Failed to parse LLM output: {e}\\nOutput was: {result}")
