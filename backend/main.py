import os
import cohere
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import Optional

from database import engine, SessionLocal
from models import *
from auth import hash_password, verify_password, create_token, get_current_user

# Create tables
Base.metadata.create_all(bind=engine)

# Ensure profile_image column exists for existing DB
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN profile_image TEXT"))
        conn.commit()
    except Exception:
        # Column already exists or not needed
        pass

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Load API key from .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
COHERE_API_KEY = os.getenv("COHERE_API_KEY")

if not COHERE_API_KEY:
    raise ValueError("⚠️ COHERE_API_KEY not found. Please check your .env file.")

# Initialize Cohere client
co = cohere.ClientV2(COHERE_API_KEY) 

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_with_cohere(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
):
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
            model="command-r-08-2024",
            messages=[
                {"role": "system", "content": "You are ChatoraAI, created by Sewak. Respond politely."},
                {"role": "user", "content": request.message}
            ]
        )

        reply = response.message.content[0].text
        return {"reply": reply}

    except Exception as e:
        return {"error": str(e)}


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

@app.post("/signup")
def signup(request: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        username=request.username,
        email=request.email,
        password=hash_password(request.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User created successfully"}

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    try:
        if not verify_password(request.password, user.password):
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    try:
        token = create_token({"user_id": user.id})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Token generation failed")

    return {"access_token": token}

@app.post("/logout")
def logout():
    return {"message": "Logged out successfully"}


class ProfileImageRequest(BaseModel):
    profile_image: str


class ProfileUpdateRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str


@app.post("/profile/image")
def update_profile_image(
    body: ProfileImageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.profile_image = body.profile_image
    db.commit()
    db.refresh(user)

    return {"profile_image": user.profile_image}


@app.put("/profile/update")
def update_profile(
    body: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if body.username:
        user.username = body.username.strip()

    if body.email:
        body_email = body.email.strip().lower()
        check = db.query(User).filter(User.email == body_email, User.id != user.id).first()
        if check:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = body_email

    db.commit()
    db.refresh(user)

    return {
        "username": user.username,
        "email": user.email
    }


@app.post("/profile/password")
def change_password(
    body: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(body.old_password, user.password):
        raise HTTPException(status_code=401, detail="Old password is incorrect")

    if body.new_password != body.confirm_password:
        raise HTTPException(status_code=400, detail="New password and confirm password do not match")

    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    user.password = hash_password(body.new_password)
    db.commit()
    db.refresh(user)

    return {"message": "Password updated successfully"}


@app.get("/profile")
def profile(current_user: User = Depends(get_current_user)):
    created_at = getattr(current_user, "created_at", None)
    if created_at is not None:
        created_at = created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at)

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "created_at": created_at,
        "status": "Active",
        "profile_image": current_user.profile_image
    }
