
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.shop import ShopCreate, ShopUpdate

from app.models.shop import Shop
from app.models.user import User
from app.schemas.shop import ShopCreate


async def create_shop(
    shop_data: ShopCreate,
    current_user: User,
    db: AsyncSession
) -> Shop:

    # Check whether this user already has a shop
    result = await db.execute(
        select(Shop).where(
            Shop.owner_id == current_user.id
        )
    )

    existing_shop = result.scalar_one_or_none()

    if existing_shop:
        raise ValueError("You already have a registered shop")

    # Create shop
    new_shop = Shop(
        owner_id=current_user.id,
        shop_name=shop_data.shop_name.strip(),
        business_category=shop_data.business_category,
        preferred_language=shop_data.preferred_language,
        address=shop_data.address
    )

    try:
        db.add(new_shop)

        await db.commit()
        await db.refresh(new_shop)

        return new_shop

    except Exception:
        await db.rollback()
        raise



async def get_my_shop(
    current_user: User,
    db: AsyncSession
) -> Shop | None:

    result = await db.execute(
        select(Shop).where(
            Shop.owner_id == current_user.id
        )
    )

    return result.scalar_one_or_none()



async def update_my_shop(
    shop_data: ShopUpdate,
    current_user: User,
    db: AsyncSession
) -> Shop | None:

    # Find the current user's shop
    result = await db.execute(
        select(Shop).where(
            Shop.owner_id == current_user.id
        )
    )

    shop = result.scalar_one_or_none()

    if shop is None:
        return None

    # Get only the fields provided by the user
    update_data = shop_data.model_dump(
        exclude_unset=True
    )

    # Required database fields cannot be set to None
    for field in ("shop_name", "business_category", "preferred_language"):
        if field in update_data and update_data[field] is None:
            raise ValueError(f"{field} cannot be empty")

    # Update only provided fields
    for field, value in update_data.items():
        if isinstance(value, str):
            value = value.strip()

        setattr(shop, field, value)

    try:
        await db.commit()
        await db.refresh(shop)

        return shop

    except Exception:
        await db.rollback()
        raise
