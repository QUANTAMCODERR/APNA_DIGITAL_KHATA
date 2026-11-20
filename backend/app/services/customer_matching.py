
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.shop import Shop
from app.models.user import User

from app.schemas.voice import (
    CustomerMatchResponse,
    MatchedCustomerResponse
)


async def match_customer(
    customer_name: str,
    current_user: User,
    db: AsyncSession
) -> CustomerMatchResponse:

    result = await db.execute(
        select(Shop).where(
            Shop.owner_id == current_user.id
        )
    )

    shop = result.scalar_one_or_none()

    if shop is None:
        raise ValueError("Shop not found.")

    result = await db.execute(
        select(Customer).where(
            Customer.shop_id == shop.id,
            Customer.full_name.ilike(customer_name.strip())
        )
    )

    customers = result.scalars().all()

    matched_customers = [
        MatchedCustomerResponse.model_validate(customer)
        for customer in customers
    ]

    if not matched_customers:
        return CustomerMatchResponse(
            status="not_found",
            customers=[]
        )

    if len(matched_customers) > 1:
        return CustomerMatchResponse(
            status="multiple_matches",
            customers=matched_customers
        )

    return CustomerMatchResponse(
        status="matched",
        customers=matched_customers
    )
