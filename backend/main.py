import os
import cohere
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load API key from .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

if not COHERE_API_KEY:
    raise ValueError("⚠️ COHERE_API_KEY not found. Please check your .env file.")

# Initialize Cohere client
co = cohere.Client(COHERE_API_KEY)

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_with_cohere(request: ChatRequest):
    try:
        user_message = request.message.lower().strip()

        # Predefined responses for identity-related questions
        identity_keywords = [
            "who are you",
            "your name",
            "what is your name",
            "are you a chatbot",
            "are you ai",
            "what can you do",
            "developer name",
            "who created you",
            "about you"
        ]

        if any(keyword in user_message for keyword in identity_keywords):
            reply = "I am ChatoraAI 🤖, an intelligent chatbot developed by Sewak."
            return {"reply": reply}

        # Use Cohere's Chat API for normal queries
        response = co.chat(
            model="command-r",
            message=f"You are ChatoraAI, an AI chatbot created by Sewak. Respond politely.\nUser: {request.message}"
        )

        # Extract reply from response
        reply = response.text.strip()
        return {"reply": reply}

    except Exception as e:
        return {"error": str(e)}

# main.py
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from . import models
# from .database import engine
# from .auth import router as auth_router
# from .chat import router as chat_router

# models.Base.metadata.create_all(bind=engine)

# app = FastAPI(title="ChatoraAI API")

# # Configure CORS - in production set allowed origins specifically
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # change for production
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app.include_router(auth_router)
# app.include_router(chat_router)

# @app.get("/")
# def root():
#     return {"message": "ChatoraAI API is running"}
