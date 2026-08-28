import json
import re
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from llm_manager import llm_manager

class Milestone(BaseModel):
    id: str
    title: str
    type: str = "Core Skill"  # "Foundation" | "Core Skill" | "Advanced Skill" | "Practical Application" | "Project"
    description: str = ""
    whyItMatters: str = ""
    skills: List[str] = []
    evidenceState: str = "partial"  # "strong" | "partial" | "missing"
    gapLevel: str = "medium"  # "low" | "medium" | "high"
    estimatedHours: int = 12
    prerequisites: List[str] = []
    sequenceIndex: int = 1
    outcome: str = ""
    suggestedProject: Optional[str] = None
    evidenceRefs: List[str] = []

class Summary(BaseModel):
    title: str
    description: str
    primaryFocus: List[str] = []
    currentEvidenceLevel: str = "Moderate"

class Roadmap(BaseModel):
    targetRoles: List[str]
    summary: Summary
    weeklyHours: int = 10
    estimatedTotalHours: int = 0
    estimatedTotalWeeks: int = 0
    milestones: List[Milestone]
    generatedAt: Optional[str] = None

def _extract_json(text: str) -> str:
    """Extract JSON from LLM output, handling markdown fences and partial output."""
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
        raise ValueError("No JSON object found in response")

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

