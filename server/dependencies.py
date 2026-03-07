from fastapi import Request, Depends, HTTPException, status
def get_token_from_cookie(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        print("DEBUG: No access_token found in cookies")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    print(f"DEBUG: Found token in cookie: {token[:10]}...")
    return token

# Proper dependency injection:
from sqlalchemy.orm import Session
from server.database import get_db

def _get_current_user_from_cookie(token: str = Depends(get_token_from_cookie), db: Session = Depends(get_db)):
    from server.auth import get_current_user
    try:
        user = get_current_user(token, db)
        print(f"DEBUG: Successfully authenticated user: {user.email}")
        return user
    except Exception as e:
        print(f"DEBUG: Authentication failed for token: {e}")
        raise e

get_current_user_from_cookie = _get_current_user_from_cookie
