from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.analyze import router as analyze_router
from app.api.approval import router as approval_router
from app.api.health import router as health_router
from app.api.incidents import router as incidents_router

app = FastAPI(
    title="AIOps Agentic AI",
    version="1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)
app.include_router(approval_router)
app.include_router(health_router)
app.include_router(incidents_router)