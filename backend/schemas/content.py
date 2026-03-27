"""Pydantic schemas for Content, all polymorphic subtypes, Track, and SuccessMetrics."""

from __future__ import annotations

from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from .base import TimestampMixin
from .enums import EngagementPhase, MediaType, TrackFormat


# ===================================================================
# Track
# ===================================================================

class TrackBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    track_file_path: Optional[str] = None
    track_title: Optional[str] = None
    track_description: Optional[str] = None
    format: Optional[TrackFormat] = None
    bitrate: Optional[int] = None
    sample_rate: Optional[int] = None
    version_subtitle: Optional[str] = None
    release_date: Optional[datetime] = None
    isrc: Optional[str] = None
    iwc: Optional[str] = None
    upc: Optional[str] = None
    lyrics: Optional[str] = None
    bpm: Optional[int] = None
    key: Optional[str] = None
    genres: Optional[List[str]] = None
    duration_seconds: Optional[int] = None
    moods: Optional[List[str]] = None
    keyword_tags: Optional[List[str]] = None
    track_notes: Optional[str] = None


class TrackCreate(TrackBase):
    pass


class TrackUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    track_file_path: Optional[str] = None
    track_title: Optional[str] = None
    track_description: Optional[str] = None
    format: Optional[TrackFormat] = None
    bitrate: Optional[int] = None
    sample_rate: Optional[int] = None
    version_subtitle: Optional[str] = None
    release_date: Optional[datetime] = None
    isrc: Optional[str] = None
    iwc: Optional[str] = None
    upc: Optional[str] = None
    lyrics: Optional[str] = None
    bpm: Optional[int] = None
    key: Optional[str] = None
    genres: Optional[List[str]] = None
    duration_seconds: Optional[int] = None
    moods: Optional[List[str]] = None
    keyword_tags: Optional[List[str]] = None
    track_notes: Optional[str] = None


class TrackResponse(TrackBase, TimestampMixin):
    track_id: UUID


# ===================================================================
# SuccessMetrics
# ===================================================================

class SuccessMetricsBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    success_metrics_name: Optional[str] = None
    success_metrics_description: Optional[str] = None
    target_value: Optional[int] = None
    target_value_unit: Optional[str] = None
    success_metrics_is_active: Optional[bool] = True
    success_metrics_notes: Optional[str] = None


class SuccessMetricsCreate(SuccessMetricsBase):
    content_id: UUID


class SuccessMetricsUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    success_metrics_name: Optional[str] = None
    success_metrics_description: Optional[str] = None
    target_value: Optional[int] = None
    target_value_unit: Optional[str] = None
    success_metrics_is_active: Optional[bool] = None
    success_metrics_notes: Optional[str] = None


class SuccessMetricsResponse(SuccessMetricsBase, TimestampMixin):
    success_metrics_id: UUID
    content_id: Optional[UUID] = None


# ===================================================================
# Content (base / parent)
# ===================================================================

class ContentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    goals: Optional[str] = None
    engagement_phase: Optional[EngagementPhase] = EngagementPhase.AWARENESS
    is_active: Optional[bool] = True
    notes: Optional[str] = None
    track_id: Optional[UUID] = None


class ContentCreate(ContentBase):
    type: str = "content_base"


class ContentUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    goals: Optional[str] = None
    engagement_phase: Optional[EngagementPhase] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None
    track_id: Optional[UUID] = None


class ContentResponse(ContentBase, TimestampMixin):
    content_id: UUID
    type: str


# ===================================================================
# Instagram Post
# ===================================================================

class InstagramPostCreate(ContentCreate):
    type: str = "instagram_post"
    post_type: Optional[MediaType] = MediaType.PHOTO
    caption: Optional[str] = None
    timestamp: Optional[datetime] = None
    permalink: Optional[str] = None
    likes_count: Optional[int] = 0
    shares_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    saves_count: Optional[int] = 0
    comments: Optional[Any] = None
    instagram_notes: Optional[str] = None


