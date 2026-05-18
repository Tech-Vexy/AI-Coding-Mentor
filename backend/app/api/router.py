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
    credentials for the frontend to connect to the WS Proxy.
    """
    # For proxy connection, we don't return the Gemini Key.
    # We just return a success payload. The proxy endpoint will handle the key.
    return {
        "status": "authorized",
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
