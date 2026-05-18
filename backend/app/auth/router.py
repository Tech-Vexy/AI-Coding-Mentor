from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import RedirectResponse
import httpx
import urllib.parse
import secrets
from datetime import timedelta
from .config import settings
from .utils import create_access_token

router = APIRouter()

@router.get("/login")
async def login(response: Response):
    # Generate a random state for CSRF protection
    state = secrets.token_urlsafe(32)

    params = {
        "client_id": settings.GITLAB_CLIENT_ID,
        "redirect_uri": settings.GITLAB_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid profile email",
        "state": state
    }
    url = f"{settings.GITLAB_ISSUER}/oauth/authorize?{urllib.parse.urlencode(params)}"

    redirect_response = RedirectResponse(url)
    # Set the state in an HttpOnly cookie to verify it in the callback
    redirect_response.set_cookie(
        key="oauth_state",
        value=state,
        httponly=True,
        max_age=600, # 10 minutes
        secure=False, # Set to True in production with HTTPS
        samesite="lax"
    )
    return redirect_response

@router.get("/callback")
async def auth_callback(request: Request, code: str, state: str = None):
    # Verify the state parameter against the cookie to prevent CSRF
    cookie_state = request.cookies.get("oauth_state")
    if not cookie_state or cookie_state != state:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid state parameter")

    # Trade the authorization code for an access token from GitLab
    token_url = f"{settings.GITLAB_ISSUER}/oauth/token"
    data = {
        "client_id": settings.GITLAB_CLIENT_ID,
        "client_secret": settings.GITLAB_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.GITLAB_REDIRECT_URI,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)
        if response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to retrieve token from GitLab")

        token_data = response.json()
        access_token = token_data.get("access_token")

        # Optionally, get user info
        user_info_url = f"{settings.GITLAB_ISSUER}/oauth/userinfo"
        headers = {"Authorization": f"Bearer {access_token}"}
        user_response = await client.get(user_info_url, headers=headers)

        if user_response.status_code != 200:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to retrieve user info")

        user_info = user_response.json()

    # Create our own short-lived JWT for the session
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    session_token = create_access_token(
        data={"sub": user_info.get("sub"), "email": user_info.get("email"), "name": user_info.get("name")},
        expires_delta=access_token_expires
    )

    # In a real application, you might redirect to the frontend with the token,
    # e.g., redirect to frontend URL with token in query param or set as a secure cookie
    return {"session_token": session_token, "user": user_info}
