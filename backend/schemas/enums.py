"""Pydantic-compatible enum mirrors of all SQLAlchemy model enums."""

from enum import Enum


# ---------------------------------------------------------------------------
# content.py
# ---------------------------------------------------------------------------

class EngagementPhase(str, Enum):
    AWARENESS = "awareness"
    INTEREST = "interest"
    CONSIDERATION = "consideration"
    INTENT = "intent"
    EVALUATION = "evaluation"
    PURCHASE = "purchase"


class MediaType(str, Enum):
    PHOTO = "photo"
    VIDEO = "video"
    CAROUSEL = "carousel"
    TEXT = "text"
    GIF = "gif"
    OTHER = "other"


class TrackFormat(str, Enum):
    MP3 = "mp3"
    WAV = "wav"
    FLAC = "flac"
    AIFF = "aiff"
    OTHER = "other"


# ---------------------------------------------------------------------------
# platform.py
# ---------------------------------------------------------------------------

class PlatformType(str, Enum):
    DISTRIBUTION = "distribution"
    ADMIN = "admin"
    TOOL = "tool"
    PROMOTION = "promotion"
    ANALYTICS = "analytics"


class VerifiedStatus(str, Enum):
    VERIFIED = "verified"
    NOT_VERIFIED = "not_verified"
    PENDING = "pending"


# ---------------------------------------------------------------------------
# action.py
# ---------------------------------------------------------------------------

class ActionStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


# ---------------------------------------------------------------------------
# instruction.py
# ---------------------------------------------------------------------------

class InstructionPhase(str, Enum):
    PRE = "pre"
    DURING = "during"
    POST = "post"
    VARIOUS = "various"


class TimePeriod(str, Enum):
    DEFINITE = "definite"
    INDEFINITE = "indefinite"


class FrequencyType(str, Enum):
    RECURRING = "recurring"
    ONE_TIME = "one-time"


class KnowledgeResourceCategory(str, Enum):
    BOOK = "book"
    DOCUMENT = "document"
    GUIDE = "guide"
    FRAMEWORK = "framework"
    CASE_STUDY = "case_study"
    OTHER = "other"


class KnowledgeResourceFormat(str, Enum):
    PROMPT = "prompt"
    URL = "url"
    TEXT = "text"


class IngestionMethod(str, Enum):
    MANUAL = "manual"


# ---------------------------------------------------------------------------
# royalties.py
# ---------------------------------------------------------------------------

class RoyaltyRight(str, Enum):
    MASTER = "Master"
    RECORDING = "Recording"


class RoyaltyType(str, Enum):
    MECHANICAL = "Mechanical"
    PERFORMANCE = "Performance"
    SYNCHRONIZATION = "Synchronization"
    NEIGHBORING = "Neighboring"
    REPRODUCTION = "Reproduction"
    DIGITAL = "Digital"
    PHYSICAL = "Physical"
