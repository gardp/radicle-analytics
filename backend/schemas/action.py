"""Pydantic schemas for Action."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from .base import TimestampMixin
from .enums import ActionStatus


# ===================================================================
# Action
# ===================================================================

class ActionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: Optional[ActionStatus] = ActionStatus.PENDING
    next_action_due_date: Optional[datetime] = None
    action_is_active: Optional[bool] = True
    action_notes: Optional[str] = ""
    feedback: Optional[str] = ""
    track_id: UUID
    instruction_id: UUID
    content_id: Optional[UUID] = None
    dependency_action_id: Optional[UUID] = None


class ActionCreate(ActionBase):
    pass


class ActionUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: Optional[ActionStatus] = None
    next_action_due_date: Optional[datetime] = None
    action_is_active: Optional[bool] = None
    action_notes: Optional[str] = None
    feedback: Optional[str] = None
    track_id: Optional[UUID] = None
    instruction_id: Optional[UUID] = None
    content_id: Optional[UUID] = None
    dependency_action_id: Optional[UUID] = None


class ActionResponse(ActionBase, TimestampMixin):
    action_id: UUID
