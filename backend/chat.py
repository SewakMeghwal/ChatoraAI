# chat.py
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from .utils import get_current_user_optional, get_db
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os
import cohere

load_dotenv()
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
if not COHERE_API_KEY:
    raise RuntimeError("COHERE_API_KEY not set in environment")

co = cohere.Client(COHERE_API_KEY)

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatIn(BaseModel):
    message: str

IDENTITY_KEYWORDS = [
    "who are you", "your name", "what is your name",
    "are you a chatbot", "are you ai", "what can you do",
    "developer", "who created you", "about you"
]

@router.post("/", summary="Chat with ChatoraAI")
def chat_endpoint(payload: ChatIn, request: Request, db: Session = Depends(get_db), user = Depends(get_current_user_optional)):
    # quick identity reply
    msg_lower = payload.message.lower().strip()
    if any(k in msg_lower for k in IDENTITY_KEYWORDS):
        return {"reply": "I am ChatoraAI 🤖, an intelligent chatbot developed by Sewak."}

    # Compose system/prompt injection
    system_prompt = "You are ChatoraAI, an AI chatbot created by Sewak. Be polite, concise, and helpful."
    user_text = payload.message

    # Optionally use user info for personalization
    if user:
        system_prompt += f" The user is {user.username} (id {user.id})."

    try:
        # call Cohere chat
        response = co.chat(
            model="command-r",
            message=f"{system_prompt}\nUser: {user_text}"
        )
        reply = response.text.strip()
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
