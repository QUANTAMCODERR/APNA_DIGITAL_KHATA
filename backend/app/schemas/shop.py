
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.shop import BusinessCategory


class ShopCreate(BaseModel):
    shop_name: str = Field(min_length=2, max_length=150)

    business_category: BusinessCategory

    preferred_language: str = Field(
        default="en",
        max_length=20
    )

    address: str | None = Field(
        default=None,
        max_length=255
    )


class ShopUpdate(BaseModel):
    shop_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=150
    )

    business_category: BusinessCategory | None = None

    preferred_language: str | None = Field(
        default=None,
        max_length=20
    )

    address: str | None = Field(
        default=None,
        max_length=255
    )


class ShopResponse(BaseModel):
    id: UUID
    owner_id: UUID
    shop_name: str
    business_category: BusinessCategory
    preferred_language: str
    address: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
