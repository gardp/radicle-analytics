from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Enum as SAEnum, Text, UUID, JSON
from enum import Enum as PyEnum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from .platform import Platform
from .base import Base, TimestampMixin
import uuid
from datetime import datetime

class Content(Base, TimestampMixin):
    __tablename__ = 'content'
    
    content_id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    name = Column(String, nullable=True)

    type = Column(String) # Required for polymorphic relationship- Instagram post, reels, shorts, twitter tweet...etc
    __mapper_args__ = {
        'polymorphic_identity': 'content_base',
        'polymorphic_on': type
    }
    description = Column(String, nullable=True) 
    url = Column(String, nullable=True) # URL to the content
    goals = Column(String, nullable=True) #will be a foreign key later
    engagement_phase = Column(SAEnum('awareness', 'interest', 'consideration', 'intent', 'evaluation', 'purchase', name='engagement_phase_enum'), default='awareness')
    is_active = Column(Boolean, nullable=True, default=True)
    notes = Column(String, nullable=True)
    track_id = Column(UUID(as_uuid=True), ForeignKey("track.track_id"), nullable=True)
    
    # Define relationships
    instructions = relationship("Instruction", back_populates="content")
    actions = relationship("Action", back_populates="content")
    success_metrics = relationship("SuccessMetrics", back_populates="content")
    track = relationship("Track", back_populates="contents")

class MediaType(PyEnum):
    PHOTO = "photo"
    VIDEO = "video"
    CAROUSEL = "carousel"
    TEXT = "text"
    GIF = "gif"
    OTHER = "other"
    
class InstagramPost(Content):
    __tablename__ = 'instagram_content'
    __mapper_args__ = {'polymorphic_identity': 'instagram_post'}
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    post_type = Column(SAEnum(MediaType, name='media_type_enum'), nullable=True, default=MediaType.PHOTO) # Media Type: photo, video, carousel, etc.
    caption = Column(Text, nullable=True)
    timestamp = Column(DateTime, nullable=True)
    permalink = Column(String, nullable=True)
    likes_count = Column(Integer, nullable=True, default=0)
    shares_count = Column(Integer, nullable=True, default=0)
    comments_count = Column(Integer, nullable=True, default=0)
    saves_count = Column(Integer, nullable=True, default=0)
    comments = Column(JSON, nullable=True) # List of comment objects
    instagram_notes = Column(String, nullable=True)

class InstagramStory(Content):
    __tablename__ = 'instagram_story'
    __mapper_args__ = {'polymorphic_identity': 'instagram_story'}
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    likes_count = Column(Integer, nullable=True, default=0)
    shares_count = Column(Integer, nullable=True, default=0)
    comments_count = Column(Integer, nullable=True, default=0)
    instagram_story_is_active = Column(Boolean, nullable=True, default=True)
    instagram_story_notes = Column(String, nullable=True)

class InstagramReel(Content):
    __tablename__ = 'instagram_reel'
    __mapper_args__ = {'polymorphic_identity': 'instagram_reel'}
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    instagram_reel_url = Column(String, nullable=True)
    likes_count = Column(Integer, nullable=True, default=0)
    shares_count = Column(Integer, nullable=True, default=0)
    comments_count = Column(Integer, nullable=True, default=0)
    saves_count = Column(Integer, nullable=True, default=0)
    instagram_reel_is_active = Column(Boolean, nullable=True, default=True)
    instagram_reel_notes = Column(String, nullable=True)

class TwitterXPost(Content):
    __tablename__ = 'twitter_x_content'
    __mapper_args__ = {'polymorphic_identity': 'twitter_x_post'}
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    twitter_x_content_url = Column(String, nullable=True)
    likes_count = Column(Integer, nullable=True, default=0)
    shares_count = Column(Integer, nullable=True, default=0)
    comments_count = Column(Integer, nullable=True, default=0)
    twitter_x_content_is_active = Column(Boolean, nullable=True, default=True)
    twitter_x_notes = Column(String, nullable=True)

