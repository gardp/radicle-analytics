"""CRUD router for SuccessMetrics."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_db, verify_token
from models.content import SuccessMetrics
from schemas.content import SuccessMetricsCreate, SuccessMetricsUpdate, SuccessMetricsResponse

router = APIRouter(prefix="/api/success-metrics", tags=["success-metrics"], dependencies=[Depends(verify_token)])


# GET /api/success-metrics - Retrieve all success metrics with optional filtering
# Query Parameters:
#   - content_id (UUID, optional): Filter metrics by associated content record
# Returns: List of SuccessMetricsResponse objects
# Use Case: Analyze outcome KPIs across content or inspect metrics for a specific content item
# Note: Success metrics are typically post-performance indicators tied to content lifecycle
@router.get("", response_model=List[SuccessMetricsResponse])
async def list_success_metrics(
    content_id: Optional[UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(SuccessMetrics)
    if content_id:
        stmt = stmt.where(SuccessMetrics.content_id == content_id)
    result = await db.execute(stmt)
    return result.scalars().all()


# GET /api/success-metrics/{metrics_id} - Retrieve a specific success metrics record
# Path Parameters:
#   - metrics_id (UUID): Unique identifier of the success metrics record
# Returns: Single SuccessMetricsResponse object
# Error: 404 if metrics record is not found
# Use Case: Inspect detailed KPIs and outcomes for one content performance record
@router.get("/{metrics_id}", response_model=SuccessMetricsResponse)
async def get_success_metrics(metrics_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SuccessMetrics).where(SuccessMetrics.success_metrics_id == metrics_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="SuccessMetrics not found")
    return item


# POST /api/success-metrics - Create a new success metrics record
# Request Body: SuccessMetricsCreate schema with outcome/performance fields
#   - Typically includes KPI values and optional content association
# Returns: Created SuccessMetricsResponse object with generated success_metrics_id
# Status Code: 201 Created
# Use Case: Store measured outcomes after a campaign/content execution cycle
@router.post("", response_model=SuccessMetricsResponse, status_code=status.HTTP_201_CREATED)
async def create_success_metrics(body: SuccessMetricsCreate, db: AsyncSession = Depends(get_db)):
    item = SuccessMetrics(**body.model_dump(exclude_unset=True))
    db.add(item)
    await db.flush()
    return item


# PUT /api/success-metrics/{metrics_id} - Update an existing success metrics record
# Path Parameters:
#   - metrics_id (UUID): Unique identifier of the record to update
# Request Body: SuccessMetricsUpdate schema with fields to update (all optional)
# Returns: Updated SuccessMetricsResponse object
# Error: 404 if metrics record is not found
# Use Case: Correct KPI values, refine measurements, or add late-arriving result data
@router.put("/{metrics_id}", response_model=SuccessMetricsResponse)
async def update_success_metrics(metrics_id: UUID, body: SuccessMetricsUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SuccessMetrics).where(SuccessMetrics.success_metrics_id == metrics_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="SuccessMetrics not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    await db.flush()
    return item


# DELETE /api/success-metrics/{metrics_id} - Remove a success metrics record
# Path Parameters:
#   - metrics_id (UUID): Unique identifier of the record to delete
# Returns: No content (empty response)
# Status Code: 204 No Content
# Error: 404 if metrics record is not found
# Use Case: Remove invalid/test KPI records during data cleanup
# Note: This is a hard delete and permanently removes the metrics entry
@router.delete("/{metrics_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_success_metrics(metrics_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SuccessMetrics).where(SuccessMetrics.success_metrics_id == metrics_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="SuccessMetrics not found")
    await db.delete(item)
    await db.flush()
