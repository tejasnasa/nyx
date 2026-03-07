from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        orm_mode = True

class MessageCreate(BaseModel):
    content: str
    role: str

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    thread_id: int

    class Config:
        orm_mode = True

class ThreadResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    owner_id: int

    class Config:
        orm_mode = True
