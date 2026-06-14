"""CRUD router for Actions."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_db, verify_token
from models.action import Action
from schemas.action import ActionCreate, ActionUpdate, ActionResponse

router = APIRouter(prefix="/api/actions", tags=["actions"], dependencies=[Depends(verify_token)])

# GET /api/actions - Retrieve all actions with optional filtering
# Query Parameters:
#   - content_id (UUID, optional): Filter actions by associated content ID
#   - status (string, optional): Filter actions by status ("pending", "in_progress", "completed", "failed")
# Returns: List of ActionResponse objects ordered by creation date (newest first)
# Use Case: Get all actions, filter by content, or filter by status for dashboard views
@router.get("", response_model=List[ActionResponse])
async def list_actions(
    track_id: Optional[UUID] = Query(None),
    instruction_id: Optional[UUID] = Query(None),
    content_id: Optional[UUID] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    # track_is_null — when true, return ONLY actions whose track_id IS NULL.
    # This is the canonical filter used by the General Parameters → "General
    # Actions" tab to fetch track-agnostic actions. It is mutually exclusive
    # with the `track_id` filter (track_id wins if both are supplied).
    track_is_null: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Action).order_by(Action.created_at.desc())
    if track_id:
        stmt = stmt.where(Action.track_id == track_id)
    elif track_is_null:
        # IS NULL filter for "General Actions" — actions not bound to any track.
        stmt = stmt.where(Action.track_id.is_(None))
    if instruction_id:
        stmt = stmt.where(Action.instruction_id == instruction_id)
    if content_id:
        stmt = stmt.where(Action.content_id == content_id)
    if status_filter:
        stmt = stmt.where(Action.status == status_filter)
    result = await db.execute(stmt)
    return result.scalars().all()

# GET /api/actions/{action_id} - Retrieve a specific action by its unique ID
# Path Parameters:
#   - action_id (UUID): Unique identifier of the action to retrieve
# Returns: Single ActionResponse object
# Error: 404 if action not found
# Use Case: View detailed information about a specific action
@router.get("/{action_id}", response_model=ActionResponse)
async def get_action(action_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Action).where(Action.action_id == action_id))
    action = result.scalar_one_or_none()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    return action


# POST /api/actions - Create a new action
# Request Body: ActionCreate schema with action details
#   - status (ActionStatus, optional): Current status (defaults to "pending")
#   - next_action_due_date (datetime, optional): When this action should be completed
#   - action_is_active (boolean, optional): Whether action is active (defaults to True)
#   - action_notes (string, optional): Free-form notes about the action
#   - feedback (string, optional): Feedback or results from action execution
#   - content_id (UUID, optional): Associated content this action relates to
#   - dependency_action_id (UUID, optional): Parent action this depends on
# Returns: Created ActionResponse object with generated action_id
# Status Code: 201 Created
# Use Case: Add new actions to the system, link to content or create action chains
@router.post("", response_model=ActionResponse, status_code=status.HTTP_201_CREATED)
async def create_action(body: ActionCreate, db: AsyncSession = Depends(get_db)):
    action = Action(**body.model_dump(exclude_unset=True))
    db.add(action)
    await db.flush()
    return action


# PUT /api/actions/{action_id} - Update an existing action
# Path Parameters:
#   - action_id (UUID): Unique identifier of the action to update
# Request Body: ActionUpdate schema with fields to update (all optional)
#   - status (ActionStatus, optional): Update action status
#   - next_action_due_date (datetime, optional): Update due date
#   - action_is_active (boolean, optional): Activate/deactivate action
#   - action_notes (string, optional): Update notes
#   - feedback (string, optional): Add or update feedback
#   - content_id (UUID, optional): Change associated content
#   - dependency_action_id (UUID, optional): Change dependency relationship
# Returns: Updated ActionResponse object
# Error: 404 if action not found
# Use Case: Progress action through lifecycle, add feedback, modify relationships
@router.put("/{action_id}", response_model=ActionResponse)
async def update_action(action_id: UUID, body: ActionUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Action).where(Action.action_id == action_id))
    action = result.scalar_one_or_none()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(action, field, value)
    await db.flush()
    return action


# DELETE /api/actions/{action_id} - Remove an action from the system
# Path Parameters:
#   - action_id (UUID): Unique identifier of the action to delete
# Returns: No content (empty response)
# Status Code: 204 No Content
# Error: 404 if action not found
# Use Case: Remove cancelled actions, clean up completed actions, maintain data integrity
# Note: This is a hard delete - the action record is permanently removed
@router.delete("/{action_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_action(action_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Action).where(Action.action_id == action_id))
    action = result.scalar_one_or_none()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    await db.delete(action)
    await db.flush()
