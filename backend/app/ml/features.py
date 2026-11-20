
from datetime import datetime, timezone
from decimal import Decimal

from app.models.transaction import Transaction, TransactionType


def extract_customer_features(
    transactions: list[Transaction]
) -> dict:

    total_credit = Decimal("0.00")
    total_payment = Decimal("0.00")

    credit_count = 0
    payment_count = 0

    payment_dates = []
    transaction_dates = []

    for transaction in transactions:

        amount = Decimal(str(transaction.amount))

        transaction_date = transaction.transaction_date

        if transaction_date.tzinfo is None:
            transaction_date = transaction_date.replace(
                tzinfo=timezone.utc
            )

        transaction_dates.append(transaction_date)

        if transaction.transaction_type == TransactionType.CREDIT:
            total_credit += amount
            credit_count += 1

        elif transaction.transaction_type == TransactionType.PAYMENT:
            total_payment += amount
            payment_count += 1
            payment_dates.append(transaction_date)

    total_transactions = credit_count + payment_count

    outstanding_balance = total_credit - total_payment

    repayment_ratio = (
        float(total_payment / total_credit)
        if total_credit > 0
        else 0.0
    )

    average_credit_amount = (
        float(total_credit / credit_count)
        if credit_count > 0
        else 0.0
    )

    now = datetime.now(timezone.utc)

    days_since_last_payment = (
        (now - max(payment_dates)).total_seconds() / 86400
        if payment_dates
        else None
    )

    days_since_last_transaction = (
        (now - max(transaction_dates)).total_seconds() / 86400
        if transaction_dates
        else None
    )

    return {
        "total_transactions": total_transactions,
        "credit_count": credit_count,
        "payment_count": payment_count,
        "total_credit_amount": float(total_credit),
        "total_payment_amount": float(total_payment),
        "outstanding_balance": float(outstanding_balance),
        "repayment_ratio": repayment_ratio,
        "average_credit_amount": average_credit_amount,
        "days_since_last_payment": days_since_last_payment,
        "days_since_last_transaction": days_since_last_transaction
    }



def validate_customer_data(features: dict) -> dict:

    total_transactions = features["total_transactions"]
    payment_count = features["payment_count"]

    # Minimum data requirements for an initial assessment
    if total_transactions < 5:
        return {
            "is_sufficient": False,
            "reason": "Insufficient transaction history. At least 5 transactions are required."
        }

    if payment_count < 2:
        return {
            "is_sufficient": False,
            "reason": "Insufficient repayment history. At least 2 payment transactions are required."
        }

    return {
        "is_sufficient": True,
        "reason": "Sufficient transaction history for further assessment."
    }
