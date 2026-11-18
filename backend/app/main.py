
from fastapi import FastAPI
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Business Credit and Ledger Management System",
    version="1.0.0",
    debug=settings.DEBUG
)


@app.get("/")
async def root():
    return {
        "message": f"{settings.APP_NAME} API is running!",
        "status": "success"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy"
    }


@app.get("/health/db")
async def database_health():

    async with engine.connect() as connection:

        result = await connection.execute(text("SELECT 1"))

        return {
            "status": "connected",
            "database": "Neon PostgreSQL",
            "result": result.scalar()
        }


@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()
