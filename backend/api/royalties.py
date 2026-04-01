"""CRUD router for Royalties and RoyaltyTransactions."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.deps import get_db, verify_token
from models.royalties import Royalty, RoyaltyTransaction
from schemas.royalties import (
    RoyaltyCreate, RoyaltyUpdate, RoyaltyResponse,
    RoyaltyTransactionCreate, RoyaltyTransactionUpdate, RoyaltyTransactionResponse,
)

router = APIRouter(prefix="/api/royalties", tags=["royalties"], dependencies=[Depends(verify_token)])


# GET /api/royalties - Retrieve all royalties with optional filtering
# Query Parameters:
#   - track_id (UUID, optional): Filter royalties by associated track
#   - platform_id (UUID, optional): Filter royalties by associated platform
# Returns: List of RoyaltyResponse objects ordered by creation date (newest first)
# Use Case: View royalty records by track/platform for reporting and reconciliation
# Note: Royalty records are parent entities for one-to-many royalty transactions
@router.get("", response_model=List[RoyaltyResponse])
async def list_royalties(
    track_id: Optional[UUID] = Query(None),
    platform_id: Optional[UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Royalty).order_by(Royalty.created_at.desc())
    if track_id:
        stmt = stmt.where(Royalty.track_id == track_id)
    if platform_id:
        stmt = stmt.where(Royalty.platform_id == platform_id)
    result = await db.execute(stmt)
    return result.scalars().all()


# GET /api/royalties/{royalty_id} - Retrieve a specific royalty by its unique ID
# Path Parameters:
#   - royalty_id (UUID): Unique identifier of the royalty to retrieve
# Returns: Single RoyaltyResponse object
# Error: 404 if royalty not found
# Use Case: Inspect a royalty record before editing or reviewing transactions
@router.get("/{royalty_id}", response_model=RoyaltyResponse)
async def get_royalty(royalty_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Royalty).where(Royalty.royalty_id == royalty_id))
    royalty = result.scalar_one_or_none()
    if not royalty:
        raise HTTPException(status_code=404, detail="Royalty not found")
    return royalty


# POST /api/royalties - Create a new royalty record
# Request Body: RoyaltyCreate schema with royalty details
#   - Common fields include royalty type/category, track/platform links, and metadata
# Returns: Created RoyaltyResponse object with generated royalty_id
# Status Code: 201 Created
# Use Case: Register a new royalty stream before logging individual transactions
@router.post("", response_model=RoyaltyResponse, status_code=status.HTTP_201_CREATED)
async def create_royalty(body: RoyaltyCreate, db: AsyncSession = Depends(get_db)):
    royalty = Royalty(**body.model_dump(exclude_unset=True))
    db.add(royalty)
    await db.flush()
    return royalty


# PUT /api/royalties/{royalty_id} - Update an existing royalty record
# Path Parameters:
#   - royalty_id (UUID): Unique identifier of the royalty to update
# Request Body: RoyaltyUpdate schema with fields to update (all optional)
# Returns: Updated RoyaltyResponse object
# Error: 404 if royalty not found
# Use Case: Correct royalty metadata, adjust links, or update categorization
@router.put("/{royalty_id}", response_model=RoyaltyResponse)
async def update_royalty(royalty_id: UUID, body: RoyaltyUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Royalty).where(Royalty.royalty_id == royalty_id))
    royalty = result.scalar_one_or_none()
    if not royalty:
        raise HTTPException(status_code=404, detail="Royalty not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(royalty, field, value)
    await db.flush()
    return royalty


# DELETE /api/royalties/{royalty_id} - Remove a royalty and its transactions
# Path Parameters:
#   - royalty_id (UUID): Unique identifier of the royalty to delete
# Returns: No content (empty response)
# Status Code: 204 No Content
# Error: 404 if royalty not found
# Use Case: Remove invalid/obsolete royalty entries and associated transaction history
# Note: This performs a manual cascade delete of related royalty transactions
@router.delete("/{royalty_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_royalty(royalty_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Royalty).where(Royalty.royalty_id == royalty_id))
    royalty = result.scalar_one_or_none()
    if not royalty:
        raise HTTPException(status_code=404, detail="Royalty not found")
    # Delete transactions first
    await db.execute(
        select(RoyaltyTransaction).where(RoyaltyTransaction.royalty_id == royalty_id)
    )
    tx_result = await db.execute(select(RoyaltyTransaction).where(RoyaltyTransaction.royalty_id == royalty_id))
    for tx in tx_result.scalars().all():
        await db.delete(tx)
    await db.delete(royalty)
    await db.flush()


# --- Transaction sub-routes ---

# GET /api/royalties/{royalty_id}/transactions - Retrieve all transactions for a royalty
# Path Parameters:
#   - royalty_id (UUID): Unique identifier of the parent royalty
# Returns: List of RoyaltyTransactionResponse objects
# Use Case: View payout history and transaction timeline for a specific royalty
@router.get("/{royalty_id}/transactions", response_model=List[RoyaltyTransactionResponse])
async def list_transactions(royalty_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(RoyaltyTransaction).where(RoyaltyTransaction.royalty_id == royalty_id)
    )
    return result.scalars().all()


# POST /api/royalties/{royalty_id}/transactions - Create a new transaction for a royalty
# Path Parameters:
#   - royalty_id (UUID): Unique identifier of the parent royalty
# Request Body: RoyaltyTransactionCreate schema with transaction details
#   - Common fields include amount, currency, status, and transaction metadata
# Returns: Created RoyaltyTransactionResponse object with generated transaction ID
# Status Code: 201 Created
# Use Case: Record royalty payments, receipts, or adjustments under a royalty stream
@router.post("/{royalty_id}/transactions", response_model=RoyaltyTransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(royalty_id: UUID, body: RoyaltyTransactionCreate, db: AsyncSession = Depends(get_db)):
    tx = RoyaltyTransaction(**body.model_dump(exclude_unset=True))
    tx.royalty_id = royalty_id
    db.add(tx)
    await db.flush()
    return tx


# PUT /api/royalties/transactions/{transaction_id} - Update an existing royalty transaction
# Path Parameters:
#   - transaction_id (UUID): Unique identifier of the transaction to update
# Request Body: RoyaltyTransactionUpdate schema with fields to update (all optional)
# Returns: Updated RoyaltyTransactionResponse object
# Error: 404 if transaction not found
# Use Case: Correct transaction amount/status/details after reconciliation
@router.put("/transactions/{transaction_id}", response_model=RoyaltyTransactionResponse)
async def update_transaction(transaction_id: UUID, body: RoyaltyTransactionUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(RoyaltyTransaction).where(RoyaltyTransaction.royalty_transaction_id == transaction_id)
    )
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(tx, field, value)
    await db.flush()
    return tx


# DELETE /api/royalties/transactions/{transaction_id} - Remove a royalty transaction
# Path Parameters:
#   - transaction_id (UUID): Unique identifier of the transaction to delete
# Returns: No content (empty response)
# Status Code: 204 No Content
# Error: 404 if transaction not found
# Use Case: Remove duplicate/invalid transaction entries during cleanup
# Note: Deleting a transaction does not delete its parent royalty
@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(transaction_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(RoyaltyTransaction).where(RoyaltyTransaction.royalty_transaction_id == transaction_id)
    )
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    await db.delete(tx)
    await db.flush()
