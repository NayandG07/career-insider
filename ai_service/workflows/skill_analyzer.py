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

    # 1. Try finding complete balanced JSON
    depth = 0
    in_string = False
    escape = False
    for i, ch in enumerate(text[start:], start):
        if escape:
            escape = False
            continue
        if ch == '\\':
            escape = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if not in_string:
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    try:
                        candidate = text[start:i+1]
                        json.loads(candidate)
                        return candidate
                    except Exception:
                        pass

    # 2. Truncated repair: Roll back to last cleanly closed object '}'
    candidate = text[start:]
    last_brace = candidate.rfind('}')
    while last_brace > 0:
        sub = candidate[:last_brace+1]
        open_brackets = sub.count('[') - sub.count(']')
        open_braces = sub.count('{') - sub.count('}')
        fixed = sub + (']' * max(0, open_brackets)) + ('}' * max(0, open_braces))
        try:
            json.loads(fixed)
            return fixed
        except Exception:
            last_brace = candidate.rfind('}', 0, last_brace)

    return candidate

async def analyze_skills(evidence_package: Dict[str, Any]) -> SkillProfile:
    """Interprets verified deterministic evidence into qualitative mastery bands, confidence levels, and concrete actionable gaps."""

    raw_metrics = evidence_package.get("rawMetrics", {})
    categories_input = evidence_package.get("categories", [])
    candidate_skills = evidence_package.get("candidateSkills", [])
    evidence_items = evidence_package.get("evidenceItems", [])
    source_contributions = evidence_package.get("sourceContributions", {})

    # Fallback to build candidate skills from skillEvidenceMap if candidateSkills is empty
    if not candidate_skills and "skillEvidenceMap" in evidence_package:
        for skill_name, ev_list in evidence_package["skillEvidenceMap"].items():
            sources = list({e.get("source") for e in ev_list if e.get("source")})
            count = len(ev_list)
            candidate_skills.append({
                "name": skill_name,
                "category": "General",
                "level": "Strong" if count >= 3 else "Developing" if count == 2 else "Emerging",
                "confidence": "High" if len(sources) >= 2 or count >= 3 else "Moderate",
                "evidenceStrength": min(95, max(25, count * 22)),
                "evidenceCount": count,
                "evidenceSummary": f"{count} data points across {', '.join(sources)}",
                "evidenceRefs": [e.get("id") for e in ev_list if e.get("id")],
                "sources": sources,
                "explanation": f"Verified activity in {skill_name}.",
                "whyItMatters": f"Practical ability in {skill_name}.",
                "focusNext": f"Deepen experience in {skill_name}.",
            })

    # Select prominent candidate skills (top 12) for deep LLM interpretation
    skills_for_prompt = []
    for s in candidate_skills[:12]:
        skills_for_prompt.append({
            "name": s.get("name"),
            "category": s.get("category", "General"),
            "evidenceStrength": s.get("evidenceStrength", 50),
            "evidenceCount": s.get("evidenceCount", 1),
            "evidenceSummary": s.get("evidenceSummary", ""),
            "evidenceRefs": s.get("evidenceRefs", []),
            "sources": s.get("sources", []),
        })

    prompt = f"""You are CareerOS Skill Intelligence Engine v2.
You are given verified platform metrics, deterministic 5-dimension scores, and candidate skill evidence records.

CRITICAL ARCHITECTURE RULES:
1. PRESERVE the deterministic category names, scores (0-100), and dimensional calculations from the input.
2. Evaluate and return an entry in "skills" for each of the Candidate Skills provided below.
3. For EACH candidate skill:
   - PRESERVE the exact "name", "category", "evidenceStrength", "evidenceCount", and "evidenceRefs" from the input.
   - Refine "level" ('Advanced Evidence', 'Strong', 'Developing', 'Emerging').
   - Refine "confidence" ('High', 'Moderate', 'Low') based on cross-source corroboration and data density.
   - Provide a concise 1-sentence "explanation" explaining what evidence proves this skill.
   - Provide a concise 1-sentence "whyItMatters" explaining why this skill is valued in software engineering evaluations.
   - Provide a concise 1-sentence "focusNext" (next concrete evidence or project milestone to build).
4. In "gap_analysis", provide 2-3 genuine industry skill gaps (e.g. System Observability, Unit Testing, Load Benchmarking) tied to the user's stack. These MUST NOT be in the "skills" list.
5. Return ONLY a valid JSON object matching this schema (no markdown, no other text):

Verified Raw Metrics:
{json.dumps(raw_metrics)}

Deterministic Categories & 5-Dimension Scores:
{json.dumps(categories_input)}

Candidate Skills to Evaluate ({len(skills_for_prompt)} items):
{json.dumps(skills_for_prompt)}

JSON Schema:
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

        # Build candidate skill lookup for fallback merging
        candidate_map = {s["name"].lower(): s for s in candidate_skills}

        # Sanitize AI skills
        ai_skills = []
        seen_skill_names = set()

        for s in data.get("skills", []):
            s_name = str(s.get("name", "")).strip()
            if not s_name:
                continue

            lower_name = s_name.lower()
            seen_skill_names.add(lower_name)

            # Match against deterministic candidate if exists to preserve accurate metrics
            base = candidate_map.get(lower_name, {})
            cat = str(s.get("category") or base.get("category") or "General")
            ev_strength = int(float(str(s.get("evidenceStrength") or base.get("evidenceStrength") or 50)))
            ev_count = int(float(str(s.get("evidenceCount") or base.get("evidenceCount") or 1)))
            ev_summary = str(s.get("evidenceSummary") or base.get("evidenceSummary") or "")
            ev_refs = [str(r) for r in (s.get("evidenceRefs") or base.get("evidenceRefs") or [])]
            level = str(s.get("level") or base.get("level") or "Developing")
            confidence = str(s.get("confidence") or base.get("confidence") or "Moderate")

            ai_skills.append(TraceableSkill(
                name=s_name,
                category=cat,
                level=level,
                confidence=confidence,
                evidenceStrength=ev_strength,
                evidenceCount=ev_count,
                evidenceSummary=ev_summary,
                evidenceRefs=ev_refs,
                explanation=str(s.get("explanation") or base.get("explanation") or f"Demonstrated competency in {s_name}."),
                whyItMatters=str(s.get("whyItMatters") or base.get("whyItMatters") or f"Core capability in {cat}."),
                focusNext=str(s.get("focusNext") or base.get("focusNext") or f"Continue practical implementation and pattern variations in {s_name}."),
            ))

        # Merge any candidate skills that the LLM missed so no candidate skill is dropped
        for cand in candidate_skills:
            cand_name = cand["name"].strip()
            if cand_name.lower() not in seen_skill_names:
                ai_skills.append(TraceableSkill(
                    name=cand_name,
                    category=cand.get("category", "General"),
                    level=cand.get("level", "Developing"),
                    confidence=cand.get("confidence", "Moderate"),
                    evidenceStrength=int(cand.get("evidenceStrength", 50)),
                    evidenceCount=int(cand.get("evidenceCount", 1)),
                    evidenceSummary=str(cand.get("evidenceSummary", "")),
                    evidenceRefs=[str(r) for r in cand.get("evidenceRefs", [])],
                    explanation=str(cand.get("explanation", f"Demonstrated competency in {cand_name}.")),
                    whyItMatters=str(cand.get("whyItMatters", f"Important domain skill in {cand.get('category', 'General')}.")),
                    focusNext=str(cand.get("focusNext", f"Continue building practical evidence in {cand_name}.")),
                ))

        # Sort all skills deterministically by evidenceStrength descending, then count, then name
        ai_skills.sort(key=lambda x: (-x.evidenceStrength, -x.evidenceCount, x.name.lower()))

        # Sanitize categories preserving input dimensions and mapping final skill names
        categories = []
        input_cat_map = {c.get("name"): c for c in categories_input}
        
        # Build category skills mapping from final sorted skills
        cat_skills_map = {}
        for sk in ai_skills:
            cat_skills_map.setdefault(sk.category, []).append(sk.name)

        for c_input in categories_input:
            c_name = str(c_input.get("name", "General"))
            score = int(c_input.get("score", 50))
            level = str(c_input.get("level", "Developing"))
            dims_data = c_input.get("dimensions", {})
            assigned_skills = cat_skills_map.get(c_name, c_input.get("skills", []))

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
                skills=[str(s) for s in assigned_skills],
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
            skills=ai_skills,
            gap_analysis=gaps,
            source_contributions=source_contributions,
        )

    except Exception as e:
        print(f"[SkillAnalyzer] LLM interpretation warning/fallback: {e}")
        # Build robust deterministic profile so skill analysis never fails
        all_skills = []
        for cand in candidate_skills:
            cand_name = cand["name"].strip()
            all_skills.append(TraceableSkill(
                name=cand_name,
                category=cand.get("category", "General"),
                level=cand.get("level", "Developing"),
                confidence=cand.get("confidence", "Moderate"),
                evidenceStrength=int(cand.get("evidenceStrength", 50)),
                evidenceCount=int(cand.get("evidenceCount", 1)),
                evidenceSummary=str(cand.get("evidenceSummary", "")),
                evidenceRefs=[str(r) for r in cand.get("evidenceRefs", [])],
                explanation=str(cand.get("explanation", f"Demonstrated practical evidence in {cand_name}.")),
                whyItMatters=str(cand.get("whyItMatters", f"Key criteria in {cand.get('category', 'General')}.")),
                focusNext=str(cand.get("focusNext", f"Continue building verified proof points in {cand_name}.")),
            ))
        all_skills.sort(key=lambda x: (-x.evidenceStrength, -x.evidenceCount, x.name.lower()))

        categories = []
        for c_input in categories_input:
            c_name = str(c_input.get("name", "General"))
            dims_data = c_input.get("dimensions", {})
            cat_skills = [sk.name for sk in all_skills if sk.category == c_name]
            categories.append(CategoryScore(
                name=c_name,
                score=int(c_input.get("score", 50)),
                level=str(c_input.get("level", "Developing")),
                dimensions=CategoryDimensions(
                    breadth=int(dims_data.get("breadth", 0)),
                    depth=int(dims_data.get("depth", 0)),
                    recency=int(dims_data.get("recency", 0)),
                    application=int(dims_data.get("application", 0)),
                    corroboration=int(dims_data.get("corroboration", 0)),
                ),
                skills=cat_skills,
            ))

        avg_score = int(sum(c.score for c in categories) / max(1, len(categories))) if categories else 65

        return SkillProfile(
            readiness_score=min(95, max(25, avg_score)),
            score_version=2,
            scoring_model="v2-5dim",
            categories=categories,
            skills=all_skills,
            gap_analysis=[
                GapItem(
                    name="System Observability & Load Testing",
                    category="Backend Engineering",
                    delta="Moderate Delta",
                    priority="P1 PRIORITY",
                    recommendation="Integrate structured logging and conduct load testing benchmarks on your API services.",
                    evidenceRefs=["project:tech:express", "project:tech:mongodb"]
                )
            ],
            source_contributions=source_contributions,
        )
