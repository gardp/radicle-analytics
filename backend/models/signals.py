from sqlalchemy import Column, Integer, String, ForeignKey, Interval, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
import uuid
from datetime import datetime, timedelta

#INSTAGRAM
class InstagramProfileInsights(Base, TimestampMixin): # table for instagram profile insights
    __tablename__ = 'instagram_profile_insights'
    
    insight_id = Column(UUID, primary_key=True)
    reach = Column(Integer, nullable=True, default=0)
    impressions_count = Column(Integer, nullable=True, default=0)
    profile_views_count = Column(Integer, nullable=True, default=0)
    medica_count = Column(Integer, nullable=True, default=0)
    follower_growth = Column(Integer, nullable=True, default=0)
    profile_links_taps = Column(Integer, nullable=True, default=0)
    raw_payload = Column(JSON) #data returned from the api

class InstagramMediaInsights(Base, TimestampMixin): # table for instagram media insights
    __tablename__ = 'instagram_media_insights'
    
    insight_id = Column(UUID, primary_key=True)
    caption = Column(String, nullable=True)
    media_id = Column(String, nullable=True)
    media_type = Column(String, nullable=True)
    media_url = Column(String, nullable=True)
    permalink = Column(String, nullable=True)
    reach = Column(Integer, nullable=True, default=0)
    impressions_count = Column(Integer, nullable=True, default=0)
    saved = Column(Integer, nullable=True, default=0)
    reels_plays = Column(Integer, nullable=True, default=0)
    ig_reels_avg_watch_time = Column(Interval, nullable=True, default=timedelta) #duraion
    ig_reels_skip_rate = Column(Integer, nullable=True, default=0)
    crossposted_views = Column(Integer, nullable=True, default=0)
    views = Column(Integer, nullable=True, default=0)
    likes = Column(Integer, nullable=True, default=0)
    shares = Column(Integer, nullable=True, default=0) #
    total_interactions = Column(Integer, nullable=True, default=0, comment="Number of likes, saves, comments, and shares on the reel, minus the number of unlikes, unsaves, and deleted comments")
    navigation = Column(Integer, nullable=True, default=0, comment="This is the total number of actions taken from your story. These are made up of metrics like exited, forward, back and next story.")
    story_navigation_action_type = Column(JSON, nullable=True, default=0, comment="Break down results by navigation action taken by the viewer upon viewing the media within the native app")
    plays = Column(Integer, nullable=True, default=0, comment="Number of times the reels starts to play after an impression is already counted.")
    profile_activity = Column(Integer, nullable=True, default=0, comment="The number of actions people take when they visit your profile after engaging with your post")
    action_type = Column(JSON, nullable=True, default=0, comment="The type of action taken by the user")
    impressions = Column(Integer, nullable=True, default=0)
    engagement_count = Column(Integer, nullable=True, default=0)
    comments_count = Column(Integer, nullable=True, default=0)
    replies = Column(Integer, nullable=True)
    comments = Column(JSON, nullable=True)
    follower_growth = Column(Integer, nullable=True)
    profile_links_taps = Column(Integer, nullable=True)
    audience_demographics = Column(JSON, nullable=True)
    raw_payload = Column(JSON, nullable=True, comment="Data returned from the api")

# https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info?enter_method=left_navigation
class TiktokProfileInsight(Base, TimestampMixin):
    __tablename__ = 'tiktok_profile_insights'
    
    insight_id = Column(UUID, primary_key=True) #for database reference
    avatar_url = Column(String, nullable=True, comment="The URL of the TikTok profile avatar")
    bio_description = Column(String, nullable=True, comment="The bio description of the TikTok profile")
    profile_deep_link = Column(String, nullable=True, comment="The link to user's TikTok profile page")
    username = Column(String, nullable=True, comment="The username of the TikTok profile")
    followers_count = Column(Integer, nullable=True, comment="The number of followers the profile has.")
    following_count = Column(Integer, nullable=True, comment="The number of accounts the profile is following.")
    likes_count = Column(Integer, default=0, nullable=True, comment="The number of likes the profile has.")
    videos_count = Column(Integer, default=0, nullable=True, comment="The number of videos the profile has.")
    raw_payload = Column(JSON, nullable=True, comment="Data returned from the api")

