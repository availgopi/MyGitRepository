from fastapi import FastAPI
from app.api.documents import router as documents_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="IDP-AI",
    description="Intelligent Document Processing",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents_router)

@app.get("/")
def root():
    return {
        "application": "IDP-AI",
        "message": "Intelligent Document Processing API is running",
        "version": "0.1.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "idp-ai-backend",
    }