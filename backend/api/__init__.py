"""Aggregate all API routers."""
# This module serves as the central API router aggregation point
# It imports and combines all individual module routers into a single api_router
# Each router handles CRUD operations for its respective domain model
# The aggregated router is included in the main FastAPI application

from fastapi import APIRouter

# Import individual module routers
from .auth import router as auth_router          # Authentication and token management
from .tracks import router as tracks_router        # Track management and ecosystem data
from .platforms import router as platforms_router  # Platform configuration and management
from .content import router as content_router      # Content creation and management
from .instructions import router as instructions_router  # Instruction templates and frequency data
from .actions import router as actions_router      # Action execution and tracking
from .royalties import router as royalties_router  # Royalty calculations and transactions
from .success_metrics import router as success_metrics_router  # Success metric definitions
from .signals import router as signals_router      # Signal processing and registry
from .dashboard import router as dashboard_router  # Dashboard analytics and summaries

# Create the main API router that will be included in the FastAPI app
api_router = APIRouter()

# Include all individual routers with their respective prefixes
# Each router is automatically configured with its prefix from its module definition
api_router.include_router(auth_router)          # /api/auth/*
api_router.include_router(tracks_router)        # /api/tracks/*
api_router.include_router(platforms_router)    # /api/platforms/*
api_router.include_router(content_router)      # /api/content/*
api_router.include_router(instructions_router) # /api/instructions/*
api_router.include_router(actions_router)      # /api/actions/*
api_router.include_router(royalties_router)    # /api/royalties/*
api_router.include_router(success_metrics_router) # /api/success_metrics/*
api_router.include_router(signals_router)      # /api/signals/*
api_router.include_router(dashboard_router)    # /api/dashboard/*
