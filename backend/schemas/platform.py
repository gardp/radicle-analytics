"""Pydantic schemas for Platform and all polymorphic account subtypes."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from .base import TimestampMixin
from .enums import PlatformType, VerifiedStatus


# ===================================================================
# Platform (base / parent)
# ===================================================================

class PlatformBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    type: Optional[PlatformType] = None
    description: Optional[str] = None
    url: Optional[str] = None
    is_active: Optional[bool] = True
    notes: Optional[str] = None


class PlatformCreate(PlatformBase):
    account_data: str = "platform_base"


class PlatformUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    type: Optional[PlatformType] = None
    description: Optional[str] = None
    url: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class PlatformResponse(PlatformBase, TimestampMixin):
    platform_id: UUID
    account_data: Optional[str] = None


# ===================================================================
# Instagram Account
# ===================================================================

class InstagramAccountCreate(PlatformCreate):
    account_data: str = "instagram"
    username: Optional[str] = None
    profile_picture_url: Optional[str] = None
    bio: Optional[str] = None
    bio_url: Optional[str] = None
    followers_count: Optional[int] = 0
    following_count: Optional[int] = 0
    total_media_count: Optional[int] = 0
    account_type: Optional[str] = None
    raw_payload: Optional[Any] = None


class InstagramAccountUpdate(PlatformUpdate):
    username: Optional[str] = None
    profile_picture_url: Optional[str] = None
    bio: Optional[str] = None
    bio_url: Optional[str] = None
    followers_count: Optional[int] = None
    following_count: Optional[int] = None
    total_media_count: Optional[int] = None
    account_type: Optional[str] = None
    raw_payload: Optional[Any] = None


class InstagramAccountResponse(PlatformResponse):
    account_data: str = "instagram"
    username: Optional[str] = None
    profile_picture_url: Optional[str] = None
    bio: Optional[str] = None
    bio_url: Optional[str] = None
    followers_count: Optional[int] = 0
    following_count: Optional[int] = 0
    total_media_count: Optional[int] = 0
    account_type: Optional[str] = None
    raw_payload: Optional[Any] = None


# ===================================================================
# Twitter/X Account
# ===================================================================

class TwitterXAccountCreate(PlatformCreate):
    account_data: str = "twitter"
    username: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    pinned_post_id: Optional[Any] = None
    post_count: Optional[int] = 0
    list_count: Optional[int] = 0
    followers_count: Optional[int] = 0
    following_count: Optional[int] = 0
    verified_status: Optional[VerifiedStatus] = None
    account_type: Optional[str] = None
    raw_payload: Optional[Any] = None


class TwitterXAccountUpdate(PlatformUpdate):
    username: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    pinned_post_id: Optional[Any] = None
    post_count: Optional[int] = None
    list_count: Optional[int] = None
    followers_count: Optional[int] = None
    following_count: Optional[int] = None
    verified_status: Optional[VerifiedStatus] = None
    account_type: Optional[str] = None
    raw_payload: Optional[Any] = None


class TwitterXAccountResponse(PlatformResponse):
    account_data: str = "twitter"
    username: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    pinned_post_id: Optional[Any] = None
    post_count: Optional[int] = 0
    list_count: Optional[int] = 0
    followers_count: Optional[int] = 0
    following_count: Optional[int] = 0
    verified_status: Optional[VerifiedStatus] = None
    account_type: Optional[str] = None
    raw_payload: Optional[Any] = None


# ===================================================================
# TikTok Account
# ===================================================================

class TiktokAccountCreate(PlatformCreate):
    account_data: str = "tiktok"
    username: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    pinned_post_id: Optional[Any] = None
    post_count: Optional[int] = 0
    list_count: Optional[int] = 0
    followers_count: Optional[int] = 0
    following_count: Optional[int] = 0
    verified_status: Optional[VerifiedStatus] = None
    account_type: Optional[str] = None
    raw_payload: Optional[Any] = None


class TiktokAccountUpdate(PlatformUpdate):
    username: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    pinned_post_id: Optional[Any] = None
    post_count: Optional[int] = None
    list_count: Optional[int] = None
    followers_count: Optional[int] = None
    following_count: Optional[int] = None
    verified_status: Optional[VerifiedStatus] = None
    account_type: Optional[str] = None
    raw_payload: Optional[Any] = None


class TiktokAccountResponse(PlatformResponse):
    account_data: str = "tiktok"
    username: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    pinned_post_id: Optional[Any] = None
    post_count: Optional[int] = 0
    list_count: Optional[int] = 0
    followers_count: Optional[int] = 0
    following_count: Optional[int] = 0
    verified_status: Optional[VerifiedStatus] = None
    account_type: Optional[str] = None
    raw_payload: Optional[Any] = None


# ===================================================================
# YouTube Account
# ===================================================================

class YoutubeAccountCreate(PlatformCreate):
    account_data: str = "youtube"
    username: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    pinned_post_id: Optional[Any] = None
    post_count: Optional[int] = 0
    list_count: Optional[int] = 0
    followers_count: Optional[int] = 0
    following_count: Optional[int] = 0
    verified_status: Optional[VerifiedStatus] = None
    account_type: Optional[str] = None
    raw_payload: Optional[Any] = None


class YoutubeAccountUpdate(PlatformUpdate):
    username: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    pinned_post_id: Optional[Any] = None
    post_count: Optional[int] = None
    list_count: Optional[int] = None
    followers_count: Optional[int] = None
    following_count: Optional[int] = None
    verified_status: Optional[VerifiedStatus] = None
    account_type: Optional[str] = None
    raw_payload: Optional[Any] = None


class YoutubeAccountResponse(PlatformResponse):
    account_data: str = "youtube"
    username: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    pinned_post_id: Optional[Any] = None
    post_count: Optional[int] = 0
    list_count: Optional[int] = 0
    followers_count: Optional[int] = 0
    following_count: Optional[int] = 0
    verified_status: Optional[VerifiedStatus] = None
    account_type: Optional[str] = None
    raw_payload: Optional[Any] = None
