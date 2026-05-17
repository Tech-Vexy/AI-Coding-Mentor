import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GITLAB_CLIENT_ID: str = os.getenv("GITLAB_CLIENT_ID", "your_client_id")
    GITLAB_CLIENT_SECRET: str = os.getenv("GITLAB_CLIENT_SECRET", "your_client_secret")
    GITLAB_REDIRECT_URI: str = os.getenv("GITLAB_REDIRECT_URI", "http://localhost:8000/auth/callback")
    GITLAB_ISSUER: str = os.getenv("GITLAB_ISSUER", "https://gitlab.com")

    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "super_secret_jwt_key")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

settings = Settings()
