"""CRUD router for Tracks + ecosystem endpoint."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api.deps import get_db, verify_token
from models.content import Track, Content, SuccessMetrics
from models.instruction import Instruction
from models.action import Action
from models.royalties import Royalty, RoyaltyTransaction
from schemas.content import TrackCreate, TrackUpdate, TrackResponse

router = APIRouter(prefix="/api/tracks", tags=["tracks"], dependencies=[Depends(verify_token)])


# GET /api/tracks - Retrieve all tracks with optional client-side search filtering
# Query Parameters:
#   - search (string, optional): Case-insensitive keyword to match track title, genres, key, or tags
# Returns: List of TrackResponse objects ordered by creation date (newest first)
# Use Case: Track library listing, quick discovery, and search in dashboard tables/cards
# Note: Search filtering is applied in Python after fetching ordered records from DB
@router.get("", response_model=List[TrackResponse])
async def list_tracks(
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Track).order_by(Track.created_at.desc())
    result = await db.execute(stmt)
    tracks = result.scalars().all()
    if search:
        search_lower = search.lower()
        tracks = [
            t for t in tracks
            if (t.track_title and search_lower in t.track_title.lower())
            or (t.genres and any(search_lower in g.lower() for g in t.genres))
            or (t.key and search_lower in t.key.lower())
            or (t.keyword_tags and any(search_lower in k.lower() for k in t.keyword_tags))
        ]
    return tracks


# GET /api/tracks/{track_id} - Retrieve a specific track by its unique ID
# Path Parameters:
#   - track_id (UUID): Unique identifier of the track to retrieve
# Returns: Single TrackResponse object
# Error: 404 if track not found
# Use Case: Open track detail pages and prefill track edit forms
@router.get("/{track_id}", response_model=TrackResponse)
async def get_track(track_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Track).where(Track.track_id == track_id))
    track = result.scalar_one_or_none()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    return track


# POST /api/tracks - Create a new track and clone template instructions/frequencies
# Request Body: TrackCreate schema with track metadata and creative attributes
# Returns: Created TrackResponse object with generated track_id
# Status Code: 201 Created
# Use Case: Onboard a new track and bootstrap its execution plan from global templates
# Note: Automatically clones instructions where Instruction.track_id IS NULL and their frequencies
@router.post("", response_model=TrackResponse, status_code=status.HTTP_201_CREATED)
async def create_track(body: TrackCreate, db: AsyncSession = Depends(get_db)):
    track = Track(**body.model_dump(exclude_unset=True))
    db.add(track)
    await db.flush()
    return track


# PUT /api/tracks/{track_id} - Update an existing track
# Path Parameters:
#   - track_id (UUID): Unique identifier of the track to update
# Request Body: TrackUpdate schema with fields to update (all optional)
# Returns: Updated TrackResponse object
# Error: 404 if track not found
# Use Case: Revise track metadata, tags, genres, and operational settings
@router.put("/{track_id}", response_model=TrackResponse)
async def update_track(track_id: UUID, body: TrackUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Track).where(Track.track_id == track_id))
    track = result.scalar_one_or_none()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(track, field, value)
    await db.flush()
    return track


# DELETE /api/tracks/{track_id} - Remove a track and manually cascade related entities
# Path Parameters:
#   - track_id (UUID): Unique identifier of the track to delete
# Returns: No content (empty response)
# Status Code: 204 No Content
# Error: 404 if track not found
# Use Case: Remove archived/test tracks and clean all dependent ecosystem records
# Note: Performs manual cascade deletion for content/actions/metrics, instructions/frequencies,
#       royalties/transactions before deleting the track record
@router.delete("/{track_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_track(track_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Track).where(Track.track_id == track_id))
    track = result.scalar_one_or_none()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")

    # Cascade delete related entities
    # 1. Delete actions directly by track_id
    await db.execute(delete(Action).where(Action.track_id == track_id))

    # 2. Delete content, success metrics
    content_ids_stmt = select(Content.content_id).where(Content.track_id == track_id)
    content_ids = (await db.execute(content_ids_stmt)).scalars().all()
    if content_ids:
        await db.execute(delete(SuccessMetrics).where(SuccessMetrics.content_id.in_(content_ids)))
        await db.execute(delete(Content).where(Content.track_id == track_id))

    # Delete royalty transactions then royalties
    roy_ids_stmt = select(Royalty.royalty_id).where(Royalty.track_id == track_id)
    roy_ids = (await db.execute(roy_ids_stmt)).scalars().all()
    if roy_ids:
        await db.execute(delete(RoyaltyTransaction).where(RoyaltyTransaction.royalty_id.in_(roy_ids)))
    await db.execute(delete(Royalty).where(Royalty.track_id == track_id))

    await db.delete(track)
    await db.flush()


# GET /api/tracks/{track_id}/ecosystem - Retrieve full nested ecosystem snapshot for a track
# Path Parameters:
#   - track_id (UUID): Unique identifier of the track
# Returns: Composite object containing serialized track ecosystem data:
#   - track, platforms, instructions, contents, actions, success_metrics, royalties
# Error: 404 if track not found
# Use Case: Power a single consolidated Track Ecosystem view in the frontend
# Note: Aggregates data across multiple tables and serializes each section explicitly
@router.get("/{track_id}/ecosystem")
async def get_ecosystem(track_id: UUID, db: AsyncSession = Depends(get_db)):
    """Return the full nested ecosystem for a track."""
    result = await db.execute(select(Track).where(Track.track_id == track_id))
    track = result.scalar_one_or_none()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")

    # All global template instructions (no track_id on Instruction anymore)
    instr_result = await db.execute(select(Instruction))
    instructions = instr_result.scalars().all()

    # Unique platform IDs from instructions
    platform_ids = list({i.platform_id for i in instructions if i.platform_id})
    from models.platform import Platform
    platforms = []
    if platform_ids:
        plat_result = await db.execute(select(Platform).where(Platform.platform_id.in_(platform_ids)))
        platforms = plat_result.scalars().all()

    # Contents for this track
    content_result = await db.execute(select(Content).where(Content.track_id == track_id))
    contents = content_result.scalars().all()

    # Actions directly owned by this track
    act_result = await db.execute(select(Action).where(Action.track_id == track_id))
    actions = act_result.scalars().all()

    # Success metrics for this track's content
    content_ids = [c.content_id for c in contents]
    metrics = []
    if content_ids:
        met_result = await db.execute(select(SuccessMetrics).where(SuccessMetrics.content_id.in_(content_ids)))
        metrics = met_result.scalars().all()

    # Royalties for this track
    roy_result = await db.execute(select(Royalty).where(Royalty.track_id == track_id))
    royalties = roy_result.scalars().all()

    # Serialize manually
    from schemas.content import TrackResponse, ContentResponse, SuccessMetricsResponse
    from schemas.platform import PlatformResponse
    from schemas.instruction import InstructionResponse
    from schemas.action import ActionResponse
    from schemas.royalties import RoyaltyResponse

    return {
        "track": TrackResponse.model_validate(track).model_dump(),
        "platforms": [PlatformResponse.model_validate(p).model_dump() for p in platforms],
        "instructions": [InstructionResponse.model_validate(i).model_dump() for i in instructions],
        "contents": [ContentResponse.model_validate(c).model_dump() for c in contents],
        "actions": [ActionResponse.model_validate(a).model_dump() for a in actions],
        "success_metrics": [SuccessMetricsResponse.model_validate(m).model_dump() for m in metrics],
        "royalties": [RoyaltyResponse.model_validate(r).model_dump() for r in royalties],
    }
