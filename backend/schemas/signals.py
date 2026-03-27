"""Pydantic schemas for all signal / insight models (Instagram, TikTok, Twitter/X, YouTube)."""

from __future__ import annotations

from typing import Any, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from .base import TimestampMixin


# ===================================================================
# Instagram Profile Insights
# ===================================================================

class InstagramProfileInsightsBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    reach: Optional[int] = 0
    impressions_count: Optional[int] = 0
    profile_views_count: Optional[int] = 0
    medica_count: Optional[int] = 0
    follower_growth: Optional[int] = 0
    profile_links_taps: Optional[int] = 0
    raw_payload: Optional[Any] = None


class InstagramProfileInsightsCreate(InstagramProfileInsightsBase):
    pass


class InstagramProfileInsightsUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    reach: Optional[int] = None
    impressions_count: Optional[int] = None
    profile_views_count: Optional[int] = None
    medica_count: Optional[int] = None
    follower_growth: Optional[int] = None
    profile_links_taps: Optional[int] = None
    raw_payload: Optional[Any] = None


class InstagramProfileInsightsResponse(InstagramProfileInsightsBase, TimestampMixin):
    insight_id: UUID


# ===================================================================
# Instagram Media Insights
# ===================================================================

class InstagramMediaInsightsBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    caption: Optional[str] = None
    media_id: Optional[str] = None
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    permalink: Optional[str] = None
    reach: Optional[int] = 0
    impressions_count: Optional[int] = 0
    saved: Optional[int] = 0
    reels_plays: Optional[int] = 0
    ig_reels_avg_watch_time: Optional[float] = None
    ig_reels_skip_rate: Optional[int] = 0
    crossposted_views: Optional[int] = 0
    views: Optional[int] = 0
    likes: Optional[int] = 0
    shares: Optional[int] = 0
    total_interactions: Optional[int] = 0
    navigation: Optional[int] = 0
    story_navigation_action_type: Optional[Any] = None
    plays: Optional[int] = 0
    profile_activity: Optional[int] = 0
    action_type: Optional[Any] = None
    impressions: Optional[int] = 0
    engagement_count: Optional[int] = 0
    comments_count: Optional[int] = 0
    replies: Optional[int] = None
    comments: Optional[Any] = None
    follower_growth: Optional[int] = None
    profile_links_taps: Optional[int] = None
    audience_demographics: Optional[Any] = None
    raw_payload: Optional[Any] = None


class InstagramMediaInsightsCreate(InstagramMediaInsightsBase):
    pass


class InstagramMediaInsightsUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    caption: Optional[str] = None
    media_id: Optional[str] = None
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    permalink: Optional[str] = None
    reach: Optional[int] = None
    impressions_count: Optional[int] = None
    saved: Optional[int] = None
    reels_plays: Optional[int] = None
    ig_reels_avg_watch_time: Optional[float] = None
    ig_reels_skip_rate: Optional[int] = None
    crossposted_views: Optional[int] = None
    views: Optional[int] = None
    likes: Optional[int] = None
    shares: Optional[int] = None
    total_interactions: Optional[int] = None
    navigation: Optional[int] = None
    story_navigation_action_type: Optional[Any] = None
    plays: Optional[int] = None
    profile_activity: Optional[int] = None
    action_type: Optional[Any] = None
    impressions: Optional[int] = None
    engagement_count: Optional[int] = None
    comments_count: Optional[int] = None
    replies: Optional[int] = None
    comments: Optional[Any] = None
    follower_growth: Optional[int] = None
    profile_links_taps: Optional[int] = None
    audience_demographics: Optional[Any] = None
    raw_payload: Optional[Any] = None


class InstagramMediaInsightsResponse(InstagramMediaInsightsBase, TimestampMixin):
    insight_id: UUID


# ===================================================================
# Instagram Hashtags
# ===================================================================

class InstagramHashtagsBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    hashtag: Optional[str] = None
    raw_payload: Optional[Any] = None


class InstagramHashtagsCreate(InstagramHashtagsBase):
    pass


class InstagramHashtagsUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    hashtag: Optional[str] = None
    raw_payload: Optional[Any] = None


class InstagramHashtagsResponse(InstagramHashtagsBase, TimestampMixin):
    insight_id: UUID


# ===================================================================
# TikTok Profile Insight
# ===================================================================

class TiktokProfileInsightBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    avatar_url: Optional[str] = None
    bio_description: Optional[str] = None
    profile_deep_link: Optional[str] = None
    username: Optional[str] = None
    followers_count: Optional[int] = None
    following_count: Optional[int] = None
    likes_count: Optional[int] = 0
    videos_count: Optional[int] = 0
    raw_payload: Optional[Any] = None


class TiktokProfileInsightCreate(TiktokProfileInsightBase):
    pass


class TiktokProfileInsightUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    avatar_url: Optional[str] = None
    bio_description: Optional[str] = None
    profile_deep_link: Optional[str] = None
    username: Optional[str] = None
    followers_count: Optional[int] = None
    following_count: Optional[int] = None
    likes_count: Optional[int] = None
    videos_count: Optional[int] = None
    raw_payload: Optional[Any] = None


