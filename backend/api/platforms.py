"""CRUD router for Platforms (polymorphic)."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_db, verify_token
from models.platform import Platform
from schemas.platform import PlatformCreate, PlatformUpdate, PlatformResponse

router = APIRouter(prefix="/api/platforms", tags=["platforms"], dependencies=[Depends(verify_token)])


# GET /api/platforms - Retrieve all platforms with optional filtering
# Query Parameters:
#   - type (string, optional): Filter platforms by polymorphic type
# Returns: List of PlatformResponse objects ordered alphabetically by name
# Use Case: List available platforms for configuration, assignment, and filtering in forms
# Note: Platforms are polymorphic; type determines platform-specific behavior and metadata
@router.get("", response_model=List[PlatformResponse])
async def list_platforms(
    type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Platform).order_by(Platform.name)
    if type:
        stmt = stmt.where(Platform.type == type)
    result = await db.execute(stmt)
    return result.scalars().all()


# GET /api/platforms/{platform_id} - Retrieve a specific platform by its unique ID
# Path Parameters:
#   - platform_id (UUID): Unique identifier of the platform to retrieve
# Returns: Single PlatformResponse object
# Error: 404 if platform not found
# Use Case: View detailed platform settings before editing or linking to content/instructions
@router.get("/{platform_id}", response_model=PlatformResponse)
async def get_platform(platform_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Platform).where(Platform.platform_id == platform_id))
    platform = result.scalar_one_or_none()
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    return platform


# POST /api/platforms - Create a new platform
# Request Body: PlatformCreate schema with platform configuration fields
#   - type (string, required): Platform polymorphic type/category
#   - name (string, typically required by schema): Display name for the platform
#   - Additional fields may vary by platform type
# Returns: Created PlatformResponse object with generated platform_id
# Status Code: 201 Created
# Use Case: Add new platform definitions for use in instruction/content/royalty workflows
@router.post("", response_model=PlatformResponse, status_code=status.HTTP_201_CREATED)
async def create_platform(body: PlatformCreate, db: AsyncSession = Depends(get_db)):
    platform = Platform(**body.model_dump(exclude_unset=True))
    db.add(platform)
    await db.flush()
    return platform


# PUT /api/platforms/{platform_id} - Update an existing platform
# Path Parameters:
#   - platform_id (UUID): Unique identifier of the platform to update
# Request Body: PlatformUpdate schema with fields to update (all optional)
#   - name/type and other platform attributes depending on schema/model
# Returns: Updated PlatformResponse object
# Error: 404 if platform not found
# Use Case: Edit platform configuration, rename platforms, or update type-specific metadata
@router.put("/{platform_id}", response_model=PlatformResponse)
async def update_platform(platform_id: UUID, body: PlatformUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Platform).where(Platform.platform_id == platform_id))
    platform = result.scalar_one_or_none()
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(platform, field, value)
    await db.flush()
    return platform


# DELETE /api/platforms/{platform_id} - Remove a platform from the system
# Path Parameters:
#   - platform_id (UUID): Unique identifier of the platform to delete
# Returns: No content (empty response)
# Status Code: 204 No Content
# Error: 404 if platform not found
# Use Case: Remove deprecated/unused platforms and keep platform registry clean
# Note: This is a hard delete; verify no dependent records require this platform
@router.delete("/{platform_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_platform(platform_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Platform).where(Platform.platform_id == platform_id))
    platform = result.scalar_one_or_none()
    if not platform:
        raise HTTPException(status_code=404, detail="Platform not found")
    await db.delete(platform)
    await db.flush()
