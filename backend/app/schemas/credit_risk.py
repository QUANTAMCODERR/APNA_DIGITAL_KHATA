
from decimal import Decimal
from enum import Enum
from uuid import UUID

from pydantic import BaseModel


class CreditRiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    INSUFFICIENT_DATA = "insufficient_data"


class CreditRiskResponse(BaseModel):
    customer_id: UUID

    risk_level: CreditRiskLevel

    risk_score: float | None = None

    total_transactions: int

    total_credit_amount: Decimal

    total_payment_amount: Decimal

    outstanding_balance: Decimal

    explanation: list[str]

    recommendation: str
