"""CRUD router for Content (polymorphic)."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_db, verify_token
from models.content import Content
from schemas.content import ContentCreate, ContentUpdate, ContentResponse

router = APIRouter(prefix="/api/content", tags=["content"], dependencies=[Depends(verify_token)])


# GET /api/content - Retrieve all content with optional filtering
# Query Parameters:
#   - track_id (UUID, optional): Filter content by associated track ID
#   - type (string, optional): Filter content by type (polymorphic content types)
# Returns: List of ContentResponse objects ordered by creation date (newest first)
# Use Case: Get all content, filter by track, or filter by content type for dashboard views
# Note: Content is polymorphic - type determines the specific content structure
@router.get("", response_model=List[ContentResponse])
async def list_content(
    track_id: Optional[UUID] = Query(None),
    type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Content).order_by(Content.created_at.desc())
    if track_id:
        stmt = stmt.where(Content.track_id == track_id)
    if type:
        stmt = stmt.where(Content.type == type)
    result = await db.execute(stmt)
    return result.scalars().all()


# GET /api/content/{content_id} - Retrieve specific content by its unique ID
# Path Parameters:
#   - content_id (UUID): Unique identifier of the content to retrieve
# Returns: Single ContentResponse object with polymorphic data
# Error: 404 if content not found
# Use Case: View detailed information about specific content item
# Note: Response structure varies based on content type due to polymorphism
@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(content_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Content).where(Content.content_id == content_id))
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content


# POST /api/content - Create new content (polymorphic)
# Request Body: ContentCreate schema with content details
#   - track_id (UUID, optional): Associated track this content belongs to
#   - type (string, required): Content type determining polymorphic structure
#   - Additional fields vary by content type (polymorphic nature)
# Returns: Created ContentResponse object with generated content_id
# Status Code: 201 Created
# Use Case: Add new content items to tracks, create various content types
# Note: Content structure and validation depend on the specified type
@router.post("", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
async def create_content(body: ContentCreate, db: AsyncSession = Depends(get_db)):
    content = Content(**body.model_dump(exclude_unset=True))
    db.add(content)
    await db.flush()
    return content


# PUT /api/content/{content_id} - Update existing content (polymorphic)
# Path Parameters:
#   - content_id (UUID): Unique identifier of the content to update
# Request Body: ContentUpdate schema with fields to update (all optional)
#   - track_id (UUID, optional): Change associated track
#   - type (string, optional): Change content type (affects structure)
#   - Additional fields vary by content type
# Returns: Updated ContentResponse object
# Error: 404 if content not found
# Use Case: Modify content details, change track association, update type-specific fields
# Note: Updates respect polymorphic structure based on current content type
@router.put("/{content_id}", response_model=ContentResponse)
async def update_content(content_id: UUID, body: ContentUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Content).where(Content.content_id == content_id))
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(content, field, value)
    await db.flush()
    return content


# DELETE /api/content/{content_id} - Remove content from the system
# Path Parameters:
#   - content_id (UUID): Unique identifier of the content to delete
# Returns: No content (empty response)
# Status Code: 204 No Content
# Error: 404 if content not found
# Use Case: Remove outdated content, clean up track data, maintain data integrity
# Note: This is a hard delete - the content record is permanently removed
# Warning: Deleting content may affect related actions and analytics
@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(content_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Content).where(Content.content_id == content_id))
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    await db.delete(content)
    await db.flush()
