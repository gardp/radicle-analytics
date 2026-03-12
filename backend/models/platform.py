from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean, Enum, Text, UUID, JSON, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column
from .base import Base, TimestampMixin

# Enum for platform types
class PlatformType(str, Enum):
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
    type = Column(Enum(PlatformType))
    description = Column(String)
    url = Column(String)
    account_data = Column(String) # Required for polymorphic relationship

    __mapper_args__ = {
        'polymorphic_identity': 'platform_base',
        'polymorphic_on': account_data
    }
    updated_at = Column(DateTime)
    is_active = Column(Boolean)
    notes = Column(String)

    # Define relationships
    instructions_id = Column(UUID, ForeignKey("instructions.instruction_id")) # one to one relationship
    instructions = relationship("Instruction", back_populates="platform") # one to one relationship
    parameters = relationship("PlatformParameter", back_populates="platform") # platform is the parent

#INSTAGRAM 
# creating the platform parameter table...not sure yet so to review
class InstagramAccount(Platform, TimestampMixin):
    __tablename__ = 'instagram_accounts'
    
    account_id = Column(UUID, ForeignKey("platforms.platform_id"), primary_key=True)
    name = Column(String) # maybe a page name or my name
    username = Column(String) # instagram username
    profile_picture_url = Column(String)
    bio = Column(String)
    bio_url = Column(String)
    followers_count = Column(Integer)
    following_count = Column(Integer)
    total_media_count = Column(Integer)
    account_type = Column(String) # personal or business...provided by the api
    is_active = Column(Boolean)
    raw_payload = Column(JSON)
    notes = Column(String)
    
    # Define relationships
    platform_id = Column(UUID, ForeignKey("platforms.platform_id"))
    platform = relationship("Platform", back_populates="platform_parameters")

#TWITTER/X
class TwitterXAccount(Platform, TimestampMixin):
    __tablename__ = 'twitter_accounts'
    
    account_id = Column(UUID, ForeignKey("platforms.platform_id"), primary_key=True)
    name = Column(String) # maybe a page name or my name
    username = Column(String) # twitter username
    bio = Column(String)
    profile_image_url = Column(String)
    pinned_post_id = Column(JSON)
    post_count = Column(Integer)
    list_count = Column(Integer)
    followers_count = Column(Integer)
    following_count = Column(Integer)
    verified_status = Column(Enum('verified', 'not_verified', 'pending', name='verified_status'))
    account_type = Column(String) # personal or business...provided by the api
    is_active = Column(Boolean)
    raw_payload = Column(JSON)
    notes = Column(String)
    
    # Define relationships
    platform_id = Column(UUID, ForeignKey("platforms.platform_id"))
    platform = relationship("Platform", back_populates="platform_parameters")

class TiktokAccount(Platform, TimestampMixin):
    __tablename__ = 'tiktok_accounts'
    
    account_id = Column(UUID, ForeignKey("platforms.platform_id"), primary_key=True)
    name = Column(String) # maybe a page name or my name
    username = Column(String) # tiktok username
    bio = Column(String)
    profile_image_url = Column(String)
    pinned_post_id = Column(JSON)
    post_count = Column(Integer)
    list_count = Column(Integer)
    followers_count = Column(Integer)
    following_count = Column(Integer)
    verified_status = Column(Enum('verified', 'not_verified', 'pending', name='verified_status'))
    account_type = Column(String) # personal or business...provided by the api
    is_active = Column(Boolean)
    raw_payload = Column(JSON)
    notes = Column(String)
    
    # Define relationships
    platform_id = Column(UUID, ForeignKey("platforms.platform_id"))
    platform = relationship("Platform", back_populates="platform_parameters")

class YoutubeAccount(Platform, TimestampMixin):
    __tablename__ = 'youtube_accounts'
    
    account_id = Column(UUID, ForeignKey("platforms.platform_id"), primary_key=True)
    name = Column(String) # maybe a page name or my name
    username = Column(String) # youtube username
    bio = Column(String)
    profile_image_url = Column(String)
    pinned_post_id = Column(JSON)
    post_count = Column(Integer)
    list_count = Column(Integer)
    followers_count = Column(Integer)
    following_count = Column(Integer)
    verified_status = Column(Enum('verified', 'not_verified', 'pending', name='verified_status'))
    account_type = Column(String) # personal or business...provided by the api
    is_active = Column(Boolean)
    raw_payload = Column(JSON)
    notes = Column(String)
    
    # Define relationships
    platform_id = Column(UUID, ForeignKey("platforms.platform_id"))
    platform = relationship("Platform", back_populates="platform_parameters")
    