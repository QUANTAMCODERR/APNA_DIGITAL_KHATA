
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class CustomerCreate(BaseModel):
    full_name: str = Field(
        min_length=2,
        max_length=150
    )

    mobile_number: str | None = Field(
        default=None,
        max_length=20
    )

    address: str | None = Field(
        default=None,
        max_length=255
    )

    notes: str | None = None


class CustomerUpdate(BaseModel):
    full_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150
    )

    mobile_number: str | None = Field(
        default=None,
        max_length=20
    )

    address: str | None = Field(
        default=None,
        max_length=255
    )

    notes: str | None = None


class CustomerResponse(BaseModel):
    id: UUID
    shop_id: UUID
    full_name: str
    mobile_number: str | None
    address: str | None
    notes: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
