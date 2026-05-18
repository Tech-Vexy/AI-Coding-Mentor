from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel
from app.auth.utils import decode_access_token
from app.agents.rag_agent import query_curriculum
from app.agents.sandbox_agent import lint_code, execute_code
from typing import Optional, Dict, Any
import os

router = APIRouter()

def get_current_user(authorization: Optional[str] = Header(None)):
    """Dependency to extract and verify the custom JWT session token"""

    # In a full production application, this would strictly decode the token.
    # For this hackathon scope (which did not include building out a Next.js login
    # form in Phase 1 or 2), we will accept a "mock_dev_token" to allow the Live API
    # connection flow to work for demonstration purposes, while leaving the
    # structure in place for real JWT validation.

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split(" ")[1]

    if token == "mock_dev_token":
        return {"sub": "hackathon_demo", "email": "demo@ada.test"}

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
    credentials for the frontend to connect.

    CRITICAL SECURITY NOTE:
    For Gemini AI Studio (`generativelanguage.googleapis.com`), connecting from a browser
    strictly requires passing the API Key. Passing a raw API key to the client is insecure
    as it can be scraped and abused. In a production environment, you MUST set up a backend
    WebSocket proxy or migrate to Vertex AI which supports short-lived OAuth tokens restricted
    to specific endpoints. For hackathon demonstration purposes on AI Studio, we proxy the key.
    """

    gemini_key = os.getenv("GEMINI_API_KEY", "mock_gemini_key")

    return {
        "gemini_token": gemini_key,
        "model": "models/gemini-2.0-flash-exp",
        "user_context": user
    }

class ToolCallRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]

@router.post("/tools/execute")
def execute_tool(request: ToolCallRequest, user: dict = Depends(get_current_user)):
    """
    Executes a tool requested by the Gemini Live API and returns the result.
    """
    tool_name = request.tool_name
    args = request.arguments

    try:
        tool_func = None
        if tool_name == "query_curriculum":
            tool_func = query_curriculum
        elif tool_name == "lint_code":
            tool_func = lint_code
        elif tool_name == "execute_code":
            tool_func = execute_code
        else:
            raise HTTPException(status_code=400, detail=f"Unknown tool: {tool_name}")

        result = None
        if hasattr(tool_func, 'func'):
            result = tool_func.func(**args)
        else:
            result = tool_func(**args)

        return {"result": result}
    except Exception as e:
        return {"error": str(e)}
