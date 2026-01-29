from fastapi import APIRouter
from pydantic import BaseModel
from app.services.llm_chain import chat_with_agent

router = APIRouter(tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    response_text = chat_with_agent(request.message, request.session_id)
    return {"response": response_text}