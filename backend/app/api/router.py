from fastapi import APIRouter, Depends, HTTPException, status, Header
from app.auth.utils import decode_access_token
from typing import Optional
import os

router = APIRouter()

def get_current_user(authorization: Optional[str] = Header(None)):
    """Dependency to extract and verify the custom JWT session token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ")[1]
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

@router.get("/live-token")
def get_live_token(user: dict = Depends(get_current_user)):
    """
    Validates the user's GitLab session via JWT and returns the necessary
    credentials/token for the frontend to connect directly to the Gemini Live API.

    In a real-world Google Cloud environment for the v1alpha Gemini Live API,
    this would typically return a short-lived OAuth 2.0 access token generated
    from a service account, or simply provide the API key if operating in a
    pure API key environment. We return the key/token here securely.
    """

    # For Hackathon purposes with an API key
    gemini_key = os.getenv("GEMINI_API_KEY", "mock_gemini_key")

    return {
        "gemini_token": gemini_key,
        "model": "models/gemini-2.0-flash-exp", # Recommended model for Multimodal Live API
        "user_context": user
    }