class InstagramPostUpdate(ContentUpdate):
    post_type: Optional[MediaType] = None
    caption: Optional[str] = None
    timestamp: Optional[datetime] = None
    permalink: Optional[str] = None
    likes_count: Optional[int] = None
    shares_count: Optional[int] = None
    comments_count: Optional[int] = None
    saves_count: Optional[int] = None
    comments: Optional[Any] = None
    instagram_notes: Optional[str] = None


class InstagramPostResponse(ContentResponse):
    type: str = "instagram_post"
    post_type: Optional[MediaType] = None
    caption: Optional[str] = None
    timestamp: Optional[datetime] = None
    permalink: Optional[str] = None
    likes_count: Optional[int] = 0
    shares_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    saves_count: Optional[int] = 0
    comments: Optional[Any] = None
    instagram_notes: Optional[str] = None


# ===================================================================
# Instagram Story
# ===================================================================

class InstagramStoryCreate(ContentCreate):
    type: str = "instagram_story"
    likes_count: Optional[int] = 0
    shares_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    instagram_story_is_active: Optional[bool] = True
    instagram_story_notes: Optional[str] = None


class InstagramStoryUpdate(ContentUpdate):
    likes_count: Optional[int] = None
    shares_count: Optional[int] = None
    comments_count: Optional[int] = None
    instagram_story_is_active: Optional[bool] = None
    instagram_story_notes: Optional[str] = None


class InstagramStoryResponse(ContentResponse):
    type: str = "instagram_story"
    likes_count: Optional[int] = 0
    shares_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    instagram_story_is_active: Optional[bool] = True
    instagram_story_notes: Optional[str] = None


# ===================================================================
# Instagram Reel
# ===================================================================

class InstagramReelCreate(ContentCreate):
    type: str = "instagram_reel"
    instagram_reel_url: Optional[str] = None
    likes_count: Optional[int] = 0
    shares_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    saves_count: Optional[int] = 0
    instagram_reel_is_active: Optional[bool] = True
    instagram_reel_notes: Optional[str] = None


class InstagramReelUpdate(ContentUpdate):
    instagram_reel_url: Optional[str] = None
    likes_count: Optional[int] = None
    shares_count: Optional[int] = None
    comments_count: Optional[int] = None
    saves_count: Optional[int] = None
    instagram_reel_is_active: Optional[bool] = None
    instagram_reel_notes: Optional[str] = None


class InstagramReelResponse(ContentResponse):
    type: str = "instagram_reel"
    instagram_reel_url: Optional[str] = None
    likes_count: Optional[int] = 0
    shares_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    saves_count: Optional[int] = 0
    instagram_reel_is_active: Optional[bool] = True
    instagram_reel_notes: Optional[str] = None


# ===================================================================
# Twitter/X Post
# ===================================================================

class TwitterXPostCreate(ContentCreate):
    type: str = "twitter_x_post"
    twitter_x_content_url: Optional[str] = None
    likes_count: Optional[int] = 0
    shares_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    twitter_x_content_is_active: Optional[bool] = True
    twitter_x_notes: Optional[str] = None


class TwitterXPostUpdate(ContentUpdate):
    twitter_x_content_url: Optional[str] = None
    likes_count: Optional[int] = None
    shares_count: Optional[int] = None
    comments_count: Optional[int] = None
    twitter_x_content_is_active: Optional[bool] = None
    twitter_x_notes: Optional[str] = None


class TwitterXPostResponse(ContentResponse):
    type: str = "twitter_x_post"
    twitter_x_content_url: Optional[str] = None
    likes_count: Optional[int] = 0
    shares_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    twitter_x_content_is_active: Optional[bool] = True
    twitter_x_notes: Optional[str] = None


# ===================================================================
# Reddit Post
# ===================================================================

class RedditPostCreate(ContentCreate):
    type: str = "reddit_post"
    reddit_content_url: Optional[str] = None
    likes_count: Optional[int] = 0
    shares_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    reddit_content_is_active: Optional[bool] = True
    reddit_notes: Optional[str] = None


class RedditPostUpdate(ContentUpdate):
    reddit_content_url: Optional[str] = None
    likes_count: Optional[int] = None
    shares_count: Optional[int] = None
    comments_count: Optional[int] = None
    reddit_content_is_active: Optional[bool] = None
    reddit_notes: Optional[str] = None


