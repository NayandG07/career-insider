import json
from pydantic import BaseModel
from typing import List
from llm_manager import llm_manager

class MatchFactor(BaseModel):
    strong: List[str]
    gap: List[str]

class CompanyMatch(BaseModel):
    company_name: str
    compatibility_score: int # 0-100
    breakdown_factors: MatchFactor

class MatchResponse(BaseModel):
    matches: List[CompanyMatch]

async def match_companies(skill_profile: dict) -> MatchResponse:
    """Matches a user's skill profile against potential companies."""
    prompt = f"""
    Given the following user skill profile, suggest top 3-5 tech companies that would be a good match.
    Calculate a compatibility score and provide breakdown factors (strong alignments vs gaps).
    
    Return ONLY a valid JSON object with the following structure:
    {{
        "matches": [
            {{
                "company_name": "Google",
                "compatibility_score": 85,
                "breakdown_factors": {{
                    "strong": ["Algorithms", "Python"],
                    "gap": ["Go"]
                }}
            }}
        ]
    }}
    
    Skill Profile:
    {json.dumps(skill_profile)}
    """
    
    result = await llm_manager.invoke(task="company_matching", prompt=prompt)
    
    if result.startswith("```json"):
        result = result[7:-3].strip()
    elif result.startswith("```"):
        result = result[3:-3].strip()
        
    try:
        data = json.loads(result)
        return MatchResponse(**data)
    except Exception as e:
        raise ValueError(f"Failed to parse LLM output: {e}\\nOutput was: {result}")
