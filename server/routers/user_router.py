from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database import get_db
from server import models, schemas
from server.dependencies import get_current_user_from_cookie

router = APIRouter(prefix="/api/me", tags=["users"])

@router.get("", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user_from_cookie)):
    return current_user
