
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.transaction import TransactionType, TransactionSource


class TransactionCreate(BaseModel):
    customer_id: UUID

    transaction_type: TransactionType

    amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2
    )

    description: str | None = None


class TransactionResponse(BaseModel):
    id: UUID
    customer_id: UUID
    transaction_type: TransactionType
    amount: Decimal
    description: str | None
    source: TransactionSource
    transaction_date: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
