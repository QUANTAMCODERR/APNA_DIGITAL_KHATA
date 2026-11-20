
from decimal import Decimal

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction, TransactionType
from app.models.repayment import Repayment


async def allocate_payment_to_credits(
    payment_transaction: Transaction,
    db: AsyncSession
) -> Decimal:

    if payment_transaction.transaction_type != TransactionType.PAYMENT:
        raise ValueError("Transaction must be a payment")

    # Lock payment row to prevent duplicate processing
    result = await db.execute(
        select(Transaction)
        .where(Transaction.id == payment_transaction.id)
        .with_for_update()
    )

    payment = result.scalar_one()

    # If already processed, return previous allocation total
    if payment.allocation_processed:
        result = await db.execute(
            select(func.coalesce(func.sum(Repayment.amount), 0))
            .where(
                Repayment.payment_transaction_id == payment.id
            )
        )

        return Decimal(str(result.scalar_one()))

    # Lock customer's credit transactions in FIFO order
    result = await db.execute(
        select(Transaction)
        .where(
            Transaction.customer_id == payment.customer_id,
            Transaction.transaction_type == TransactionType.CREDIT
        )
        .order_by(
            Transaction.transaction_date.asc(),
            Transaction.created_at.asc(),
            Transaction.id.asc()
        )
        .with_for_update()
    )

    credit_transactions = result.scalars().all()

    remaining_payment = Decimal(str(payment.amount))
    total_allocated = Decimal("0.00")

    if credit_transactions:
        credit_ids = [credit.id for credit in credit_transactions]

        result = await db.execute(
            select(
                Repayment.credit_transaction_id,
                func.sum(Repayment.amount)
            )
            .where(
                Repayment.credit_transaction_id.in_(credit_ids)
            )
            .group_by(Repayment.credit_transaction_id)
        )

        allocated_amounts = {
            credit_id: Decimal(str(amount))
            for credit_id, amount in result.all()
        }

        # Allocate payment to oldest outstanding credits first
        for credit in credit_transactions:

            if remaining_payment <= 0:
                break

            already_allocated = allocated_amounts.get(
                credit.id,
                Decimal("0.00")
            )

            remaining_credit = (
                Decimal(str(credit.amount)) - already_allocated
            )

            if remaining_credit <= 0:
                continue

            allocation = min(
                remaining_payment,
                remaining_credit
            )

            db.add(
                Repayment(
                    credit_transaction_id=credit.id,
                    payment_transaction_id=payment.id,
                    amount=allocation
                )
            )

            remaining_payment -= allocation
            total_allocated += allocation

    # Mark payment as processed even if no credit was available
    payment.allocation_processed = True

    await db.flush()

    return total_allocated