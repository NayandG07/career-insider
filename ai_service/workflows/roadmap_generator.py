import json
from pydantic import BaseModel
from typing import List
from llm_manager import llm_manager

class SubTask(BaseModel):
    task: str
    status: str = "pending"

class Milestone(BaseModel):
    title: str
    description: str
    subtasks: List[SubTask]
    
class Roadmap(BaseModel):
    milestones: List[Milestone]

async def generate_roadmap(target_roles: List[str], skill_profile: dict, gaps: str) -> Roadmap:
    """Generates a learning roadmap based on target roles and current skill gaps."""
    prompt = f"""
    Generate a detailed learning roadmap for someone targeting these roles: {target_roles}.
    Current skill profile: {json.dumps(skill_profile)}
    Identified gaps: {gaps}
    
    Return ONLY a valid JSON object with the following structure:
    {{
        "milestones": [
            {{
                "title": "Learn System Design",
                "description": "Understand distributed systems",
                "subtasks": [
                    {{"task": "Read DDIA", "status": "pending"}}
                ]
            }}
        ]
    }}
    """
    
    result = await llm_manager.invoke(task="roadmap_generation", prompt=prompt)
    
    if result.startswith("```json"):
        result = result[7:-3].strip()
    elif result.startswith("```"):
        result = result[3:-3].strip()
        
    try:
        data = json.loads(result)
        return Roadmap(**data)
    except Exception as e:
        raise ValueError(f"Failed to parse LLM output: {e}\\nOutput was: {result}")
