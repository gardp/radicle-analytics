"""Generic CRUD router for all Signal / Insight tables."""

from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_db, verify_token
from models import signals as signal_models
from schemas import signals as signal_schemas

router = APIRouter(prefix="/api/signals", tags=["signals"], dependencies=[Depends(verify_token)])

# Registry mapping signal_type slug to route metadata.
# Each entry defines:
#   - model: SQLAlchemy model to query/insert/update/delete
#   - create: Pydantic schema used to validate create payloads
#   - update: Pydantic schema used to validate update payloads
#   - response: Pydantic schema used to shape API responses
#   - pk: primary key column name for item-level lookup
#
# This central registry allows one generic CRUD implementation to serve many
# signal/insight tables while preserving per-type validation and response shape.
SIGNAL_REGISTRY: Dict[str, Dict[str, Any]] = {
    "instagram-profile-insights": {
        "model": signal_models.InstagramProfileInsights,
        "create": signal_schemas.InstagramProfileInsightsCreate,
        "update": signal_schemas.InstagramProfileInsightsUpdate,
        "response": signal_schemas.InstagramProfileInsightsResponse,
        "pk": "insight_id",
    },
    "instagram-media-insights": {
        "model": signal_models.InstagramMediaInsights,
        "create": signal_schemas.InstagramMediaInsightsCreate,
        "update": signal_schemas.InstagramMediaInsightsUpdate,
        "response": signal_schemas.InstagramMediaInsightsResponse,
        "pk": "insight_id",
    },
    "instagram-hashtags": {
        "model": signal_models.InstagramHashtags,
        "create": signal_schemas.InstagramHashtagsCreate,
        "update": signal_schemas.InstagramHashtagsUpdate,
        "response": signal_schemas.InstagramHashtagsResponse,
        "pk": "insight_id",
    },
    "tiktok-profile-insights": {
        "model": signal_models.TiktokProfileInsight,
        "create": signal_schemas.TiktokProfileInsightCreate,
        "update": signal_schemas.TiktokProfileInsightUpdate,
        "response": signal_schemas.TiktokProfileInsightResponse,
        "pk": "insight_id",
    },
    "tiktok-media-insights": {
        "model": signal_models.TiktokMediaInsights,
        "create": signal_schemas.TiktokMediaInsightsCreate,
        "update": signal_schemas.TiktokMediaInsightsUpdate,
        "response": signal_schemas.TiktokMediaInsightsResponse,
        "pk": "insight_id",
    },
    "twitter-x-content-insights": {
        "model": signal_models.TwitterXContentInsights,
        "create": signal_schemas.TwitterXContentInsightsCreate,
        "update": signal_schemas.TwitterXContentInsightsUpdate,
        "response": signal_schemas.TwitterXContentInsightsResponse,
        "pk": "insight_id",
    },
    "twitter-x-public-metrics": {
        "model": signal_models.TwitterXPublicMetrics,
        "create": signal_schemas.TwitterXPublicMetricsCreate,
        "update": signal_schemas.TwitterXPublicMetricsUpdate,
        "response": signal_schemas.TwitterXPublicMetricsResponse,
        "pk": "insight_id",
    },
    "twitter-x-user-metrics": {
        "model": signal_models.TwitterXUserMetrics,
        "create": signal_schemas.TwitterXUserMetricsCreate,
        "update": signal_schemas.TwitterXUserMetricsUpdate,
        "response": signal_schemas.TwitterXUserMetricsResponse,
        "pk": "insight_id",
    },
    "twitter-x-mentions": {
        "model": signal_models.TwitterXMentions,
        "create": signal_schemas.TwitterXMentionsCreate,
        "update": signal_schemas.TwitterXMentionsUpdate,
        "response": signal_schemas.TwitterXMentionsResponse,
        "pk": "insight_id",
    },
    "youtube-channel-reports": {
        "model": signal_models.YoutubeChannelReport,
        "create": signal_schemas.YoutubeChannelReportCreate,
        "update": signal_schemas.YoutubeChannelReportUpdate,
        "response": signal_schemas.YoutubeChannelReportResponse,
        "pk": "report_id",
    },
    "youtube-content-reports": {
        "model": signal_models.YoutubeContentReport,
        "create": signal_schemas.YoutubeContentReportCreate,
        "update": signal_schemas.YoutubeContentReportUpdate,
        "response": signal_schemas.YoutubeContentReportResponse,
        "pk": "report_id",
    },
}


# Internal helper that resolves and validates a signal type slug.
# Returns registry entry metadata used by all generic CRUD handlers.
# Error: 404 if signal_type is not registered/supported.
def _get_entry(signal_type: str):
    entry = SIGNAL_REGISTRY.get(signal_type)
    if not entry:
        raise HTTPException(status_code=404, detail=f"Unknown signal type: {signal_type}")
    return entry


