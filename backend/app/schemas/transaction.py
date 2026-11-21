
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator
)

from app.models.transaction import (
    TransactionType,
    TransactionSource
)



class TransactionCreate(BaseModel):
    customer_id: UUID
    transaction_type: TransactionType

    amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2
    )

    description: str | None = None
    due_date: datetime | None = None

    @model_validator(mode="after")
    def validate_due_date(self):
        if (
            self.transaction_type == TransactionType.PAYMENT
            and self.due_date is not None
        ):
            raise ValueError(
                "Due date can only be assigned to credit transactions"
            )

        return self


class VoiceTransactionCreate(TransactionCreate):
    confirmation_id: UUID


class TransactionResponse(BaseModel):
    id: UUID
    customer_id: UUID
    transaction_type: TransactionType
    amount: Decimal
    description: str | None
    source: TransactionSource
    due_date: datetime | None
    transaction_date: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
