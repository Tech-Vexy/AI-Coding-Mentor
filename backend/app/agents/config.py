import os
from pydantic_settings import BaseSettings

class AgentSettings(BaseSettings):
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "mock_gemini_key")
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    MODEL_NAME: str = "gemini-1.5-pro-latest"

agent_settings = AgentSettings()
