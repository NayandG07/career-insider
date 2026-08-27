import json
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from llm_manager import llm_manager

class CategoryDimensions(BaseModel):
    breadth: int = 0
    depth: int = 0
    recency: int = 0
    application: int = 0
    corroboration: int = 0

class CategoryScore(BaseModel):
    name: str
    score: int  # 0-100 deterministic evidence strength
    level: str = "Developing"  # "Advanced Evidence" | "Strong" | "Developing" | "Emerging" | "Insufficient Evidence"
    dimensions: Optional[CategoryDimensions] = None
    skills: List[str] = []

class TraceableSkill(BaseModel):
    name: str
    category: str = "General"
    level: str = "Developing"  # "Advanced Evidence" | "Strong" | "Developing" | "Emerging"
    confidence: str = "Moderate"  # "High" | "Moderate" | "Low"
    evidenceStrength: int = 50
    evidenceCount: int = 1
    evidenceSummary: str = ""
    evidenceRefs: List[str] = []
    explanation: str = ""
    whyItMatters: str = ""
    focusNext: str = ""

class GapItem(BaseModel):
    name: str
    category: str = "General"
    delta: str = "Moderate Delta"
    priority: str = "P2 PRIORITY"
    recommendation: str = ""
    evidenceRefs: List[str] = []

class SkillProfile(BaseModel):
    readiness_score: int = 0
    score_version: int = 2
    scoring_model: str = "v2-5dim"
    categories: List[CategoryScore] = []
    skills: List[TraceableSkill] = []
    gap_analysis: List[GapItem] = []
    source_contributions: Optional[Dict[str, Any]] = None
    last_computed_at: Optional[str] = None

def _extract_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    start = text.find('{')
    if start == -1:
        raise ValueError("No JSON object found in LLM response")

    depth = 0
    end = -1
    for i, ch in enumerate(text[start:], start):
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break

    if end == -1:
        partial = text[start:]
        open_braces = partial.count('{') - partial.count('}')
        open_brackets = partial.count('[') - partial.count(']')
        partial = partial.rstrip().rstrip(',')
        partial += ']' * max(0, open_brackets) + '}' * max(0, open_braces)
        return partial

    return text[start:end]

