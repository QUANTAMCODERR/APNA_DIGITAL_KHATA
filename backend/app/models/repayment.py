
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Numeric,
    UniqueConstraint,
    CheckConstraint,
    func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Repayment(Base):
    __tablename__ = "repayments"

    __table_args__ = (
        UniqueConstraint(
            "credit_transaction_id",
            "payment_transaction_id",
            name="uq_credit_payment_allocation"
        ),
        CheckConstraint(
            "amount > 0",
            name="ck_repayment_amount_positive"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    credit_transaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("transactions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    payment_transaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("transactions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    allocated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    credit_transaction: Mapped["Transaction"] = relationship(
        foreign_keys=[credit_transaction_id]
    )

    payment_transaction: Mapped["Transaction"] = relationship(
        foreign_keys=[payment_transaction_id]
    )
