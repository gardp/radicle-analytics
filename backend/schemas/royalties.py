"""Pydantic schemas for Royalty and RoyaltyTransaction."""

from __future__ import annotations

from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from .base import TimestampMixin
from .enums import RoyaltyRight, RoyaltyType


# ===================================================================
# RoyaltyTransaction
# ===================================================================

class RoyaltyTransactionBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    amount: Optional[Decimal] = None
    currency: Optional[str] = "USD"


class RoyaltyTransactionCreate(RoyaltyTransactionBase):
    royalty_id: UUID


class RoyaltyTransactionUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    amount: Optional[Decimal] = None
    currency: Optional[str] = None


class RoyaltyTransactionResponse(RoyaltyTransactionBase, TimestampMixin):
    royalty_transaction_id: UUID
    royalty_id: Optional[UUID] = None


# ===================================================================
# Royalty
# ===================================================================

class RoyaltyBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    right: Optional[RoyaltyRight] = None
    royalty: Optional[RoyaltyType] = None
    platform_id: Optional[UUID] = None
    track_id: Optional[UUID] = None


class RoyaltyCreate(RoyaltyBase):
    pass


class RoyaltyUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    right: Optional[RoyaltyRight] = None
    royalty: Optional[RoyaltyType] = None
    platform_id: Optional[UUID] = None
    track_id: Optional[UUID] = None


class RoyaltyResponse(RoyaltyBase, TimestampMixin):
    royalty_id: UUID
