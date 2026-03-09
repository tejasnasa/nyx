from urllib import response

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from server.database import get_db
from server import models, schemas
from server.dependencies import get_current_user_from_cookie
import openai
from server.config import OPENAI_API_KEY, OPENAI_MODEL
from pydantic import BaseModel

router = APIRouter(prefix="/api/threads", tags=["threads"])

class ChatRequest(BaseModel):
    message: str

@router.get("", response_model=list[schemas.ThreadResponse])
def get_threads(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user_from_cookie)):
    return db.query(models.Thread).filter(models.Thread.owner_id == current_user.id).order_by(models.Thread.created_at.desc()).all()

@router.post("", response_model=schemas.ThreadResponse)
def create_thread(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user_from_cookie)):
    new_thread = models.Thread(owner_id=current_user.id)
    db.add(new_thread)
    db.commit()
    db.refresh(new_thread)
    return new_thread

@router.get("/{thread_id}/messages", response_model=list[schemas.MessageResponse])
def get_messages(thread_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user_from_cookie)):
    thread = db.query(models.Thread).filter(models.Thread.id == thread_id, models.Thread.owner_id == current_user.id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    return db.query(models.Message).filter(models.Message.thread_id == thread_id).order_by(models.Message.created_at.asc()).all()

@router.post("/{thread_id}/chat")
def chat(thread_id: int, request: ChatRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user_from_cookie)):
    thread = db.query(models.Thread).filter(models.Thread.id == thread_id, models.Thread.owner_id == current_user.id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    user_messages_count = db.query(models.Message).filter(models.Message.thread_id == thread_id, models.Message.role == "user").count()
    if user_messages_count >= 10:
        raise HTTPException(status_code=400, detail="Thread has reached the maximum of 10 replies.")
    
    user_msg = models.Message(thread_id=thread_id, role="user", content=request.message)
    db.add(user_msg)
    db.commit()

    history = db.query(models.Message).filter(models.Message.thread_id == thread_id).order_by(models.Message.created_at.asc()).all()
    messages_payload = [{"role": "system", "content": "You are Nyx, a helpful AI assistant. Format replies using markdown."}]
    for msg in history:
        messages_payload.append({"role": msg.role, "content": msg.content})

    try:
        # Use a dummy response if OPENAI_API_KEY is fake or not set properly for testing
        if OPENAI_API_KEY in ["test-key-or-mock", "your_openai_api_key_here"] or OPENAI_API_KEY.startswith("test-"):
            prior_count = len(history) - 1  # exclude the just-added user message
            context_summary = f" ({prior_count} previous message(s) in context)" if prior_count > 0 else " (no prior context)"
            ai_content = f"Hello! This is a **mock response** from Nyx (model: `{OPENAI_MODEL}`).{context_summary}\n\nSince the API key is `{OPENAI_API_KEY}`, I am generating this fake Markdown output to test the UI.\n\n```python\nprint('Testing fake responses!')\n```\n\nYou asked: {request.message}"
        else:
            client = openai.OpenAI(api_key=OPENAI_API_KEY)
            response = client.responses.create(
                model="gpt-5-nano",
                input=messages_payload,
                max_output_tokens=500,
                reasoning={"effort": "low"}
            )
            print("OpenAI API response:", response.usage)

            print(response.output_text)
            ai_content = response.output_text
    except Exception as e:
        ai_content = f"Error calling OpenAI API (model: {OPENAI_MODEL}): {str(e)}\n\n(Because API failed)"

    ai_msg = models.Message(thread_id=thread_id, role="assistant", content=ai_content)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    if user_messages_count == 0:
        thread.title = request.message[:30] + "..." if len(request.message) > 30 else request.message
        db.commit()

    return {"reply": ai_content, "message_id": ai_msg.id}