# GET /api/signals/{signal_type} - List records for a specific signal type
# Path Parameters:
#   - signal_type (string): Registry slug (e.g. instagram-profile-insights)
# Query Parameters:
#   - track_id (UUID, optional): Filter by associated track
#   - platform_id (UUID, optional): Filter by associated platform
# Returns: List of response objects for the selected signal type
# Use Case: Power dashboards and admin views with type-specific signal datasets
# Note: Response model is dynamic and derived from SIGNAL_REGISTRY entry
@router.get("/{signal_type}", response_model=List[Any])
async def list_signals(
    signal_type: str,
    track_id: Optional[UUID] = Query(None),
    platform_id: Optional[UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    entry = _get_entry(signal_type)
    Model = entry["model"]
    stmt = select(Model).order_by(Model.created_at.desc())
    if track_id:
        stmt = stmt.where(Model.track_id == track_id)
    if platform_id:
        stmt = stmt.where(Model.platform_id == platform_id)
    result = await db.execute(stmt)
    items = result.scalars().all()
    ResponseSchema = entry["response"]
    return [ResponseSchema.model_validate(i).model_dump() for i in items]


# GET /api/signals/{signal_type}/{item_id} - Retrieve a specific signal record
# Path Parameters:
#   - signal_type (string): Registry slug for target signal table
#   - item_id (UUID): Primary key value of the target record
# Returns: Single response object for the selected signal type
# Error: 404 if signal type is unknown or record is not found
# Use Case: Drill-down view of one signal/insight record
@router.get("/{signal_type}/{item_id}")
async def get_signal(signal_type: str, item_id: UUID, db: AsyncSession = Depends(get_db)):
    entry = _get_entry(signal_type)
    Model = entry["model"]
    pk_col = getattr(Model, entry["pk"])
    result = await db.execute(select(Model).where(pk_col == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Signal not found")
    return entry["response"].model_validate(item).model_dump()


# POST /api/signals/{signal_type} - Create a new signal record
# Path Parameters:
#   - signal_type (string): Registry slug for target signal table
# Request Body: Dynamic dict validated by the type-specific Create schema
# Returns: Created signal record serialized with type-specific Response schema
# Status Code: 201 Created
# Error: 404 for unknown signal type; 422 for validation errors
# Use Case: Ingest new analytics events/insights from external or internal pipelines
@router.post("/{signal_type}", status_code=status.HTTP_201_CREATED)
async def create_signal(signal_type: str, body: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    entry = _get_entry(signal_type)
    Model = entry["model"]
    CreateSchema = entry["create"]
    validated = CreateSchema(**body)
    item = Model(**validated.model_dump(exclude_unset=True))
    db.add(item)
    await db.flush()
    return entry["response"].model_validate(item).model_dump()


# PUT /api/signals/{signal_type}/{item_id} - Update an existing signal record
# Path Parameters:
#   - signal_type (string): Registry slug for target signal table
#   - item_id (UUID): Primary key value of the target record
# Request Body: Dynamic dict validated by the type-specific Update schema
# Returns: Updated signal record serialized with type-specific Response schema
# Error: 404 if signal type/record not found; 422 for validation errors
# Use Case: Correct imported metrics, enrich records, or reconcile backfilled data
@router.put("/{signal_type}/{item_id}")
async def update_signal(signal_type: str, item_id: UUID, body: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    entry = _get_entry(signal_type)
    Model = entry["model"]
    UpdateSchema = entry["update"]
    pk_col = getattr(Model, entry["pk"])
    result = await db.execute(select(Model).where(pk_col == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Signal not found")
    validated = UpdateSchema(**body)
    for field, value in validated.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.flush()
    return entry["response"].model_validate(item).model_dump()


# DELETE /api/signals/{signal_type}/{item_id} - Remove a signal record
# Path Parameters:
#   - signal_type (string): Registry slug for target signal table
#   - item_id (UUID): Primary key value of the record to delete
# Returns: No content (empty response)
# Status Code: 204 No Content
# Error: 404 if signal type is unknown or record not found
# Use Case: Remove invalid, duplicate, or test insight entries
# Note: Hard delete; record is permanently removed from the selected signal table
@router.delete("/{signal_type}/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_signal(signal_type: str, item_id: UUID, db: AsyncSession = Depends(get_db)):
    entry = _get_entry(signal_type)
    Model = entry["model"]
    pk_col = getattr(Model, entry["pk"])
    result = await db.execute(select(Model).where(pk_col == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Signal not found")
    await db.delete(item)
    await db.flush()
