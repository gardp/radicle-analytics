from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum, Text, UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from platforms import Platform
from .base import Base, TimestampMixin
import uuid
from datetime import datetime

class Instruction(Base, TimestampMixin): #can be for both parameters and content
    __tablename__ = 'instructions'
    
    instruction_id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    instructions = Column(String)
    goals = Column(String)
    is_active = Column(Boolean)
    notes = Column(String)
    
    # Define relationships
    frequency_id = Column(UUID(as_uuid=True), ForeignKey("frequencies.frequency_id"))
    frequency = relationship("Frequency", back_populates="instructions") #how often the instruction is used- one to one relationship
    platform_id = Column(UUID(as_uuid=True), ForeignKey("platforms.platform_id"))
    platform = relationship("Platform", back_populates="platform_general_instructions") #which platform the instruction belongs to

    # self-referential relationship for dependency
    dependency_instruction_id = Column(UUID(as_uuid=True), ForeignKey("instructions.instruction_id"))
    dependency_instruction = relationship(
        "Instruction", 
        back_populates="dependency_instruction",
        remote_side=[instruction_id]
        ) #which instruction this instruction depends on
    
    # create the frequency table
    class Frequency(Base):
        __tablename__ = 'frequencies'
        
        frequency_id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
        name = Column(String, unique=True, index=True)
        description = Column(String)
        frequency_unit = Column(String) # e.g., hours, days, weeks, months, years
        frequency_value = Column(Integer) # e.g., 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
        time_period = Column(Enum("definite", "indefinite")) # e.g., definite vs indefinite: for how long the instruction is valid
        start_date = Column(DateTime) # when the instruction becomes active
        end_date = Column(DateTime) # when the instruction becomes inactive
        frequency_type = Column(Enum("recurring", "one-time")) # e.g., recurring vs one-time: how often the instruction is used
        is_active = Column(Boolean)
        notes = Column(String)
        
        # Define relationships
        instructions = relationship("Instruction", back_populates="frequency")