class TiktokProfileInsightResponse(TiktokProfileInsightBase, TimestampMixin):
    insight_id: UUID


# ===================================================================
# TikTok Media Insights
# ===================================================================

class TiktokMediaInsightsBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    media_id: Optional[str] = None
    cover_image_url: Optional[str] = None
    video_description: Optional[str] = None
    duration: Optional[float] = None
    title: Optional[str] = None
    like_count: Optional[int] = 0
    comment_count: Optional[int] = 0
    share_count: Optional[int] = 0
    views_count: Optional[int] = 0


class TiktokMediaInsightsCreate(TiktokMediaInsightsBase):
    pass


class TiktokMediaInsightsUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    media_id: Optional[str] = None
    cover_image_url: Optional[str] = None
    video_description: Optional[str] = None
    duration: Optional[float] = None
    title: Optional[str] = None
    like_count: Optional[int] = None
    comment_count: Optional[int] = None
    share_count: Optional[int] = None
    views_count: Optional[int] = None


class TiktokMediaInsightsResponse(TiktokMediaInsightsBase, TimestampMixin):
    insight_id: UUID


# ===================================================================
# Twitter/X Content Insights
# ===================================================================

class TwitterXContentInsightsBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    content: Optional[Any] = None
    raw_payload: Optional[Any] = None


class TwitterXContentInsightsCreate(TwitterXContentInsightsBase):
    pass


class TwitterXContentInsightsUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    content: Optional[Any] = None
    raw_payload: Optional[Any] = None


class TwitterXContentInsightsResponse(TwitterXContentInsightsBase, TimestampMixin):
    insight_id: UUID


# ===================================================================
# Twitter/X Public Metrics
# ===================================================================

class TwitterXPublicMetricsBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    retweet_count: Optional[int] = None
    reply_count: Optional[int] = None
    like_count: Optional[int] = None
    quote_count: Optional[int] = None
    bookmark_count: Optional[int] = None
    raw_payload: Optional[Any] = None


class TwitterXPublicMetricsCreate(TwitterXPublicMetricsBase):
    pass


class TwitterXPublicMetricsUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    retweet_count: Optional[int] = None
    reply_count: Optional[int] = None
    like_count: Optional[int] = None
    quote_count: Optional[int] = None
    bookmark_count: Optional[int] = None
    raw_payload: Optional[Any] = None


class TwitterXPublicMetricsResponse(TwitterXPublicMetricsBase, TimestampMixin):
    insight_id: UUID


# ===================================================================
# Twitter/X User Metrics
# ===================================================================

class TwitterXUserMetricsBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    impressions: Optional[int] = 0
    engagements: Optional[Any] = None
    raw_payload: Optional[Any] = None


class TwitterXUserMetricsCreate(TwitterXUserMetricsBase):
    pass


class TwitterXUserMetricsUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    impressions: Optional[int] = None
    engagements: Optional[Any] = None
    raw_payload: Optional[Any] = None


class TwitterXUserMetricsResponse(TwitterXUserMetricsBase, TimestampMixin):
    insight_id: UUID


# ===================================================================
# Twitter/X Mentions
# ===================================================================

class TwitterXMentionsBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    mentions: Optional[Any] = None
    owner: Optional[Any] = None
    raw_payload: Optional[Any] = None


class TwitterXMentionsCreate(TwitterXMentionsBase):
    pass


class TwitterXMentionsUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    mentions: Optional[Any] = None
    owner: Optional[Any] = None
    raw_payload: Optional[Any] = None


class TwitterXMentionsResponse(TwitterXMentionsBase, TimestampMixin):
    insight_id: UUID


# ===================================================================
# YouTube Channel Report
# ===================================================================

class YoutubeChannelReportBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    dimensions: Optional[List[str]] = None
    filters: Optional[List[str]] = None
    result: Optional[Any] = None
    raw_payload: Optional[Any] = None


class YoutubeChannelReportCreate(YoutubeChannelReportBase):
    pass


class YoutubeChannelReportUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    dimensions: Optional[List[str]] = None
    filters: Optional[List[str]] = None
    result: Optional[Any] = None
    raw_payload: Optional[Any] = None


class YoutubeChannelReportResponse(YoutubeChannelReportBase, TimestampMixin):
    report_id: UUID


# ===================================================================
# YouTube Content Report
# ===================================================================

class YoutubeContentReportBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    dimensions: Optional[List[str]] = None
    filters: Optional[List[str]] = None
    result: Optional[Any] = None
    raw_payload: Optional[Any] = None


class YoutubeContentReportCreate(YoutubeContentReportBase):
    pass


class YoutubeContentReportUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    dimensions: Optional[List[str]] = None
    filters: Optional[List[str]] = None
    result: Optional[Any] = None
    raw_payload: Optional[Any] = None


class YoutubeContentReportResponse(YoutubeContentReportBase, TimestampMixin):
    report_id: UUID
