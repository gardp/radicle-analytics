"""Authentication endpoint — simple password-based login."""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from core.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])

    # Request schema for authentication endpoint
    # Fields:
    #   - password (string, required): Application password for authentication
    # Use Case: Submit credentials to obtain access token
class LoginRequest(BaseModel):
    password: str

    # Response schema for successful authentication
    # Fields:
    #   - token (string, required): JWT/static token for API access
    # Use Case: Receive token to include in Authorization header for subsequent requests
class LoginResponse(BaseModel):
    token: str

# POST /api/auth/login - Authenticate user and return access token
# Request Body: LoginRequest schema
#   - password (string, required): Application password configured in APP_PASSWORD environment variable
# Returns: LoginResponse object containing access token
#   - token (string): Static token from APP_TOKEN_SECRET environment variable
# Error: 401 Unauthorized if password doesn't match APP_PASSWORD
# Use Case: Obtain authentication token for API access
# Security: Simple password-based authentication suitable for internal applications
# Note: Token is static (not JWT) and should be included in Authorization: Bearer header
@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest):
    if body.password != settings.APP_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password",
        )
    return LoginResponse(token=settings.APP_TOKEN_SECRET)
