from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum, Text, UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from platforms import Platform
from .base import Base, TimestampMixin
import uuid
from datetime import datetime

class Content(Base, TimestampMixin):
    __tablename__ = 'content'
    
    content_id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String, unique=True, index=True)

    type = Column(String) # Required for polymorphic relationship- Instagram post, reels, shorts, twitter tweet...etc
    __mapper_args__ = {
        'polymorphic_identity': 'content_base',
        'polymorphic_on': content_type
    }
    description = Column(String) 
    url = Column(String) # URL to the content
    goals = Column(String) #will be a foreign key later
    engagement_phase = Column(Enum('awareness', 'interest', 'consideration', 'intent', 'evaluation', 'purchase'))
    is_active = Column(Boolean)
    notes = Column(String)
    
    # Define relationships
    actions = relationship("Action", back_populates="content")
    success_metrics = relationship("Success_Metrics", back_populates="content")

class MediaType(Enum):
    PHOTO = "photo"
    VIDEO = "video"
    CAROUSEL = "carousel"
    TEXT = "text"
    GIF = "gif"
    OTHER = "other"
    
class InstagramPost(Content):
    __tablename__ = 'instagram_content'
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    post_type = Column(Enum(MediaType)) # Media Type: photo, video, carousel, etc.
    caption = Column(Text)
    timestamp = Column(DateTime)
    permalink = Column(String)
    likes_count = Column(Integer)
    shares_count = Column(Integer)
    comments_count = Column(Integer)
    saves_count = Column(Integer)
    comments = Column(JSON) # List of comment objects
    instagram_notes = Column(String)

class InstagramStory(Content):
    __tablename__ = 'instagram_story'
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    likes_count = Column(Integer)
    shares_count = Column(Integer)
    comments_count = Column(Integer)
    instagram_story_is_active = Column(Boolean)
    instagram_story_notes = Column(String)

class InstagramReel(Content):
    __tablename__ = 'instagram_reel'
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    instagram_reel_url = Column(String)
    likes_count = Column(Integer)
    shares_count = Column(Integer)
    comments_count = Column(Integer)
    saves_count = Column(Integer)
    instagram_reel_is_active = Column(Boolean)
    instagram_reel_notes = Column(String)

class TwitterXPost(Content):
    __tablename__ = 'twitter_x_content'
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    twitter_x_content_url = Column(String)
    likes_count = Column(Integer)
    shares_count = Column(Integer)
    comments_count = Column(Integer)
    twitter_x_content_is_active = Column(Boolean)
    twitter_x_notes = Column(String)

class RedditPost(Content):
    __tablename__ = 'reddit_content'
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    reddit_content_url = Column(String)
    likes_count = Column(Integer)
    shares_count = Column(Integer)
    comments_count = Column(Integer)
    reddit_content_is_active = Column(Boolean)
    reddit_notes = Column(String)

class ThreadPost(Content):
    __tablename__ = 'thread_content'
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    thread_content_url = Column(String)
    likes_count = Column(Integer)
    shares_count = Column(Integer)
    comments_count = Column(Integer)
    saves_count = Column(Integer)
    thread_content_is_active = Column(Boolean)
    thread_notes = Column(String)

class BlueskyPost(Content):
    __tablename__ = 'bluesky_content'
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    bluesky_content_url = Column(String)
    likes_count = Column(Integer)
    shares_count = Column(Integer)
    comments_count = Column(Integer)
    bluesky_content_is_active = Column(Boolean)
    bluesky_notes = Column(String)

class YoutubeVideo(Content):
    __tablename__ = 'youtube_content'
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    youtube_content_url = Column(String)
    views_count = Column(Integer)
    likes_count = Column(Integer)
    comments_count = Column(Integer)
    youtube_content_is_active = Column(Boolean)
    youtube_notes = Column(String)

class YoutubeShort(Content):
    __tablename__ = 'youtube_short'
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    youtube_short_url = Column(String)
    youtube_short_is_active = Column(Boolean)
    youtube_short_notes = Column(String)

class SuccessMetrics(Base):
    __tablename__ = 'success_metrics'
    
    success_metrics_id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    success_metrics_name = Column(String)
    success_metrics_description = Column(String)
    target_value = Column(Integer)
    target_value_unit = Column(String)
    success_metrics_is_active = Column(Boolean)
    success_metrics_notes = Column(String)

    # Define relationships
    content_id = Column(UUID(as_uuid=True), ForeignKey("content.content_id"))
    content = relationship("Content", back_populates="success_metrics")
