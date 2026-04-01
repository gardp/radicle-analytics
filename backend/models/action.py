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
    
    # Every Action belongs to a Track (NOT NULL)
    track_id = Column(UUID, ForeignKey("track.track_id"), nullable=True)
    track = relationship("Track", back_populates="actions")

    # Every Action must originate from an Instruction (NOT NULL)
    instruction_id = Column(UUID, ForeignKey("instructions.instruction_id"), nullable=False)
    instruction = relationship("Instruction", back_populates="actions")

    # Content is optional — an Action may or may not involve a specific content piece
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