class RedditPostResponse(ContentResponse):
    type: str = "reddit_post"
    reddit_content_url: Optional[str] = None
    likes_count: Optional[int] = 0
    shares_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    reddit_content_is_active: Optional[bool] = True
    reddit_notes: Optional[str] = None


# ===================================================================
# Thread Post
# ===================================================================

class ThreadPostCreate(ContentCreate):
    type: str = "thread_post"
    thread_content_url: Optional[str] = None
    likes_count: Optional[int] = 0
    shares_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    saves_count: Optional[int] = 0
    thread_content_is_active: Optional[bool] = True
    thread_notes: Optional[str] = None


class ThreadPostUpdate(ContentUpdate):
    thread_content_url: Optional[str] = None
    likes_count: Optional[int] = None
    shares_count: Optional[int] = None
    comments_count: Optional[int] = None
    saves_count: Optional[int] = None
    thread_content_is_active: Optional[bool] = None
    thread_notes: Optional[str] = None


class ThreadPostResponse(ContentResponse):
    type: str = "thread_post"
    thread_content_url: Optional[str] = None
    likes_count: Optional[int] = 0
    shares_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    saves_count: Optional[int] = 0
    thread_content_is_active: Optional[bool] = True
    thread_notes: Optional[str] = None


# ===================================================================
# Bluesky Post
# ===================================================================

class BlueskyPostCreate(ContentCreate):
    type: str = "bluesky_post"
    bluesky_content_url: Optional[str] = None
    likes_count: Optional[int] = 0
    shares_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    bluesky_content_is_active: Optional[bool] = True
    bluesky_notes: Optional[str] = None


class BlueskyPostUpdate(ContentUpdate):
    bluesky_content_url: Optional[str] = None
    likes_count: Optional[int] = None
    shares_count: Optional[int] = None
    comments_count: Optional[int] = None
    bluesky_content_is_active: Optional[bool] = None
    bluesky_notes: Optional[str] = None


class BlueskyPostResponse(ContentResponse):
    type: str = "bluesky_post"
    bluesky_content_url: Optional[str] = None
    likes_count: Optional[int] = 0
    shares_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    bluesky_content_is_active: Optional[bool] = True
    bluesky_notes: Optional[str] = None


# ===================================================================
# YouTube Video
# ===================================================================

class YoutubeVideoCreate(ContentCreate):
    type: str = "youtube_video"
    youtube_content_url: Optional[str] = None
    youtube_content_id: Optional[str] = None
    views_count: Optional[int] = 0
    likes_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    youtube_content_is_active: Optional[bool] = True
    youtube_notes: Optional[str] = None


class YoutubeVideoUpdate(ContentUpdate):
    youtube_content_url: Optional[str] = None
    youtube_content_id: Optional[str] = None
    views_count: Optional[int] = None
    likes_count: Optional[int] = None
    comments_count: Optional[int] = None
    youtube_content_is_active: Optional[bool] = None
    youtube_notes: Optional[str] = None


class YoutubeVideoResponse(ContentResponse):
    type: str = "youtube_video"
    youtube_content_url: Optional[str] = None
    youtube_content_id: Optional[str] = None
    views_count: Optional[int] = 0
    likes_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    youtube_content_is_active: Optional[bool] = True
    youtube_notes: Optional[str] = None


# ===================================================================
# YouTube Short
# ===================================================================

class YoutubeShortCreate(ContentCreate):
    type: str = "youtube_short"
    youtube_short_url: Optional[str] = None
    youtube_short_is_active: Optional[bool] = True
    youtube_short_notes: Optional[str] = None


class YoutubeShortUpdate(ContentUpdate):
    youtube_short_url: Optional[str] = None
    youtube_short_is_active: Optional[bool] = None
    youtube_short_notes: Optional[str] = None


class YoutubeShortResponse(ContentResponse):
    type: str = "youtube_short"
    youtube_short_url: Optional[str] = None
    youtube_short_is_active: Optional[bool] = True
    youtube_short_notes: Optional[str] = None
