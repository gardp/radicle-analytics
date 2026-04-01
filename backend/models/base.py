from sqlalchemy.orm import DeclarativeBase, mapped_column
from sqlalchemy import DateTime
from datetime import datetime

class Base(DeclarativeBase):
    pass

class TimestampMixin:
    """Mixin to add created_at and updated_at to every table."""
    created_at = mapped_column(DateTime, default=datetime.utcnow)
    updated_at = mapped_column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow
    )