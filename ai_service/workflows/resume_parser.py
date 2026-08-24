import json
from pydantic import BaseModel
from typing import List
from llm_manager import llm_manager

class Experience(BaseModel):
    title: str
    company: str
    duration: str
    highlights: List[str]

class ResumeAnalysis(BaseModel):
    skills: List[str]
    experience: List[Experience]
    education: List[str]
    certifications: List[str]

async def parse_resume(raw_text: str) -> ResumeAnalysis:
    """Parses raw resume text into structured JSON."""
    prompt = f"""
    Parse the following resume text and extract the skills, experience, education, and certifications.
    Return ONLY a valid JSON object with the following structure:
    {{
        "skills": ["skill1", "skill2"],
        "experience": [
            {{
                "title": "Job Title",
                "company": "Company Name",
                "duration": "Time Period",
                "highlights": ["responsibility 1", "achievement 2"]
            }}
        ],
        "education": ["Degree from University"],
        "certifications": ["Cert 1"]
    }}
    
    Resume Text:
    {raw_text}
    """
    
    result = await llm_manager.invoke(task="resume_parsing", prompt=prompt)
    
    # Strip markdown block formatting if present
    if result.startswith("```json"):
        result = result[7:-3].strip()
    elif result.startswith("```"):
        result = result[3:-3].strip()
        
    try:
        data = json.loads(result)
        return ResumeAnalysis(**data)
    except Exception as e:
        raise ValueError(f"Failed to parse LLM output: {e}\\nOutput was: {result}")
