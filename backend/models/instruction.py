from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum as SAEnum, Text, UUID, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from enum import Enum as PyEnum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from .platform import Platform
from .base import Base, TimestampMixin
import uuid
from datetime import datetime


class KnowledgeResourceCategory(str, PyEnum):
    BOOK = "book"
    DOCUMENT = "document"
    GUIDE = "guide"
    FRAMEWORK = "framework"
    CASE_STUDY = "case_study"
    OTHER = "other"


class KnowledgeResourceFormat(str, PyEnum):
    PROMPT = "prompt"
    URL = "url"
    TEXT = "text"


class IngestionMethod(str, PyEnum):
    MANUAL = "manual"

class Instruction(Base, TimestampMixin): #can be for both parameters and content
    __tablename__ = 'instructions'
    
    instruction_id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String, nullable=True)
    description = Column(String, nullable=True)
    instructions = Column(Text, nullable=True)
    source = Column(String, nullable=True, comment="Source url of the instruction")
    source_media = Column(String, nullable=True, comment="Source media of the instruction")
    phase = Column(SAEnum("pre", "during", "post", "various", name='phase_enum'), nullable=True)
    goals = Column(String, nullable=True)
    is_active = Column(Boolean, nullable=True, default=True)
    notes = Column(String, nullable=True)
    
    # Define relationships
    platform_id = Column(UUID(as_uuid=True), ForeignKey("platforms.platform_id"), nullable=True)
    platform = relationship("Platform", back_populates="instructions") #which platform the instruction belongs to
    track_id = Column(UUID(as_uuid=True), ForeignKey("track.track_id"), nullable=True)
    track = relationship("Track", back_populates="instructions")

    # self-referential relationship for dependency
    dependency_instruction_id = Column(UUID(as_uuid=True), ForeignKey("instructions.instruction_id"), nullable=True)
    dependency_instruction = relationship(
        "Instruction", 
        backref="dependent_instructions",
        remote_side=[instruction_id],
        ) #which instruction this instruction depends on
    
    # create the frequency table
    class Frequency(Base):
        __tablename__ = 'frequencies'
        
        frequency_id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
        name = Column(String, nullable=True)
        description = Column(String, nullable=True)
        frequency_unit = Column(String, nullable=True) # e.g., hours, days, weeks, months, years
        frequency_value = Column(Integer, nullable=True) # e.g., 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
        time_period = Column(SAEnum("definite", "indefinite", name='time_period_enum'), nullable=True) # e.g., definite vs indefinite: for how long the instruction is valid
        start_date = Column(DateTime, nullable=True) # when the instruction becomes active
        end_date = Column(DateTime, nullable=True) # when the instruction becomes inactive
        frequency_type = Column(SAEnum("recurring", "one-time", name='frequency_type_enum'), nullable=True, default="recurring") # e.g., recurring vs one-time: how often the instruction is used
        is_active = Column(Boolean, nullable=True, default=True)
        notes = Column(String, nullable=True)
        
        # Define relationships
        instruction_id = Column(UUID, ForeignKey("instructions.instruction_id"), nullable=True)
        instruction = relationship("Instruction", back_populates="frequency")
        

class KnowledgeResource(Base, TimestampMixin):
    __tablename__ = "knowledge_resources"
    __table_args__ = (
        UniqueConstraint(
            "workspace_id",
            "canonical_key",
            "version",
            name="uq_knowledge_resource_workspace_key_version",
        ),
    )

    resource_id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    workspace_id = Column(
        UUID,
        nullable=False,
        comment="Workspace scope; future change may convert this to a foreign key.",
    )
    canonical_key = Column(
        String,
        nullable=False,
        comment="Stable identifier used to group immutable versions of the same resource.",
    )
    version = Column(Integer, nullable=False, default=1)
    parent_resource_id = Column(UUID, ForeignKey("knowledge_resources.resource_id"), nullable=True)

    title = Column(String, nullable=False)
    summary = Column(Text, nullable=True)
    category = Column(
        SAEnum(KnowledgeResourceCategory, name="knowledge_resource_category_enum"),
        nullable=False,
        default=KnowledgeResourceCategory.DOCUMENT,
    )
    resource_format = Column(
        SAEnum(KnowledgeResourceFormat, name="knowledge_resource_format_enum"),
        nullable=False,
    )
    ingestion_method = Column(
        SAEnum(IngestionMethod, name="knowledge_resource_ingestion_method_enum"),
        nullable=False,
        default=IngestionMethod.MANUAL,
    )

    source_url = Column(String, nullable=True)
    author = Column(String, nullable=True)
    publisher = Column(String, nullable=True)
    language = Column(String, nullable=True, default="en")
    tags = Column(
        JSONB,
        nullable=False,
        default=list,
        comment="JSON array of tags. Example: [\"seo\", \"retention\", \"positioning\"]",
    )
    raw_text = Column(Text, nullable=True, comment="Canonical text representation for URL/text/prompt resources.")
    retrieval_metadata = Column(JSONB, nullable=True, comment="Flexible metadata for future strategy mapping and retrieval filters.")

    parent_resource = relationship(
        "KnowledgeResource",
        remote_side=[resource_id],
        backref="derived_versions",
    )
    chunks = relationship(
        "KnowledgeResourceChunk",
        back_populates="resource",
        cascade="all, delete-orphan",
    )


class KnowledgeResourceChunk(Base, TimestampMixin):
    __tablename__ = "knowledge_resource_chunks"
    __table_args__ = (
        UniqueConstraint(
            "resource_id",
            "chunk_index",
            name="uq_knowledge_resource_chunk_index",
        ),
    )

    chunk_id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    resource_id = Column(UUID, ForeignKey("knowledge_resources.resource_id"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    token_count = Column(Integer, nullable=True)

    # Future embedding implementation fields (kept nullable for phased rollout)
    embedding_provider = Column(String, nullable=True)
    embedding_model = Column(String, nullable=True)
    embedding_dimensions = Column(Integer, nullable=True)
    embedding_reference = Column(String, nullable=True, comment="External vector ID/reference if vectors are stored outside this table.")

    retrieval_metadata = Column(JSONB, nullable=True, comment="Chunk-level retrieval metadata (e.g., section, heading, page range).")

    resource = relationship("KnowledgeResource", back_populates="chunks")
