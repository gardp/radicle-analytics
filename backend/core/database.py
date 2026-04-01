"""Async SQLAlchemy engine, session factory, and FastAPI dependency."""

import re

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from .config import settings

_url = settings.DATABASE_URL
if _url.startswith("postgresql://") or _url.startswith("postgresql+psycopg2://"):
    _url = re.sub(r"^postgresql(\+psycopg2)?://", "postgresql+asyncpg://", _url)

# asyncpg expects `ssl=...` while many Postgres URLs (including Supabase examples)
# use `sslmode=...`. Translate to avoid: TypeError unexpected keyword argument 'sslmode'.
_url = re.sub(r"([?&])sslmode=", r"\1ssl=", _url)

engine = create_async_engine(_url, echo=False, future=True)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db():
    """FastAPI dependency that yields an async database session."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
