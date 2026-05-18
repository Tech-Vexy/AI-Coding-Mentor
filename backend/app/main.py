from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.router import router as auth_router
from app.api.router import router as api_router
from app.api.ws_proxy import router as ws_proxy_router
from app.auth.config import settings

app = FastAPI(title="Ada AI Tutor Backend")

origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(api_router, prefix="/api", tags=["API"])
app.include_router(ws_proxy_router, prefix="/api", tags=["WebSockets"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
