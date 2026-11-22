
from datetime import datetime
from decimal import Decimal

from sqlalchemy import select, func
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction, TransactionType
from app.models.repayment import Repayment
from app.models.notification import Notification, NotificationType


async def generate_payment_reminders(
    db: AsyncSession,
    as_of: datetime
) -> int:
    """
    Generate payment reminders for outstanding credit transactions.

    Creates at most one reminder per credit transaction per calendar day.
    Returns the number of newly created reminders.
    """

    if as_of.tzinfo is None or as_of.utcoffset() is None:
        raise ValueError("as_of must be a timezone-aware datetime")

    # Calculate total repayment allocated to each credit transaction.
    repayment_subquery = (
        select(
            Repayment.credit_transaction_id.label("credit_transaction_id"),
            func.sum(Repayment.amount).label("allocated_amount")
        )
        .group_by(Repayment.credit_transaction_id)
        .subquery()
    )

    # Fetch credit transactions whose due dates have arrived.
    query = (
        select(
            Transaction,
            func.coalesce(
                repayment_subquery.c.allocated_amount,
                0
            ).label("allocated_amount")
        )
        .outerjoin(
            repayment_subquery,
            Transaction.id == repayment_subquery.c.credit_transaction_id
        )
        .where(
            Transaction.transaction_type == TransactionType.CREDIT,
            Transaction.due_date.is_not(None),
            Transaction.due_date <= as_of
        )
        .order_by(
            Transaction.due_date.asc(),
            Transaction.transaction_date.asc()
        )
    )

    result = await db.execute(query)
    credit_rows = result.all()

    reminders_created = 0

    try:
        for credit, allocated_amount in credit_rows:

            # Calculate remaining outstanding amount.
            remaining_amount = (
                Decimal(str(credit.amount))
                - Decimal(str(allocated_amount))
            )

            # Do not remind customers about fully paid credits.
            if remaining_amount <= Decimal("0.00"):
                continue

            # Convert due date into the reminder job's timezone.
            local_due_date = credit.due_date.astimezone(as_of.tzinfo).date()

            if local_due_date < as_of.date():
                payment_status = "overdue"
            else:
                payment_status = "due"

            message = (
                f"Payment {payment_status}: "
                f"Rs. {remaining_amount:.2f} remains outstanding "
                f"for your credit transaction due on "
                f"{local_due_date.strftime('%d %b %Y')}."
            )

            # PostgreSQL atomic duplicate prevention.
            statement = (
                pg_insert(Notification)
                .values(
                    customer_id=credit.customer_id,
                    transaction_id=credit.id,
                    notification_type=NotificationType.PAYMENT_REMINDER,
                    reminder_date=as_of.date(),
                    message=message
                )
                .on_conflict_do_nothing(
                    index_elements=[
                        "transaction_id",
                        "reminder_date"
                    ],
                    index_where=(
                        Notification.notification_type
                        == NotificationType.PAYMENT_REMINDER
                    )
                )
                .returning(Notification.id)
            )

            insert_result = await db.execute(statement)

            if insert_result.scalar_one_or_none() is not None:
                reminders_created += 1

        await db.commit()

        return reminders_created

    except Exception:
        await db.rollback()
        raise
