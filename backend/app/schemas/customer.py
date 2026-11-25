
import re
from datetime import datetime
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


def validate_mobile(value: str | None) -> str | None:
    if value is None or not value.strip():
        return None

    value = value.strip()

    if not re.fullmatch(r"[6-9]\d{9}", value):
        raise ValueError(
            "Enter a valid 10-digit Indian mobile number."
        )

    return value


class CustomerCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    mobile_number: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None, max_length=255)
    notes: str | None = None

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("Customer name is required.")

        return value

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile_number(cls, value: str | None) -> str | None:
        return validate_mobile(value)

    @field_validator("address")
    @classmethod
    def validate_address(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None

        value = value.strip()

        if len(value) < 5:
            raise ValueError("Address must contain at least 5 characters.")

        return value


class CustomerUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=150)
    mobile_number: str | None = Field(default=None, max_length=20)
    address: str | None = Field(default=None, max_length=255)
    notes: str | None = None

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()

        if not value:
            raise ValueError("Customer name cannot be empty.")

        return value

    @field_validator("mobile_number")
    @classmethod
    def validate_mobile_number(cls, value: str | None) -> str | None:
        return validate_mobile(value)

    @field_validator("address")
    @classmethod
    def validate_address(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None

        value = value.strip()

        if len(value) < 5:
            raise ValueError("Address must contain at least 5 characters.")

        return value


class CustomerResponse(BaseModel):
    id: UUID
    full_name: str
    mobile_number: str | None
    address: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
