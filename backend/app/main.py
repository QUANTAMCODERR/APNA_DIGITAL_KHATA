
from fastapi import FastAPI
from app.core.config import settings

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
        "environment": settings.APP_ENV,
        "status": "success"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy"
    }
