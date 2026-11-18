
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.shop import Shop
from app.models.user import User
from app.schemas.customer import CustomerCreate
from app.schemas.customer import CustomerCreate, CustomerUpdate
from sqlalchemy import select, func
from app.models.transaction import Transaction

async def create_customer(
    customer_data: CustomerCreate,
    current_user: User,
    db: AsyncSession
) -> Customer:

    # Find the logged-in user's shop
    result = await db.execute(
        select(Shop).where(
            Shop.owner_id == current_user.id
        )
    )

    shop = result.scalar_one_or_none()

    if shop is None:
        raise ValueError("Please register your shop first")

    # Normalize mobile number
    mobile_number = (
        customer_data.mobile_number.strip()
        if customer_data.mobile_number
        else None
    )

    if mobile_number == "":
        mobile_number = None

    # Check duplicate mobile number within this shop
    if mobile_number:
        result = await db.execute(
            select(Customer).where(
                Customer.shop_id == shop.id,
                Customer.mobile_number == mobile_number
            )
        )

        existing_customer = result.scalar_one_or_none()

        if existing_customer:
            raise ValueError(
                "Customer with this mobile number already exists"
            )

    # Create new customer
    new_customer = Customer(
        shop_id=shop.id,
        full_name=customer_data.full_name.strip(),
        mobile_number=mobile_number,
        address=customer_data.address,
        notes=customer_data.notes
    )

    try:
        db.add(new_customer)

        await db.commit()
        await db.refresh(new_customer)

        return new_customer

    except IntegrityError as error:
        await db.rollback()
        raise ValueError(
            "Customer with this mobile number already exists"
        ) from error

    except Exception:
        await db.rollback()
        raise





async def get_all_customers(
    current_user: User,
    db: AsyncSession,
    skip: int = 0,
    limit: int = 20
) -> list[Customer]:

    # Find the logged-in user's shop
    result = await db.execute(
        select(Shop).where(
            Shop.owner_id == current_user.id
        )
    )

    shop = result.scalar_one_or_none()

    if shop is None:
        raise ValueError("Please register your shop first")

    # Fetch customers belonging to this shop
    result = await db.execute(
        select(Customer)
        .where(Customer.shop_id == shop.id)
        .order_by(Customer.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    return list(result.scalars().all())




async def get_customer_by_id(
    customer_id: str,
    current_user: User,
    db: AsyncSession
) -> Customer | None:

    # Find the logged-in user's shop
    result = await db.execute(
        select(Shop).where(
            Shop.owner_id == current_user.id
        )
    )

    shop = result.scalar_one_or_none()

    if shop is None:
        raise ValueError("Please register your shop first")

    # Find customer belonging to this shop
    result = await db.execute(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.shop_id == shop.id
        )
    )

    return result.scalar_one_or_none()





async def update_customer(
    customer_id: str,
    customer_data: CustomerUpdate,
    current_user: User,
    db: AsyncSession
) -> Customer | None:

    # Find the logged-in user's shop
    result = await db.execute(
        select(Shop).where(
            Shop.owner_id == current_user.id
        )
    )

    shop = result.scalar_one_or_none()

    if shop is None:
        raise ValueError("Please register your shop first")

    # Find customer belonging to this shop
    result = await db.execute(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.shop_id == shop.id
        )
    )

    customer = result.scalar_one_or_none()

    if customer is None:
        return None

    # Get only fields provided in the request
    update_data = customer_data.model_dump(
        exclude_unset=True
    )

    # Validate required field
    if "full_name" in update_data:
        if update_data["full_name"] is None:
            raise ValueError("Customer name cannot be empty")

        update_data["full_name"] = update_data["full_name"].strip()

    # Normalize mobile number
    if "mobile_number" in update_data:
        mobile = update_data["mobile_number"]

        if mobile is not None:
            mobile = mobile.strip()
            update_data["mobile_number"] = mobile or None

    # Check duplicate mobile number
    mobile_number = update_data.get("mobile_number")

    if mobile_number:
        result = await db.execute(
            select(Customer).where(
                Customer.shop_id == shop.id,
                Customer.mobile_number == mobile_number,
                Customer.id != customer.id
            )
        )

        existing_customer = result.scalar_one_or_none()

        if existing_customer:
            raise ValueError(
                "Another customer already uses this mobile number"
            )

    # Apply updates
    for field, value in update_data.items():
        if field in ("address", "notes") and isinstance(value, str):
            value = value.strip()

        setattr(customer, field, value)

    try:
        await db.commit()
        await db.refresh(customer)

        return customer

    except IntegrityError as error:
        await db.rollback()
        raise ValueError(
            "Another customer already uses this mobile number"
        ) from error

    except Exception:
        await db.rollback()
        raise



async def delete_customer(
    customer_id: str,
    current_user: User,
    db: AsyncSession
) -> bool:

    # Find the logged-in user's shop
    result = await db.execute(
        select(Shop).where(
            Shop.owner_id == current_user.id
        )
    )

    shop = result.scalar_one_or_none()

    if shop is None:
        raise ValueError("Please register your shop first")

    # Find customer belonging to this shop
    result = await db.execute(
        select(Customer).where(
            Customer.id == customer_id,
            Customer.shop_id == shop.id
        )
    )

    customer = result.scalar_one_or_none()

    if customer is None:
        return False

    # Check whether customer has financial transactions
    result = await db.execute(
        select(func.count(Transaction.id)).where(
            Transaction.customer_id == customer.id
        )
    )

    transaction_count = result.scalar_one()

    if transaction_count > 0:
        raise ValueError(
            "Customer cannot be deleted because transaction history exists"
        )

    try:
        await db.delete(customer)
        await db.commit()

        return True

    except Exception:
        await db.rollback()
        raise
