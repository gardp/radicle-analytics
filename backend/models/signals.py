from unittest import result
from sqlalchemy import Column, Integer, String, ForeignKey, Interval, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin
from datetime import datetime

#INSTAGRAM
class InstagramProfileInsights(Base, TimestampMixin): # table for instagram profile insights
    __tablename__ = 'instagram_profile_insights'
    
    insight_id = Column(UUID, primary_key=True)
    reach = Column(Integer)
    impressions_count = Column(Integer)
    profile_views_count = Column(Integer)
    medica_count = Column(Integer)
    follower_growth = Column(Integer)
    profile_links_taps = Column(Integer)
    raw_payload = Column(JSON) #data returned from the api

class InstagramMediaInsights(Base, TimestampMixin): # table for instagram media insights
    __tablename__ = 'instagram_media_insights'
    
    insight_id = Column(UUID, primary_key=True)
    caption = Column(String)
    media_id = Column(String)
    media_type = Column(String)
    media_url = Column(String)
    permalink = Column(String)
    reach = Column(Integer)
    impressions_count = Column(Integer)
    saved = Column(Integer)
    reels_plays = Column(Integer)
    ig_reels_avg_watch_time = Column(Interval) #duraion
    ig_reels_skip_rate = Column(Integer)
    crossposted_views = Column(Integer)
    views = Column(Integer)
    likes = Column(Integer)
    shares = Column(Integer) #
    total_interactions = Column(Integer, help_text="Number of likes, saves, comments, and shares on the reel, minus the number of unlikes, unsaves, and deleted comments")
    navigation = Column(Integer, help_text="This is the total number of actions taken from your story. These are made up of metrics like exited, forward, back and next story.")
    story_navigation_action_type = Column(JSON, help_text="Break down results by navigation action taken by the viewer upon viewing the media within the native app")
    plays = Column(Integer, help_text="Number of times the reels starts to play after an impression is already counted.")
    profile_activity = Column(Integer, help_text="The number of actions people take when they visit your profile after engaging with your post")
    action_type = Column(JSON, help_text="The type of action taken by the user")
    impressions = Column(Integer)
    engagement_count = Column(Integer)
    comments_count = Column(Integer)
    replies = Column(Integer)
    comments = Column(JSON)
    follower_growth = Column(Integer)
    profile_links_taps = Column(Integer)
    audience_demographics = Column(JSON)
    raw_payload = Column(JSON, help_text="Data returned from the api")

# https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info?enter_method=left_navigation
class TiktokProfileInsight(Base, TimestampMixin):
    __tablename__ = 'tiktok_profile_insights'
    
    insight_id = Column(UUID, primary_key=True) #for database reference
    avatar_url = Column(String, help_text="The URL of the TikTok profile avatar")
    bio_description = Column(String, help_text="The bio description of the TikTok profile")
    profile_deep_link = Column(String, help_text="The link to user's TikTok profile page")
    username = Column(String, help_text="The username of the TikTok profile")
    followers_count = Column(Integer, help_text="The number of followers the profile has.")
    following_count = Column(Integer, help_text="The number of accounts the profile is following.")
    likes_count = Column(Integer, help_text="The number of likes the profile has.")
    videos_count = Column(Integer, help_text="The number of videos the profile has.")
    raw_payload = Column(JSON, help_text="Data returned from the api")

class TiktokMediaInsights(Base, TimestampMixin):
    __tablename__ = 'tiktok_media_insights'
    
    insight_id = Column(UUID, primary_key=True) #for database reference
    media_id = Column(String, help_text="The ID of the TikTok media")
    cover_image_url = Column(String, help_text="A CDN link for the video's cover image. ")
    video_description = Column(String, help_text="The description of the video.")
    duration = Column(Interval, help_text="The duration of the video in seconds.")
    title = Column(String, help_text="The title of the video.")
    like_count = Column(Integer, help_text="The number of likes the video has received.")
    comment_count = Column(Integer, help_text="The number of comments the video has received.")
    share_count = Column(Integer, help_text="The number of shares the video has received.")
    views_count = Column(Integer, help_text="The number of views the video has received.")
    

# class InstagramCommentsMentionsInsights(Base, TimestampMixin):
#     __tablename__ = 'instagram_comments_mentions_insights'
    
#     insight_id = Column(UUID, primary_key=True)
#     text = Column(String, help_text="The text of the comment where the mention happened")
#     media_id = Column(String, help_text="The ID of the parent post where the comment lives (allowing you to see the context)")
#     owner = Column(String, help_text="The owner of the post where the mention happened")
#     raw_payload = Column(JSON, help_text="Data returned from the api")

class InstagramHashtags(Base, TimestampMixin):
    __tablename__ = 'instagram_hashtags'
    
    insight_id = Column(UUID, primary_key=True)
    hashtag = Column(String, help_text="The hashtag used in the post")
    raw_payload = Column(JSON, help_text="Data returned from the api")

#TWITTER/X
class TwitterXContentInsights(Base, TimestampMixin):
    __tablename__ = 'twitter_x_content_insights'
    
    insight_id = Column(UUID, primary_key=True)
    content = Column(JSON, help_text="The content of the post")
    raw_payload = Column(JSON, help_text="Data returned from the api")

class TwitterXPublicMetrics(Base, TimestampMixin):
    __tablename__ = 'twitter_x_public_metrics'
    
    insight_id = Column(UUID, primary_key=True)
    retweet_count = Column(Integer)
    reply_count = Column(Integer)
    like_count = Column(Integer)
    quote_count = Column(Integer)
    bookmark_count = Column(Integer)
    raw_payload = Column(JSON, help_text="Data returned from the api")

class TwitterXUserMetrics(Base, TimestampMixin):
    __tablename__ = 'twitter_x_user_metrics'
    
    insight_id = Column(UUID, primary_key=True)
    impressions = Column(Integer)
    engagements = Column(JSON)
    raw_payload = Column(JSON, help_text="Data returned from the api")

class TwitterXMentions(Base, TimestampMixin):
    __tablename__ = 'twitter_x_mentions'
    
    insight_id = Column(UUID, primary_key=True)
    mentions = Column(JSON, help_text="The mentions in the post")
    owner = Column(JSON, help_text="The owner of the post")
    raw_payload = Column(JSON, help_text="Data returned from the api")

# https://developers.google.com/youtube/analytics/dimensions
# https://developers.google.com/youtube/analytics/metrics
class YoutubeChannelReport(Base, TimestampMixin):
    __tablename__ = 'youtube_channel_reports'
    dimensions = Column(ARRAY(String), help_text="The dimension of the report")
    filters = Column(ARRAY(String), help_text="The filters of the report")
    result = Column(JSON, help_text="The result of the report")
    raw_payload = Column(JSON, help_text="Data returned from the api")


class YoutubeContentReport(Base, TimestampMixin):
    __tablename__ = 'youtube_video_reports'
    dimensions = Column(ARRAY(String), help_text="The dimension of the report")
    filters = Column(ARRAY(String), help_text="The filters of the report")
    result = Column(JSON, help_text="The result of the report")
    raw_payload = Column(JSON, help_text="Data returned from the api")

