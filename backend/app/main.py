from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import api_router
from core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Radicle Analytics API",
    description="API for tracking and analyzing Radicle project metrics",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

# GET / - Health check and API information endpoint
# Returns: Basic API status and identification
# Use Case: Verify API is running, get basic API info
# Response: {"status": "ok", "app": "Radicle Analytics API"}
@app.get("/")
def read_root():
    return {"status": "ok", "app": "Radicle Analytics API"}