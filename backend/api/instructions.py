"""CRUD router for Instructions and Frequencies."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_db, verify_token
from models.instruction import Instruction
from schemas.instruction import (
    InstructionCreate, InstructionUpdate, InstructionResponse,
    FrequencyCreate, FrequencyUpdate, FrequencyResponse,
)

Frequency = Instruction.Frequency

router = APIRouter(prefix="/api/instructions", tags=["instructions"], dependencies=[Depends(verify_token)])


# GET /api/instructions - Retrieve all instructions with optional filtering
# Query Parameters:
#   - track_id (string, optional): UUID or "null" for template instructions (no track association)
#   - phase (string, optional): Filter instructions by workflow phase
#   - platform_id (UUID, optional): Filter instructions by associated platform
# Returns: List of InstructionResponse objects ordered by creation date (newest first)
# Use Case: Get all instructions, filter by track for specific projects, or "null" for reusable templates
# Note: Template instructions (track_id=null) can be reused across multiple tracks
@router.get("", response_model=List[InstructionResponse])
async def list_instructions(
    phase: Optional[str] = Query(None),
    platform_id: Optional[UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Instruction).order_by(Instruction.created_at.desc())
    if phase:
        stmt = stmt.where(Instruction.phase == phase)
    if platform_id:
        stmt = stmt.where(Instruction.platform_id == platform_id)
    result = await db.execute(stmt)
    return result.scalars().all()


# GET /api/instructions/{instruction_id} - Retrieve specific instruction by its unique ID
# Path Parameters:
#   - instruction_id (UUID): Unique identifier of the instruction to retrieve
# Returns: Single InstructionResponse object
# Error: 404 if instruction not found
# Use Case: View detailed information about specific instruction including its frequencies
@router.get("/{instruction_id}", response_model=InstructionResponse)
async def get_instruction(instruction_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Instruction).where(Instruction.instruction_id == instruction_id))
    instruction = result.scalar_one_or_none()
    if not instruction:
        raise HTTPException(status_code=404, detail="Instruction not found")
    return instruction


# POST /api/instructions - Create new instruction (can be template or track-specific)
# Request Body: InstructionCreate schema with instruction details
#   - track_id (UUID, optional): Associated track (null for template instructions)
#   - phase (string, required): Workflow phase this instruction belongs to
#   - platform_id (UUID, optional): Platform this instruction applies to
#   - Additional instruction-specific fields
# Returns: Created InstructionResponse object with generated instruction_id
# Status Code: 201 Created
# Use Case: Create new workflow instructions, reusable templates, or track-specific tasks
# Note: Template instructions (track_id=null) can be inherited by multiple tracks
@router.post("", response_model=InstructionResponse, status_code=status.HTTP_201_CREATED)
async def create_instruction(body: InstructionCreate, db: AsyncSession = Depends(get_db)):
    instruction = Instruction(**body.model_dump(exclude_unset=True))
    db.add(instruction)
    await db.flush()
    return instruction


# PUT /api/instructions/{instruction_id} - Update existing instruction
# Path Parameters:
#   - instruction_id (UUID): Unique identifier of the instruction to update
# Request Body: InstructionUpdate schema with fields to update (all optional)
#   - track_id (UUID, optional): Change track association or set to null for template
#   - phase (string, optional): Update workflow phase
#   - platform_id (UUID, optional): Change platform association
#   - Additional instruction-specific fields
# Returns: Updated InstructionResponse object
# Error: 404 if instruction not found
# Use Case: Modify instruction details, change phase, update platform targeting
@router.put("/{instruction_id}", response_model=InstructionResponse)
async def update_instruction(instruction_id: UUID, body: InstructionUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Instruction).where(Instruction.instruction_id == instruction_id))
    instruction = result.scalar_one_or_none()
    if not instruction:
        raise HTTPException(status_code=404, detail="Instruction not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(instruction, field, value)
    await db.flush()
    return instruction


# DELETE /api/instructions/{instruction_id} - Remove instruction and its frequencies
# Path Parameters:
#   - instruction_id (UUID): Unique identifier of the instruction to delete
# Returns: No content (empty response)
# Status Code: 204 No Content
# Error: 404 if instruction not found
# Use Case: Remove obsolete instructions, clean up workflow templates
# Note: Cascades to delete all associated frequencies automatically
# Warning: Deleting template instructions may affect tracks that inherit them
@router.delete("/{instruction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_instruction(instruction_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Instruction).where(Instruction.instruction_id == instruction_id))
    instruction = result.scalar_one_or_none()
    if not instruction:
        raise HTTPException(status_code=404, detail="Instruction not found")
    # Delete frequencies first
    await db.execute(
        select(Frequency).where(Frequency.instruction_id == instruction_id)
    )
    freq_result = await db.execute(select(Frequency).where(Frequency.instruction_id == instruction_id))
    for f in freq_result.scalars().all():
        await db.delete(f)
    await db.delete(instruction)
    await db.flush()


# --- Frequency sub-routes ---

# GET /api/instructions/{instruction_id}/frequencies - Retrieve all frequencies for specific instruction
# Path Parameters:
#   - instruction_id (UUID): Unique identifier of the parent instruction
# Returns: List of FrequencyResponse objects for the instruction
# Use Case: View scheduling patterns and frequency settings for an instruction
# Note: Frequencies define when and how often instructions should be executed
@router.get("/{instruction_id}/frequencies", response_model=List[FrequencyResponse])
async def list_frequencies(instruction_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Frequency).where(Frequency.instruction_id == instruction_id)
    )
    return result.scalars().all()


# POST /api/instructions/{instruction_id}/frequencies - Create new frequency for instruction
# Path Parameters:
#   - instruction_id (UUID): Unique identifier of the parent instruction
# Request Body: FrequencyCreate schema with scheduling details
#   - frequency_type (string, required): Type of frequency (daily, weekly, monthly, etc.)
#   - interval (integer, optional): Interval between executions
#   - start_date (datetime, optional): When frequency should start
#   - end_date (datetime, optional): When frequency should end
# Returns: Created FrequencyResponse object with generated frequency_id
# Status Code: 201 Created
# Use Case: Schedule recurring execution of instructions, set time-based automation
# Note: Multiple frequencies can be created per instruction for complex scheduling
@router.post("/{instruction_id}/frequencies", response_model=FrequencyResponse, status_code=status.HTTP_201_CREATED)
async def create_frequency(instruction_id: UUID, body: FrequencyCreate, db: AsyncSession = Depends(get_db)):
    freq = Frequency(**body.model_dump(exclude_unset=True))
    freq.instruction_id = instruction_id
    db.add(freq)
    await db.flush()
    return freq


# PUT /api/instructions/frequencies/{frequency_id} - Update existing frequency
# Path Parameters:
#   - frequency_id (UUID): Unique identifier of the frequency to update
# Request Body: FrequencyUpdate schema with fields to update (all optional)
#   - frequency_type (string, optional): Change frequency pattern
#   - interval (integer, optional): Update execution interval
#   - start_date (datetime, optional): Modify start timing
#   - end_date (datetime, optional): Update end timing
# Returns: Updated FrequencyResponse object
# Error: 404 if frequency not found
# Use Case: Adjust scheduling patterns, modify execution timing, extend frequency periods
@router.put("/frequencies/{frequency_id}", response_model=FrequencyResponse)
async def update_frequency(frequency_id: UUID, body: FrequencyUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Frequency).where(Frequency.frequency_id == frequency_id))
    freq = result.scalar_one_or_none()
    if not freq:
        raise HTTPException(status_code=404, detail="Frequency not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(freq, field, value)
    await db.flush()
    return freq


# DELETE /api/instructions/frequencies/{frequency_id} - Remove frequency from instruction
# Path Parameters:
#   - frequency_id (UUID): Unique identifier of the frequency to delete
# Returns: No content (empty response)
# Status Code: 204 No Content
# Error: 404 if frequency not found
# Use Case: Remove outdated scheduling, clean up completed frequencies, modify automation
# Note: Deleting frequency doesn't affect the parent instruction
@router.delete("/frequencies/{frequency_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_frequency(frequency_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Frequency).where(Frequency.frequency_id == frequency_id))
    freq = result.scalar_one_or_none()
    if not freq:
        raise HTTPException(status_code=404, detail="Frequency not found")
    await db.delete(freq)
    await db.flush()
