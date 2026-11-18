
from fastapi import FastAPI
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine
from app.api.auth import router as auth_router
from app.api.shop import router as shop_router
from app.api.customer import router as customer_router


app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Business Credit and Ledger Management System",
    version="1.0.0",
    debug=settings.DEBUG
)


app.include_router(
    auth_router,
    prefix=settings.API_V1_PREFIX
)

app.include_router(
    shop_router,
    prefix=settings.API_V1_PREFIX
)


app.include_router(
    customer_router,
    prefix=settings.API_V1_PREFIX
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





@app.get("/health/db/tables")
async def verify_database_tables():

    async with engine.connect() as connection:

        result = await connection.execute(
            text("""
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name IN (
                    'users',
                    'shops',
                    'customers',
                    'transactions',
                    'customer_behaviour',
                    'notifications'
                )
                ORDER BY table_name;
            """)
        )

        tables = result.scalars().all()

        expected_tables = {
            "users",
            "shops",
            "customers",
            "transactions",
            "customer_behaviour",
            "notifications"
        }

        return {
            "status": "success",
            "tables_found": tables,
            "count": len(tables),
            "all_tables_created": expected_tables.issubset(set(tables))
        }



@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()



