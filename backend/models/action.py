from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum, Text
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
import uuid
from enum import Enum


class ActionStatus(str, Enum(name="ActionStatus")):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

#creating an Action joint table that joins content and instruction for each action taken
class Action(Base, TimestampMixin):
    __tablename__ = 'action'
    
    action_id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    status = Column(Enum(ActionStatus))
    next_action_due_date = Column(DateTime)
    action_is_active = Column(Boolean)
    action_notes = Column(String)
    feedback = Column(Text)
    
    # Define relationships for content and instruction
    content_id = Column(UUID, ForeignKey("content.content_id"))
    instruction_id = Column(Integer, ForeignKey("instruction.instruction_id"))
    content = relationship("Content", back_populates="action")
    instruction = relationship("Instruction", back_populates="action")

    # Define relationship for dependency action
    # FIXED: Self-referential relationship needs remote_side
    dependency_action_id = Column(Integer, ForeignKey("action.action_id"))
    dependency_action = relationship(
        "Action", 
        backref="dependent_actions", 
        remote_side=[action_id]
    )