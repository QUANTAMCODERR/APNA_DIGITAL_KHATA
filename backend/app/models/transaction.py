
import uuid
import enum
from datetime import datetime
from decimal import Decimal
from sqlalchemy import (
    DateTime,
    String,
    Text,
    ForeignKey,
    Enum,
    Numeric,
    Boolean,
    func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TransactionType(str, enum.Enum):
    CREDIT = "credit"
    PAYMENT = "payment"


class TransactionSource(str, enum.Enum):
    MANUAL = "manual"
    VOICE = "voice"


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    transaction_type: Mapped[TransactionType] = mapped_column(
        Enum(TransactionType, name="transaction_type"),
        nullable=False
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    source: Mapped[TransactionSource] = mapped_column(
        Enum(TransactionSource, name="transaction_source"),
        default=TransactionSource.MANUAL,
        nullable=False
    )

    due_date: Mapped[datetime | None] = mapped_column(
    DateTime(timezone=True),
    nullable=True
    )
    
    allocation_processed: Mapped[bool] = mapped_column(
    Boolean,
    default=False,
    nullable=False
    )

    transaction_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    customer: Mapped["Customer"] = relationship(
        back_populates="transactions"
    )

    notifications: Mapped[list["Notification"]] = relationship(
        back_populates="transaction"
    )
