import json
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from llm_manager import llm_manager

class ChatMessage(BaseModel):
    role: str
    content: str

class MentorResponse(BaseModel):
    response: str

async def chat_with_mentor(chat_history: List[Dict[str, str]], user_context: dict) -> MentorResponse:
    """Generates a rich, contextual response from the AI mentor based on tagged roadmap and skills data."""
    
    # Normalize chat history
    history_lines = []
    for msg in chat_history:
        role = msg.get('role') or msg.get('sender', 'user')
        speaker = "Developer" if role == "user" else "AI Mentor"
        text = msg.get('content') or msg.get('text', '')
        history_lines.append(f"{speaker}: {text}")
    
    history_str = "\n".join(history_lines)
    
    target_roles = user_context.get('target_roles', [])
    skill_profile = user_context.get('skill_profile', {})
    roadmap = user_context.get('roadmap', {})
    projects = user_context.get('projects', [])
    tagged_context = user_context.get('tagged_context', {})
    coach_mode = user_context.get('coach_mode', 'general')
    user_name = user_context.get('name', 'Developer')
    readiness_score = user_context.get('readinessScore') or skill_profile.get('readinessScore') or 50

    # Extract key verified skills & gaps
    skills_list = [s.get('name') for s in (skill_profile.get('skills', []) or [])[:15]]
    gaps_list = [g.get('name') for g in (skill_profile.get('gapAnalysis', []) or skill_profile.get('gap_analysis', []) or [])]
    categories_list = [f"{c.get('name')}: {c.get('score', 0)}%" for c in (skill_profile.get('categories', []) or [])]
    milestones_list = [f"Milestone {m.get('milestoneNumber', i+1)}: {m.get('title')}" for i, m in enumerate(roadmap.get('milestones', []) or [])]
    projects_list = [p.get('title') for p in (projects or [])]

    # Tagged context section
    tagged_block = ""
    if tagged_context:
        tagged_block = f"""
=== ACTIVE TAGGED CONTEXT ATTACHED BY USER ===
{json.dumps(tagged_context, indent=2)}
"""

    prompt = f"""You are the CareerOS AI Career Mentor, an exceptional principal engineer, career strategist, and empathetic technical coach.
Your mission is to guide software developers to reach top-tier engineering roles through structured milestones, skill mastery, and strategic project architecture.

=== DEVELOPER PROFILE & CREDENTIALS ===
- Name: {user_name}
- Target Career Roles: {target_roles if target_roles else 'Full-Stack Software Engineer'}
- Verified Readiness Score: {readiness_score}%
- Verified Top Skills: {', '.join(skills_list) if skills_list else 'In progress'}
- Category Competencies: {', '.join(categories_list) if categories_list else 'In progress'}
- Identified Skill Gaps: {', '.join(gaps_list) if gaps_list else 'None specified'}
- Active Career Roadmap: {', '.join(milestones_list) if milestones_list else 'In progress'}
- Showcase Projects: {', '.join(projects_list) if projects_list else 'None'}
- Coaching Mode: {coach_mode}
{tagged_block}

=== CONVERSATION LOG ===
{history_str}

=== INSTRUCTIONS FOR YOUR MENTORSHIP RESPONSE ===
1. Tone: Senior Staff Engineer / Director of Engineering — clear, encouraging, technically sharp, and actionable.
2. Directly reference the user's specific tagged roadmap milestones, verified skills, or identified gaps when relevant to their question.
3. Structure your response with clean Markdown:
   - Use bold headers or subheadings for clear breakdown.
   - Use bullet points and checklists for actionable next steps.
   - Provide concrete code, architecture patterns, or study milestones when applicable.
4. Give high-leverage advice: focus on what genuinely moves the needle in interviews, promotions, and production systems.
5. Conclude with 1-2 concrete, high-impact action items the developer can do next.
"""
    
    result = await llm_manager.invoke(task="mentor_chat", prompt=prompt)
    
    return MentorResponse(response=result)
