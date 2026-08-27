import json
from pydantic import BaseModel
from typing import List
from llm_manager import llm_manager

class CompanyMatch(BaseModel):
    name: str
    matchScore: int   # 0-100, field name matches frontend expectation
    tier: str         # e.g. "San Francisco, CA (Hybrid)"
    hiringInsights: str   # salary/role insight
    strong: List[str]     # strong alignment factors
    missing: List[str]    # gap factors

class MatchResponse(BaseModel):
    matches: List[CompanyMatch]

async def match_companies(skill_profile: dict) -> MatchResponse:
    """Matches a user's skill profile against potential companies."""
    prompt = f"""
    Given the following user skill profile, suggest 4-6 top tech companies that would be a great match.
    Calculate a compatibility score and provide breakdown factors.

    Return ONLY a valid JSON object — no markdown, no explanation — with this exact structure:
    {{
        "matches": [
            {{
                "name": "Stripe",
                "matchScore": 91,
                "tier": "San Francisco, CA (Hybrid)",
                "hiringInsights": "$160k - $210k · Staff Systems Engineer",
                "strong": ["Go / Infrastructure", "Distributed Systems", "API Design"],
                "missing": ["Chaos Engineering", "Kafka Streaming"]
            }},
            {{
                "name": "OpenAI",
                "matchScore": 85,
                "tier": "San Francisco, CA (Onsite)",
                "hiringInsights": "$220k - $310k · AI Infrastructure Lead",
                "strong": ["Python", "Machine Learning", "LLM Experience"],
                "missing": ["CUDA / GPU programming", "C++ systems"]
            }}
        ]
    }}

    Rules:
    - Generate 4-6 realistic tech company matches
    - matchScore is 0-100 based on actual alignment with the skill profile
    - strong = skills the user has that match the company's needs
    - missing = skill gaps the user needs to fill for this role
    - hiringInsights should be a realistic salary range and role title
    - tier should be a realistic location/remote info
    - Return ONLY the JSON. No markdown fences.

    Skill Profile:
    {json.dumps(skill_profile)}
    """

    result = await llm_manager.invoke(task="company_match", prompt=prompt)

    # Strip markdown fences
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
        return MatchResponse(**data)
    except Exception as e:
        raise ValueError(f"Failed to parse LLM output: {e}\nOutput was: {result[:500]}")
