
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession
)
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


database_url = make_url(settings.DATABASE_URL)

database_url = database_url.set(
    drivername="postgresql+asyncpg"
).difference_update_query(
    ["sslmode", "channel_binding"]
)


engine = create_async_engine(
    database_url,
    connect_args={"ssl": "require"},
    pool_pre_ping=True
)


# Base class for all database models
class Base(DeclarativeBase):
    pass


# Reusable asynchronous session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)


# Database dependency for FastAPI endpoints
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
