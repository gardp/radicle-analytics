from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum as SAEnum, Text, UUID
from enum import Enum as PyEnum
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
import uuid
from datetime import datetime


class ActionStatus(str, PyEnum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

#creating an Action joint table that joins content and instruction for each action taken
class Action(Base, TimestampMixin):
    __tablename__ = 'action'
    
    action_id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    status = Column(SAEnum(ActionStatus, name='action_status_enum'))
    next_action_due_date = Column(DateTime, default=datetime.utcnow)
    action_is_active = Column(Boolean, default=True)
    action_notes = Column(String, default="")
    feedback = Column(Text, default="")
    
    # Define relationships for content and instruction
    content_id = Column(UUID, ForeignKey("content.content_id"), nullable=True)
    content = relationship("Content", back_populates="actions")

    # Define relationship for dependency action
    # FIXED: Self-referential relationship needs remote_side
    dependency_action_id = Column(UUID, ForeignKey("action.action_id"), nullable=True)
    dependency_action = relationship(
        "Action", 
        backref="dependent_actions", 
        remote_side=[action_id],
    )