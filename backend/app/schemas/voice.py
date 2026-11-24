
from datetime import datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator
)

from app.models.transaction import TransactionType



class TextTransactionRequest(BaseModel):
    message: str = Field(
        min_length=1,
        max_length=2000
    )

    model_config = ConfigDict(extra="forbid")



class VoiceTransactionExtraction(BaseModel):

    customer_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=150
    )

    transaction_type: Literal["credit", "payment"] | None = None

    amount: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=12,
        decimal_places=2
    )

    description: str | None = Field(
        default=None,
        max_length=500
    )

    due_date: datetime | None = None

    model_config = ConfigDict(extra="forbid")


class MatchedCustomerResponse(BaseModel):

    id: UUID
    full_name: str
    mobile_number: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CustomerMatchResponse(BaseModel):

    status: Literal[
        "matched",
        "multiple_matches",
        "not_found"
    ]

    customers: list[MatchedCustomerResponse]


class VoiceTransactionConfirm(BaseModel):

    confirmation_id: UUID
    customer_id: UUID

    transaction_type: TransactionType

    amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2
    )

    description: str | None = Field(
        default=None,
        max_length=500
    )

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
