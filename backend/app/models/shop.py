
import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    DateTime,
    String,
    ForeignKey,
    Enum,
    func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class BusinessCategory(str, enum.Enum):
    KIRANA = "kirana_store"
    FRUIT_VEGETABLE = "fruit_vegetable_shop"
    BAKERY = "bakery"
    DAIRY = "dairy_shop"
    STATIONERY = "stationery_shop"
    HARDWARE = "hardware_shop"
    CLOTHING = "clothing_store"
    MEDICAL = "medical_store"
    OTHER = "other_business"


class Shop(Base):
    __tablename__ = "shops"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    shop_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False
    )

    business_category: Mapped[BusinessCategory] = mapped_column(
        Enum(BusinessCategory, name="business_category"),
        nullable=False
    )

    preferred_language: Mapped[str] = mapped_column(
        String(20),
        default="en",
        nullable=False
    )

    address: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    owner: Mapped["User"] = relationship(
        back_populates="shop"
    )

    customers: Mapped[list["Customer"]] = relationship(
        back_populates="shop",
        cascade="all, delete-orphan"
    )