class TiktokMediaInsights(Base, TimestampMixin):
    __tablename__ = 'tiktok_media_insights'
    
    insight_id = Column(UUID, primary_key=True) #for database reference
    media_id = Column(String, nullable=True, comment="The ID of the TikTok media")
    cover_image_url = Column(String, nullable=True, comment="A CDN link for the video's cover image. ")
    video_description = Column(String, nullable=True, comment="The description of the video.")
    duration = Column(Interval, nullable=True, comment="The duration of the video in seconds.")
    title = Column(String, nullable=True, comment="The title of the video.")
    like_count = Column(Integer, default=0, nullable=True, comment="The number of likes the video has received.")
    comment_count = Column(Integer, default=0, nullable=True, comment="The number of comments the video has received.")
    share_count = Column(Integer, default=0, nullable=True, comment="The number of shares the video has received.")
    views_count = Column(Integer, default=0, nullable=True, comment="The number of views the video has received.")
    

# class InstagramCommentsMentionsInsights(Base, TimestampMixin):
#     __tablename__ = 'instagram_comments_mentions_insights'
    
#     insight_id = Column(UUID, primary_key=True)
#     text = Column(String, help_text="The text of the comment where the mention happened")
#     media_id = Column(String, help_text="The ID of the parent post where the comment lives (allowing you to see the context)")
#     owner = Column(String, help_text="The owner of the post where the mention happened")
#     raw_payload = Column(JSON, comment="Data returned from the api")

class InstagramHashtags(Base, TimestampMixin):
    __tablename__ = 'instagram_hashtags'
    
    insight_id = Column(UUID, primary_key=True)
    hashtag = Column(String, nullable=True, comment="The hashtag used in the post")
    raw_payload = Column(JSON, nullable=True, comment="Data returned from the api")

#TWITTER/X
class TwitterXContentInsights(Base, TimestampMixin):
    __tablename__ = 'twitter_x_content_insights'
    
    insight_id = Column(UUID, primary_key=True)
    content = Column(JSON, nullable=True, comment="The content of the post")
    raw_payload = Column(JSON, nullable=True, comment="Data returned from the api")

class TwitterXPublicMetrics(Base, TimestampMixin):
    __tablename__ = 'twitter_x_public_metrics'
    
    insight_id = Column(UUID, primary_key=True)
    retweet_count = Column(Integer, nullable=True)
    reply_count = Column(Integer, nullable=True)
    like_count = Column(Integer, nullable=True)
    quote_count = Column(Integer, nullable=True)
    bookmark_count = Column(Integer, nullable=True)
    raw_payload = Column(JSON, nullable=True, comment="Data returned from the api")

class TwitterXUserMetrics(Base, TimestampMixin):
    __tablename__ = 'twitter_x_user_metrics'
    
    insight_id = Column(UUID, primary_key=True)
    impressions = Column(Integer, nullable=True, default=0, comment="The number of impressions of the post")
    engagements = Column(JSON, nullable=True, comment="The engagements of the post")
    raw_payload = Column(JSON, nullable=True, comment="Data returned from the api")

class TwitterXMentions(Base, TimestampMixin):
    __tablename__ = 'twitter_x_mentions'
    
    insight_id = Column(UUID, primary_key=True)
    mentions = Column(JSON, nullable=True, comment="The mentions in the post")
    owner = Column(JSON, nullable=True, comment="The owner of the post")
    raw_payload = Column(JSON, nullable=True, comment="Data returned from the api")

# https://developers.google.com/youtube/analytics/dimensions
# https://developers.google.com/youtube/analytics/metrics
class YoutubeChannelReport(Base, TimestampMixin):
    __tablename__ = 'youtube_channel_reports'
    report_id = Column(UUID, primary_key=True, default=uuid.uuid4)
    dimensions = Column(ARRAY(String), nullable=True, comment="The dimension of the report")
    filters = Column(ARRAY(String), nullable=True, comment="The filters of the report")
    result = Column(JSON, nullable=True, comment="The result of the report")
    raw_payload = Column(JSON, nullable=True, comment="Data returned from the api")


class YoutubeContentReport(Base, TimestampMixin):
    __tablename__ = 'youtube_video_reports'
    report_id = Column(UUID, primary_key=True, default=uuid.uuid4)
    dimensions = Column(ARRAY(String), nullable=True, comment="The dimension of the report")
    filters = Column(ARRAY(String), nullable=True, comment="The filters of the report")
    result = Column(JSON, nullable=True, comment="The result of the report")
    raw_payload = Column(JSON, nullable=True, comment="Data returned from the api")

