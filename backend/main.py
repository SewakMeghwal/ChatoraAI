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
        # Use Cohere's new Chat API instead of Generate API
        response = co.chat(
            model="command-r",  # Use `command-r` or `command-r-plus`
            message=request.message
        )

        # Extract reply from response
        reply = response.text.strip()
        return {"reply": reply}

    except Exception as e:
        return {"error": str(e)}
