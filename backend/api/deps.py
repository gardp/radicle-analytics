"""Shared FastAPI dependencies: DB session and auth verification."""
# This module provides common dependency functions used across all API routers
# Dependencies handle database session management and token-based authentication
# These are injected into route handlers using FastAPI's dependency injection system

from fastapi import Depends, Header, HTTPException, status

from core.config import settings
from core.database import get_db  # noqa: F401


# Authentication dependency for protecting API endpoints
# Validates Bearer token from Authorization header against static secret
# Used as dependency in router definitions to enforce authentication
# Returns: Validated token string on successful authentication
# Error: 401 Unauthorized if token is missing, malformed, or invalid
# Use Case: Protect all API endpoints except login to ensure only authenticated access
# Note: Simple token validation suitable for internal applications
async def verify_token(authorization: str = Header(...)):
    """Validate the Bearer token against the static secret."""
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or token != settings.APP_TOKEN_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token",
        )
    return token
