"""Pydantic schemas for Instruction, Frequency, KnowledgeResource, and KnowledgeResourceChunk."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from .base import TimestampMixin
from .enums import (
    FrequencyType,
    IngestionMethod,
    InstructionPhase,
    KnowledgeResourceCategory,
    KnowledgeResourceFormat,
    TimePeriod,
)


# ===================================================================
# Frequency
# ===================================================================

class FrequencyBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    description: Optional[str] = None
    frequency_unit: Optional[str] = None
    frequency_value: Optional[int] = None
    time_period: Optional[TimePeriod] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    frequency_type: Optional[FrequencyType] = FrequencyType.RECURRING
    is_active: Optional[bool] = True
    notes: Optional[str] = None


class FrequencyCreate(FrequencyBase):
    instruction_id: UUID


class FrequencyUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    description: Optional[str] = None
    frequency_unit: Optional[str] = None
    frequency_value: Optional[int] = None
    time_period: Optional[TimePeriod] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    frequency_type: Optional[FrequencyType] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class FrequencyResponse(FrequencyBase, TimestampMixin):
    frequency_id: UUID
    instruction_id: Optional[UUID] = None


# ===================================================================
# Instruction
# ===================================================================

class InstructionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    source: Optional[str] = None
    source_media: Optional[str] = None
    phase: Optional[InstructionPhase] = None
    goals: Optional[str] = None
    is_active: Optional[bool] = True
    notes: Optional[str] = None
    platform_id: Optional[UUID] = None
    dependency_instruction_id: Optional[UUID] = None


class InstructionCreate(InstructionBase):
    pass


class InstructionUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    source: Optional[str] = None
    source_media: Optional[str] = None
    phase: Optional[InstructionPhase] = None
    goals: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None
    platform_id: Optional[UUID] = None
    dependency_instruction_id: Optional[UUID] = None


class InstructionResponse(InstructionBase, TimestampMixin):
    instruction_id: UUID


# ===================================================================
# KnowledgeResourceChunk
# ===================================================================

class KnowledgeResourceChunkBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    chunk_index: int
    chunk_text: str
    token_count: Optional[int] = None
    embedding_provider: Optional[str] = None
    embedding_model: Optional[str] = None
    embedding_dimensions: Optional[int] = None
    embedding_reference: Optional[str] = None
    retrieval_metadata: Optional[Dict[str, Any]] = None


class KnowledgeResourceChunkCreate(KnowledgeResourceChunkBase):
    resource_id: UUID


class KnowledgeResourceChunkUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    chunk_index: Optional[int] = None
    chunk_text: Optional[str] = None
    token_count: Optional[int] = None
    embedding_provider: Optional[str] = None
    embedding_model: Optional[str] = None
    embedding_dimensions: Optional[int] = None
    embedding_reference: Optional[str] = None
    retrieval_metadata: Optional[Dict[str, Any]] = None


class KnowledgeResourceChunkResponse(KnowledgeResourceChunkBase, TimestampMixin):
    chunk_id: UUID
    resource_id: UUID


# ===================================================================
# KnowledgeResource
# ===================================================================

class KnowledgeResourceBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    workspace_id: UUID
    canonical_key: str
    version: int = 1
    parent_resource_id: Optional[UUID] = None
    title: str
    summary: Optional[str] = None
    category: KnowledgeResourceCategory = KnowledgeResourceCategory.DOCUMENT
    resource_format: KnowledgeResourceFormat
    ingestion_method: IngestionMethod = IngestionMethod.MANUAL
    source_url: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    language: Optional[str] = "en"
    tags: List[str] = Field(default_factory=list)
    raw_text: Optional[str] = None
    retrieval_metadata: Optional[Dict[str, Any]] = None


class KnowledgeResourceCreate(KnowledgeResourceBase):
    pass


class KnowledgeResourceUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    workspace_id: Optional[UUID] = None
    canonical_key: Optional[str] = None
    version: Optional[int] = None
    parent_resource_id: Optional[UUID] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    category: Optional[KnowledgeResourceCategory] = None
    resource_format: Optional[KnowledgeResourceFormat] = None
    ingestion_method: Optional[IngestionMethod] = None
    source_url: Optional[str] = None
    author: Optional[str] = None
    publisher: Optional[str] = None
    language: Optional[str] = None
    tags: Optional[List[str]] = None
    raw_text: Optional[str] = None
    retrieval_metadata: Optional[Dict[str, Any]] = None


class KnowledgeResourceResponse(KnowledgeResourceBase, TimestampMixin):
    resource_id: UUID
