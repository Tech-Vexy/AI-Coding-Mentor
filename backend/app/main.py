from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.router import router as auth_router
from app.api.router import router as api_router

app = FastAPI(title="Ada AI Tutor Backend")

# Allow frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Restrict to frontend origin so allow_credentials can be True
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(api_router, prefix="/api", tags=["API"])

@app.get("/health")
def health_check():
    return {"status": "ok"}
