from pydantic import BaseModel, EmailStr

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ChatRequest(BaseModel):
    message: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    class Config:
        orm_mode = True