async def generate_roadmap(target_roles: List[str], skill_profile: dict, gaps: str, user_context: Optional[dict] = None) -> Roadmap:
    """Generates a personalized career roadmap based on target roles, verified telemetry evidence, and gap analysis."""

    roles_str = ", ".join(target_roles[:4])
    context_data = user_context or {}
    metrics = context_data.get("metrics", {})
    weekly_hours = int(context_data.get("weeklyHours", 10))

    prompt = f"""You are CareerOS Personalized Roadmap Generator v2.
Generate a tailored competency dependency roadmap for target career direction: [{roles_str}].

CORE ARCHITECTURE RULES:
1. START FROM VERIFIED USER EVIDENCE:
   - Verified telemetry metrics: {json.dumps(metrics)}
   - Active skill profile & gaps: {json.dumps(skill_profile.get('categories', []))}
   - Missing/delta priority areas: {gaps[:300] if gaps else 'None specific'}
2. GAP-BASED PERSONALIZATION:
   - Compare role requirements vs. the user's verified evidence.
   - If user already demonstrates strong evidence in an area (e.g. basic Git, basic JavaScript), REDUCE or SKIP foundational tutorials for it.
   - Focus on meaningful gaps, advanced patterns, and practical capability stages.
   - If multiple roles are selected (e.g. Backend + DevOps), synthesize shared foundations and branch into role specializations without duplicate milestones.
3. DEPENDENCY GRAPH (PREREQUISITES):
   - Every milestone can declare 'prerequisites' containing IDs of prior milestones that logically precede it.
   - Dependencies are informative recommendations, NOT blocking locks.
   - No circular dependencies or self-dependencies.
4. REALISTIC EFFORT ESTIMATION:
   - Provide estimatedHours for each milestone (typically 6-25 hours per milestone).
5. MILESTONE TYPES:
   - 'Foundation', 'Core Skill', 'Advanced Skill', 'Practical Application', 'Project'
6. NO CHECKLISTS / NO SUBTASKS:
   - Focus on competency outcomes, why it matters, and tangible capabilities.

Return ONLY a valid JSON object matching this schema (no markdown, no extra text):
{{
    "targetRoles": {json.dumps(target_roles)},
    "summary": {{
        "title": "Personalized Roadmap for {roles_str}",
        "description": "A focused dependency path tailored to your verified telemetry and skill gaps.",
        "primaryFocus": ["API Reliability", "Container Orchestration", "Distributed Systems"],
        "currentEvidenceLevel": "Moderate Evidence"
    }},
    "weeklyHours": {weekly_hours},
    "milestones": [
        {{
            "id": "linux-system-foundations",
            "title": "Linux & Production Environment Fundamentals",
            "type": "Foundation",
            "description": "Deepen system process management, networking sockets, and shell automation for server environments.",
            "whyItMatters": "Core infrastructure baseline for high-throughput backend services and cloud deployments.",
            "skills": ["Linux", "Shell Scripting", "POSIX"],
            "evidenceState": "partial",
            "gapLevel": "medium",
            "estimatedHours": 10,
            "prerequisites": [],
            "outcome": "Ability to diagnose live system processes, manage permissions, and automate server diagnostics.",
            "suggestedProject": null,
            "evidenceRefs": ["github:lang:shell"]
        }},
        {{
            "id": "docker-containerization",
            "title": "Containerization & Multi-Stage Builds",
            "type": "Core Skill",
            "description": "Containerize microservices with Docker, multi-stage optimized images, and network isolation.",
            "whyItMatters": "Standard container standard for reproducible development and cloud orchestration.",
            "skills": ["Docker", "Containers", "DevOps"],
            "evidenceState": "missing",
            "gapLevel": "high",
            "estimatedHours": 14,
            "prerequisites": ["linux-system-foundations"],
            "outcome": "Produce minimal, hardened multi-stage Docker images with compose orchestration.",
            "suggestedProject": null,
            "evidenceRefs": []
        }},
        {{
            "id": "production-infrastructure-project",
            "title": "Production Microservice & Infrastructure Showcase",
            "type": "Project",
            "description": "Build and deploy an end-to-end multi-tier application with automated CI/CD and metrics.",
            "whyItMatters": "Tangible proof of cross-domain engineering competence for prospective employers.",
            "skills": ["Full-Stack", "CI/CD", "Docker", "REST API"],
            "evidenceState": "missing",
            "gapLevel": "high",
            "estimatedHours": 20,
            "prerequisites": ["docker-containerization"],
            "outcome": "A live deployed project demonstrating production hygiene and observability.",
            "suggestedProject": "Containerized high-concurrency event ingestion service with automated deployment pipeline.",
            "evidenceRefs": []
        }}
    ]
}}"""

    result = await llm_manager.invoke(task="roadmap_gen", prompt=prompt)

    try:
        json_str = _extract_json(result)
        data = json.loads(json_str)

        # Sanitize summary
        raw_summary = data.get('summary', {})
        summary_obj = Summary(
            title=str(raw_summary.get('title', f"Roadmap for {roles_str}")),
            description=str(raw_summary.get('description', "Personalized milestone path based on verified telemetry.")),
            primaryFocus=[str(f) for f in raw_summary.get('primaryFocus', [])],
            currentEvidenceLevel=str(raw_summary.get('currentEvidenceLevel', 'Moderate Evidence')),
        )

        # Sanitize milestones
        milestones = data.get('milestones', [])
        clean_milestones = []
        for i, m in enumerate(milestones):
            m_id = str(m.get('id', f"milestone_{i+1}")).lower().replace(' ', '-')
            raw_hours = m.get('estimatedHours', 12)
            try:
                est_hours = max(4, min(40, int(float(str(raw_hours)))))
            except Exception:
                est_hours = 12

            clean_milestones.append(Milestone(
                id=m_id,
                title=str(m.get('title', f"Milestone {i+1}")),
                type=str(m.get('type', 'Core Skill')),
                description=str(m.get('description', '')),
                whyItMatters=str(m.get('whyItMatters', '')),
                skills=[str(s) for s in (m.get('skills') or [])],
                evidenceState=str(m.get('evidenceState', 'partial')),
                gapLevel=str(m.get('gapLevel', 'medium')),
                estimatedHours=est_hours,
                prerequisites=[str(p).lower().replace(' ', '-') for p in (m.get('prerequisites') or [])],
                sequenceIndex=i + 1,
                outcome=str(m.get('outcome', '')),
                suggestedProject=m.get('suggestedProject'),
                evidenceRefs=[str(r) for r in (m.get('evidenceRefs') or [])],
            ))

        # Backend arithmetic for total effort
        total_hours = sum(m.estimatedHours for m in clean_milestones)
        total_weeks = max(1, (total_hours + weekly_hours - 1) // max(1, weekly_hours))

        return Roadmap(
            targetRoles=target_roles,
            summary=summary_obj,
            weeklyHours=weekly_hours,
            estimatedTotalHours=total_hours,
            estimatedTotalWeeks=total_weeks,
            milestones=clean_milestones,
            generatedAt=data.get('generatedAt'),
        )

    except Exception as e:
        raise ValueError(f"Failed to parse roadmap output: {e}\nOutput was: {result[:300]}")
