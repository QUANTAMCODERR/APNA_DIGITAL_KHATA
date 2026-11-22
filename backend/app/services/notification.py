
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.models.customer import Customer
from app.models.shop import Shop
from app.models.user import User


async def get_customer_notifications(
    customer_id,
    current_user: User,
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50
):
    # Verify that customer belongs to logged-in user's shop
    result = await db.execute(
        select(Customer.id)
        .join(Shop, Customer.shop_id == Shop.id)
        .where(
            Customer.id == customer_id,
            Shop.owner_id == current_user.id
        )
    )

    customer = result.scalar_one_or_none()

    if customer is None:
        raise ValueError("Customer not found in your shop")

    # Fetch notifications, newest first
    result = await db.execute(
        select(Notification)
        .where(Notification.customer_id == customer_id)
        .order_by(desc(Notification.created_at))
        .offset(skip)
        .limit(limit)
    )

    return result.scalars().all()




async def get_shop_notifications(
    current_user: User,
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50
):
    result = await db.execute(
        select(Notification)
        .join(Customer, Notification.customer_id == Customer.id)
        .join(Shop, Customer.shop_id == Shop.id)
        .where(Shop.owner_id == current_user.id)
        .order_by(desc(Notification.created_at))
        .offset(skip)
        .limit(limit)
    )

    return result.scalars().all()
