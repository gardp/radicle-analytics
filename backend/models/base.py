from sqlalchemy.orm import DeclarativeBase, mapped_column
from sqlalchemy import DateTime
from datetime import datetime, timezone

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    """Mixin to add created_at and updated_at to every table."""
    created_at = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = mapped_column(
        DateTime, 
        default=lambda: datetime.now(timezone.utc), 
        onupdate=lambda: datetime.now(timezone.utc)
    )