class RedditPost(Content):
    __tablename__ = 'reddit_content'
    __mapper_args__ = {'polymorphic_identity': 'reddit_post'}
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    reddit_content_url = Column(String, nullable=True)
    likes_count = Column(Integer, nullable=True, default=0)
    shares_count = Column(Integer, nullable=True, default=0)
    comments_count = Column(Integer, nullable=True, default=0)
    reddit_content_is_active = Column(Boolean, nullable=True, default=True)
    reddit_notes = Column(String, nullable=True)

class ThreadPost(Content):
    __tablename__ = 'thread_content'
    __mapper_args__ = {'polymorphic_identity': 'thread_post'}
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    thread_content_url = Column(String, nullable=True)
    likes_count = Column(Integer, nullable=True, default=0)
    shares_count = Column(Integer, nullable=True, default=0)
    comments_count = Column(Integer, nullable=True, default=0)
    saves_count = Column(Integer, nullable=True, default=0)
    thread_content_is_active = Column(Boolean, nullable=True, default=True)
    thread_notes = Column(String, nullable=True)

class BlueskyPost(Content):
    __tablename__ = 'bluesky_content'
    __mapper_args__ = {'polymorphic_identity': 'bluesky_post'}
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    bluesky_content_url = Column(String, nullable=True)
    likes_count = Column(Integer, nullable=True, default=0)
    shares_count = Column(Integer, nullable=True, default=0)
    comments_count = Column(Integer, nullable=True, default=0)
    bluesky_content_is_active = Column(Boolean, nullable=True, default=True)
    bluesky_notes = Column(String, nullable=True)

class YoutubeVideo(Content):
    __tablename__ = 'youtube_content'
    __mapper_args__ = {'polymorphic_identity': 'youtube_video'}
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    youtube_content_url = Column(String, nullable=True)
    youtube_content_id = Column(String, nullable=True, unique=True)
    views_count = Column(Integer, nullable=True, default=0)
    likes_count = Column(Integer, nullable=True, default=0)
    comments_count = Column(Integer, nullable=True, default=0)
    youtube_content_is_active = Column(Boolean, nullable=True, default=True)
    youtube_notes = Column(String, nullable=True)

class YoutubeShort(Content):
    __tablename__ = 'youtube_short'
    __mapper_args__ = {'polymorphic_identity': 'youtube_short'}
    
    content_id = Column(UUID, ForeignKey('content.content_id'), primary_key=True)
    youtube_short_url = Column(String, nullable=True)
    youtube_short_is_active = Column(Boolean, nullable=True, default=True)
    youtube_short_notes = Column(String, nullable=True)

class SuccessMetrics(Base):
    __tablename__ = 'success_metrics'
    
    success_metrics_id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    success_metrics_name = Column(String, nullable=True)
    success_metrics_description = Column(String, nullable=True)
    target_value = Column(Integer, nullable=True)
    target_value_unit = Column(String, nullable=True)
    success_metrics_is_active = Column(Boolean, nullable=True, default=True)
    success_metrics_notes = Column(String, nullable=True)

    # Define relationships
    content_id = Column(UUID(as_uuid=True), ForeignKey("content.content_id"))
    content = relationship("Content", back_populates="success_metrics")

class Track(Base):
    __tablename__ = 'track'
    
    track_id = Column(UUID, primary_key=True, index=True, default=uuid.uuid4)
    track_file_path = Column(String, nullable=True)
    track_title = Column(String, nullable=True)
    track_description = Column(Text, nullable=True)
    format = Column(SAEnum("mp3", "wav", "flac", "aiff", "other", name='format_enum'), nullable=True)
    bitrate = Column(Integer, nullable=True)
    sample_rate = Column(Integer, nullable=True)
    version_subtitle = Column(String, nullable=True)
    release_date = Column(DateTime, nullable=True)
    isrc = Column(String, nullable=True)
    iwc = Column(String, nullable=True)
    upc = Column(String, nullable=True)
    lyrics = Column(Text, nullable=True)
    bpm = Column(Integer, nullable=True)
    key = Column(String, nullable=True)
    genres = Column(JSON, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    moods = Column(JSON, nullable=True)
    keyword_tags = Column(JSON, nullable=True)
    track_notes = Column(String, nullable=True)

    # Define relationships
    contents = relationship("Content", back_populates="track")
    instructions = relationship("Instruction", back_populates="track")
