import json
import re
from pydantic import BaseModel
from typing import List, Optional, Any
from llm_manager import llm_manager

class SubTask(BaseModel):
    id: str
    text: str
    completed: bool = False

class Milestone(BaseModel):
    id: str
    title: str
    desc: str
    tags: List[str] = []
    status: str = "locked"   # "completed" | "in-progress" | "locked"
    progress: int = 0
    subtasks: List[SubTask] = []

class Roadmap(BaseModel):
    milestones: List[Milestone]
    readiness: int = 0

def _extract_json(text: str) -> str:
    """Extract JSON from LLM output, handling markdown fences and partial output."""
    text = text.strip()

    # Strip markdown fences
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    # Try to find JSON object boundaries
    start = text.find('{')
    if start == -1:
        raise ValueError("No JSON object found in response")

    # Find the matching closing brace, handling nesting
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
        # JSON was truncated — try to close it
        partial = text[start:]
        # Count open braces/brackets to determine what to close
        open_braces = partial.count('{') - partial.count('}')
        open_brackets = partial.count('[') - partial.count(']')
        # Strip trailing comma if present
        partial = partial.rstrip().rstrip(',')
        # Close any open arrays first, then objects
        partial += ']' * max(0, open_brackets) + '}' * max(0, open_braces)
        return partial

    return text[start:end]

async def generate_roadmap(target_roles: List[str], skill_profile: dict, gaps: str) -> Roadmap:
    """Generates a learning roadmap based on target roles and current skill gaps."""

    # Keep the prompt concise to avoid token limits on free tier
    roles_str = ", ".join(target_roles[:3])
    gaps_str = gaps[:300] if gaps else "No specific gaps identified"

    prompt = f"""Generate a career roadmap for: {roles_str}
Current gaps: {gaps_str}

Return ONLY valid JSON (no markdown, no explanation):
{{
    "readiness": 35,
    "milestones": [
        {{
            "id": "m1",
            "title": "Master Data Structures",
            "desc": "Build core algorithmic skills",
            "tags": ["LeetCode", "Algorithms"],
            "status": "in-progress",
            "progress": 40,
            "subtasks": [
                {{"id": "s1", "text": "Solve 50 easy problems", "completed": true}},
                {{"id": "s2", "text": "Complete Blind 75", "completed": false}}
            ]
        }},
        {{
            "id": "m2",
            "title": "System Design Basics",
            "desc": "Learn scalable system design",
            "tags": ["Architecture", "Databases"],
            "status": "locked",
            "progress": 0,
            "subtasks": [
                {{"id": "s3", "text": "Read DDIA book", "completed": false}},
                {{"id": "s4", "text": "Design 3 systems", "completed": false}}
            ]
        }}
    ]
}}

Generate 4-5 milestones with 2-3 subtasks each. First milestone "in-progress", rest "locked".
Set readiness 0-100 based on profile. Return ONLY the JSON."""

    result = await llm_manager.invoke(task="roadmap_gen", prompt=prompt)

    try:
        json_str = _extract_json(result)
        data = json.loads(json_str)

        # Ensure types are correct before Pydantic validation
        if 'readiness' in data:
            data['readiness'] = int(float(str(data['readiness'])))

        milestones = data.get('milestones', [])
        clean_milestones = []
        for i, m in enumerate(milestones):
            clean_subtasks = []
            for j, s in enumerate(m.get('subtasks', [])):
                clean_subtasks.append({
                    'id': str(s.get('id', f's{i+1}_{j+1}')),
                    'text': str(s.get('text', '')),
                    'completed': bool(s.get('completed', False)),
                })
            clean_milestones.append({
                'id': str(m.get('id', f'm{i+1}')),
                'title': str(m.get('title', 'Untitled')),
                'desc': str(m.get('desc', m.get('description', ''))),
                'tags': [str(t) for t in m.get('tags', [])],
                'status': str(m.get('status', 'locked')),
                'progress': int(float(str(m.get('progress', 0)))),
                'subtasks': clean_subtasks,
            })

        return Roadmap(milestones=clean_milestones, readiness=data.get('readiness', 0))

    except Exception as e:
        raise ValueError(f"Failed to parse roadmap: {e}\nOutput: {result[:300]}")
