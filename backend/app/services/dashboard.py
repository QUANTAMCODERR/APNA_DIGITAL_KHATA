
from decimal import Decimal

from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.shop import Shop
from app.models.customer import Customer
from app.models.transaction import Transaction, TransactionType
from app.models.user import User
from app.schemas.dashboard import DashboardSummary
from sqlalchemy import select, func, case, desc


async def get_dashboard_summary(
    current_user: User,
    db: AsyncSession
) -> DashboardSummary:

    # Find logged-in user's shop
    result = await db.execute(
        select(Shop.id).where(
            Shop.owner_id == current_user.id
        )
    )

    shop_id = result.scalar_one_or_none()

    if shop_id is None:
        raise ValueError("Please register your shop first")

    # Count total customers
    result = await db.execute(
        select(func.count(Customer.id)).where(
            Customer.shop_id == shop_id
        )
    )

    total_customers = result.scalar_one()

    # Calculate transaction statistics for this shop
    balance_expression = case(
        (
            Transaction.transaction_type == TransactionType.CREDIT,
            Transaction.amount
        ),
        else_=-Transaction.amount
    )

    result = await db.execute(
        select(
            func.count(Transaction.id),
            func.coalesce(
                func.sum(
                    case(
                        (
                            Transaction.transaction_type == TransactionType.CREDIT,
                            Transaction.amount
                        ),
                        else_=0
                    )
                ),
                0
            ),
            func.coalesce(
                func.sum(
                    case(
                        (
                            Transaction.transaction_type == TransactionType.PAYMENT,
                            Transaction.amount
                        ),
                        else_=0
                    )
                ),
                0
            ),
            func.coalesce(func.sum(balance_expression), 0)
        )
        .join(
            Customer,
            Transaction.customer_id == Customer.id
        )
        .where(Customer.shop_id == shop_id)
    )

    (
        total_transactions,
        total_credit_amount,
        total_payment_amount,
        outstanding_balance
    ) = result.one()

    # Fetch latest 5 transactions with customer names
    result = await db.execute(
        select(
            Transaction,
            Customer.full_name
        )
        .join(
            Customer,
            Transaction.customer_id == Customer.id
        )
        .where(Customer.shop_id == shop_id)
        .order_by(
            desc(Transaction.transaction_date),
            desc(Transaction.created_at)
        )
        .limit(5)
    )

    recent_transaction_rows = result.all()

    recent_transactions = [
        {
            "id": transaction.id,
            "customer_id": transaction.customer_id,
            "customer_name": customer_name,
            "transaction_type": transaction.transaction_type,
            "amount": transaction.amount,
            "description": transaction.description,
            "transaction_date": transaction.transaction_date
        }
        for transaction, customer_name in recent_transaction_rows
    ]

    return DashboardSummary(
    total_customers=total_customers,
    total_transactions=total_transactions,
    total_credit_amount=Decimal(str(total_credit_amount)),
    total_payment_amount=Decimal(str(total_payment_amount)),
    outstanding_balance=Decimal(str(outstanding_balance)),
    recent_transactions=recent_transactions
    )