async def analyze_skills(evidence_package: Dict[str, Any]) -> SkillProfile:
    """Interprets verified deterministic evidence into qualitative mastery bands, confidence levels, and concrete actionable gaps."""

    raw_metrics = evidence_package.get("rawMetrics", {})
    categories_input = evidence_package.get("categories", [])
    evidence_items = evidence_package.get("evidenceItems", [])
    source_contributions = evidence_package.get("sourceContributions", {})

    prompt = f"""You are CareerOS Skill Intelligence Engine v2.
You are given verified platform metrics, deterministic 5-dimension scores, and traceable evidence items.

CRITICAL ARCHITECTURE RULES:
1. PRESERVE the deterministic category names, scores (0-100), and dimensional calculations from the input.
2. DO NOT hallucinate fake raw numbers or percentages.
3. Assign qualitative levels ('Advanced Evidence', 'Strong', 'Developing', 'Emerging', 'Insufficient Evidence').
4. Assign confidence ('High', 'Moderate', 'Low') based on cross-source corroboration and data density.
5. Provide clear, student-friendly 'whyItMatters' and actionable 'focusNext' (next concrete evidence to build).
6. Prioritize real gaps tied to the user's missing practical or algorithmic evidence.

Verified Raw Metrics:
{json.dumps(raw_metrics)}

Deterministic Categories & 5-Dimension Scores:
{json.dumps(categories_input)}

Traceable Evidence Items:
{json.dumps(evidence_items[:30])}

Return ONLY a valid JSON object matching this schema (no markdown, no other text):
{{
    "readiness_score": 68,
    "categories": [
        {{
            "name": "Algorithms & Problem Solving",
            "score": 64,
            "level": "Developing",
            "skills": ["Dynamic Programming", "Graph Theory", "Binary Search"]
        }}
    ],
    "skills": [
        {{
            "name": "Dynamic Programming",
            "category": "Algorithms & Problem Solving",
            "level": "Developing",
            "confidence": "High",
            "evidenceStrength": 64,
            "evidenceCount": 12,
            "evidenceSummary": "12 tagged problems solved across LeetCode and Codeforces",
            "evidenceRefs": ["leetcode:tag:dynamic-programming", "codeforces:tag:dp"],
            "explanation": "Consistent problem-solving track record in memoization and 1D/2D state transitions.",
            "whyItMatters": "Core foundational criteria in high-bar backend and algorithmic technical rounds.",
            "focusNext": "Build proof of competency in advanced 2D grid DP and interval DP patterns."
        }}
    ],
    "gap_analysis": [
        {{
            "name": "System Observability & Load Testing",
            "category": "Backend Engineering",
            "delta": "Moderate Delta",
            "priority": "P1 PRIORITY",
            "recommendation": "Integrate structured logging and conduct load testing benchmarks on your API services.",
            "evidenceRefs": ["project:tech:express", "project:tech:mongodb"]
        }}
    ]
}}"""

    result = await llm_manager.invoke(task="skill_analyze", prompt=prompt)

    try:
        json_str = _extract_json(result)
        data = json.loads(json_str)

        # Sanitize categories preserving input dimensions
        categories = []
        input_cat_map = {c.get("name"): c for c in categories_input}
        for c in data.get("categories", []):
            c_name = str(c.get("name", "General"))
            input_match = input_cat_map.get(c_name, {})
            score = int(input_match.get("score", c.get("score", 50)))
            level = str(input_match.get("level", c.get("level", "Developing")))
            dims_data = input_match.get("dimensions", {})

            categories.append(CategoryScore(
                name=c_name,
                score=score,
                level=level,
                dimensions=CategoryDimensions(
                    breadth=int(dims_data.get("breadth", 0)),
                    depth=int(dims_data.get("depth", 0)),
                    recency=int(dims_data.get("recency", 0)),
                    application=int(dims_data.get("application", 0)),
                    corroboration=int(dims_data.get("corroboration", 0)),
                ),
                skills=[str(s) for s in c.get("skills", [])],
            ))

        # Sanitize skills with confidence and evidenceRefs
        skills = []
        for s in data.get("skills", []):
            skills.append(TraceableSkill(
                name=str(s.get("name", "Skill")),
                category=str(s.get("category", "General")),
                level=str(s.get("level", "Developing")),
                confidence=str(s.get("confidence", "Moderate")),
                evidenceStrength=int(float(str(s.get("evidenceStrength", 50)))),
                evidenceCount=int(float(str(s.get("evidenceCount", 1)))),
                evidenceSummary=str(s.get("evidenceSummary", "")),
                evidenceRefs=[str(r) for r in s.get("evidenceRefs", [])],
                explanation=str(s.get("explanation", "")),
                whyItMatters=str(s.get("whyItMatters", "")),
                focusNext=str(s.get("focusNext", "")),
            ))

        # Sanitize gaps
        gaps = []
        for g in data.get("gap_analysis", []):
            gaps.append(GapItem(
                name=str(g.get("name", "Gap")),
                category=str(g.get("category", "General")),
                delta=str(g.get("delta", "Moderate Delta")),
                priority=str(g.get("priority", "P2 PRIORITY")),
                recommendation=str(g.get("recommendation", "")),
                evidenceRefs=[str(r) for r in g.get("evidenceRefs", [])],
            ))

        readiness = int(float(str(data.get("readiness_score", 50))))

        return SkillProfile(
            readiness_score=readiness,
            score_version=2,
            scoring_model="v2-5dim",
            categories=categories,
            skills=skills,
            gap_analysis=gaps,
            source_contributions=source_contributions,
        )

    except Exception as e:
        raise ValueError(f"Failed to parse skill intelligence output: {e}\nOutput: {result[:300]}")
