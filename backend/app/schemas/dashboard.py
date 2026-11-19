
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.models.transaction import TransactionType


class RecentTransactionResponse(BaseModel):
    id: UUID
    customer_id: UUID
    customer_name: str
    transaction_type: TransactionType
    amount: Decimal
    description: str | None
    transaction_date: datetime


class DashboardSummary(BaseModel):
    total_customers: int
    total_transactions: int
    total_credit_amount: Decimal
    total_payment_amount: Decimal
    outstanding_balance: Decimal

    recent_transactions: list[RecentTransactionResponse] = []
