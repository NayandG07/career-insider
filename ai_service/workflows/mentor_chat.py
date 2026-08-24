from pydantic import BaseModel
from typing import List, Dict
from llm_manager import llm_manager

class ChatMessage(BaseModel):
    role: str
    content: str

class MentorResponse(BaseModel):
    response: str

async def chat_with_mentor(chat_history: List[Dict[str, str]], user_context: dict) -> MentorResponse:
    """Generates a contextual response from the AI mentor."""
    
    history_str = "\\n".join([f"{msg['role']}: {msg['content']}" for msg in chat_history])
    
    prompt = f"""
    You are an expert career mentor for software engineers.
    
    User Context:
    Target Roles: {user_context.get('target_roles', [])}
    Skill Profile: {user_context.get('skill_profile', {{}})}
    Gaps: {user_context.get('gaps', '')}
    
    Chat History:
    {history_str}
    
    Generate a helpful, concise, and actionable response to the last message from the user.
    """
    
    result = await llm_manager.invoke(task="mentor_chat", prompt=prompt)
    
    return MentorResponse(response=result)
