
from decimal import Decimal

from sqlalchemy import select, func, case, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.shop import Shop
from app.models.user import User
from app.models.transaction import (
    Transaction,
    TransactionSource,
    TransactionType
)
from app.models.customer_behaviour import CustomerBehaviour
from app.models.notification import (
    Notification,
    NotificationType,
    NotificationStatus
)
from app.schemas.transaction import TransactionCreate
from decimal import Decimal
from app.services.repayment import allocate_payment_to_credits


async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User,
    db: AsyncSession
) -> Transaction:

    # Find the logged-in user's shop
    result = await db.execute(
        select(Shop).where(
            Shop.owner_id == current_user.id
        )
    )

    shop = result.scalar_one_or_none()

    if shop is None:
        raise ValueError("Please register your shop first")

    # Verify that the customer belongs to this shop
    result = await db.execute(
        select(Customer).where(
            Customer.id == transaction_data.customer_id,
            Customer.shop_id == shop.id
        )
    )

    customer = result.scalar_one_or_none()

    if customer is None:
        raise ValueError("Customer not found in your shop")

    # Create transaction
    
    new_transaction = Transaction(
        customer_id=customer.id,
        transaction_type=transaction_data.transaction_type,
        amount=transaction_data.amount,
        description=(
            transaction_data.description.strip()
            if transaction_data.description
            else None
        ),
        source=TransactionSource.MANUAL,
        due_date=transaction_data.due_date
    )


    try:
        db.add(new_transaction)

        # Find existing customer behaviour record
        result = await db.execute(
            select(CustomerBehaviour).where(
                CustomerBehaviour.customer_id == customer.id
            )
        )

        behaviour = result.scalar_one_or_none()

        # Create behaviour record if it doesn't exist
        if behaviour is None:
            behaviour = CustomerBehaviour(
                customer_id=customer.id,
                total_transactions=0,
                total_credit_transactions=0,
                total_payment_transactions=0,
                total_credit_amount=Decimal("0.00"),
                total_payment_amount=Decimal("0.00")
            )
            db.add(behaviour)

        # Update total transaction count
        behaviour.total_transactions += 1

        # Update statistics and prepare notification
        if transaction_data.transaction_type == TransactionType.CREDIT:

            behaviour.total_credit_transactions += 1
            behaviour.total_credit_amount += transaction_data.amount

            notification_type = NotificationType.CREDIT_ADDED

            message = (
                f"Credit of Rs. {transaction_data.amount} "
                "has been added to your account."
            )

        else:

            behaviour.total_payment_transactions += 1
            behaviour.total_payment_amount += transaction_data.amount

            notification_type = NotificationType.PAYMENT_RECEIVED

            message = (
                f"Payment of Rs. {transaction_data.amount} "
                "has been received successfully."
            )

        # Generate transaction ID before creating notification
        await db.flush()
        # Automatically allocate payments to outstanding credits
        if transaction_data.transaction_type == TransactionType.PAYMENT:

            await allocate_payment_to_credits(
        payment_transaction=new_transaction,
        db=db
        )

        # Create pending notification record
        notification = Notification(
            customer_id=customer.id,
            transaction_id=new_transaction.id,
            notification_type=notification_type,
            message=message,
            status=NotificationStatus.PENDING
        )

        db.add(notification)

        # Save transaction, behaviour and notification together
        await db.commit()
        await db.refresh(new_transaction)

        return new_transaction

    except Exception:
        await db.rollback()
        raise


async def get_customer_balance(
    customer_id,
    current_user: User,
    db: AsyncSession
) -> Decimal:

    # Verify customer ownership
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

    # Credit increases balance; payment decreases balance
    balance_expression = case(
        (
            Transaction.transaction_type == TransactionType.CREDIT,
            Transaction.amount
        ),
        else_=-Transaction.amount
    )

    result = await db.execute(
        select(
            func.coalesce(
                func.sum(balance_expression),
                0
            )
        ).where(
            Transaction.customer_id == customer_id
        )
    )

    balance = result.scalar_one()

    return Decimal(str(balance)).quantize(Decimal("0.01"))


async def get_customer_transactions(
    customer_id,
    current_user: User,
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50
):

    # Verify customer ownership
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

    # Fetch transactions with pagination
    result = await db.execute(
        select(Transaction)
        .where(
            Transaction.customer_id == customer_id
        )
        .order_by(
            desc(Transaction.transaction_date),
            desc(Transaction.created_at)
        )
        .offset(skip)
        .limit(limit)
    )

    return result.scalars().all()
