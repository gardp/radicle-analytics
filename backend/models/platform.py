from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean, Enum as SAEnum, Text, UUID, JSON, Integer
from enum import Enum as PyEnum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from .base import Base, TimestampMixin
from datetime import datetime
# Enum for platform types
class PlatformType(str, PyEnum):
    DISTRIBUTION = "distribution"
    ADMIN = "admin"
    TOOL = "tool"
    PROMOTION = "promotion"
    ANALYTICS = "analytics"

# creating the platform table as a base for all platforms such as instagram, thread...etc
class Platform(Base, TimestampMixin):
    __tablename__ = 'platforms'
    
    platform_id = Column(UUID, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    type = Column(SAEnum(PlatformType, name='platform_type'))
    description = Column(String, nullable=True)
    url = Column(String, nullable=True)
    account_data = Column(String, nullable=True) # Required for polymorphic relationship

    __mapper_args__ = {
        'polymorphic_identity': 'platform_base',
        'polymorphic_on': account_data
    }
    updated_at = Column(DateTime, nullable=True, default=datetime.utcnow)
    is_active = Column(Boolean, nullable=True, default=True)
    notes = Column(String, nullable=True)

    # Define relationships
    instructions = relationship("Instruction", back_populates="platform") # one to many relationship
    royalties = relationship("Royalty", back_populates="platform")

#INSTAGRAM 
# creating the platform parameter table...not sure yet so to review
class InstagramAccount(Platform, TimestampMixin):
    __tablename__ = 'instagram_accounts'
    
    account_id = Column(UUID, ForeignKey("platforms.platform_id"), primary_key=True)
    username = Column(String, nullable=True) # instagram username
    profile_picture_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    bio_url = Column(String, nullable=True)
    followers_count = Column(Integer, nullable=True, default=0)
    following_count = Column(Integer, nullable=True, default=0)
    total_media_count = Column(Integer, nullable=True, default=0)
    account_type = Column(String, nullable=True) # personal or business...provided by the api
    raw_payload = Column(JSON, nullable=True)
    
    __mapper_args__ = {
        'polymorphic_identity': 'instagram',
    }
    
    # Relationships are inherited from Platform

#TWITTER/X
class TwitterXAccount(Platform, TimestampMixin):
    __tablename__ = 'twitter_accounts'
    
    account_id = Column(UUID, ForeignKey("platforms.platform_id"), primary_key=True)
    username = Column(String, nullable=True) # twitter username
    bio = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    pinned_post_id = Column(JSON, nullable=True)
    post_count = Column(Integer, nullable=True, default=0)
    list_count = Column(Integer, nullable=True, default=0)
    followers_count = Column(Integer, nullable=True, default=0)
    following_count = Column(Integer, nullable=True, default=0)
    verified_status = Column(SAEnum('verified', 'not_verified', 'pending', name='verified_status'), nullable=True)
    account_type = Column(String, nullable=True) # personal or business...provided by the api
    raw_payload = Column(JSON, nullable=True)
    
    __mapper_args__ = {
        'polymorphic_identity': 'twitter',
    }
    
    # Relationships are inherited from Platform

class TiktokAccount(Platform, TimestampMixin):
    __tablename__ = 'tiktok_accounts'
    
    account_id = Column(UUID, ForeignKey("platforms.platform_id"), primary_key=True)
    username = Column(String, nullable=True) # tiktok username
    bio = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    pinned_post_id = Column(JSON, nullable=True)
    post_count = Column(Integer, nullable=True, default=0)
    list_count = Column(Integer, nullable=True, default=0)
    followers_count = Column(Integer, nullable=True, default=0)
    following_count = Column(Integer, nullable=True, default=0)
    verified_status = Column(SAEnum('verified', 'not_verified', 'pending', name='verified_status'), nullable=True)
    account_type = Column(String, nullable=True) # personal or business...provided by the api
    raw_payload = Column(JSON, nullable=True)
    
    __mapper_args__ = {
        'polymorphic_identity': 'tiktok',
    }
    
    # Relationships are inherited from Platform

class YoutubeAccount(Platform, TimestampMixin):
    __tablename__ = 'youtube_accounts'
    
    account_id = Column(UUID, ForeignKey("platforms.platform_id"), primary_key=True)
    username = Column(String, nullable=True) # youtube username
    bio = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    pinned_post_id = Column(JSON, nullable=True)
    post_count = Column(Integer, nullable=True, default=0)
    list_count = Column(Integer, nullable=True, default=0)
    followers_count = Column(Integer, nullable=True, default=0)
    following_count = Column(Integer, nullable=True, default=0)
    verified_status = Column(SAEnum('verified', 'not_verified', 'pending', name='verified_status'), nullable=True)
    account_type = Column(String, nullable=True) # personal or business...provided by the api
    raw_payload = Column(JSON, nullable=True)
    
    __mapper_args__ = {
        'polymorphic_identity': 'youtube',
    }
    
    # Relationships are inherited from Platform
    