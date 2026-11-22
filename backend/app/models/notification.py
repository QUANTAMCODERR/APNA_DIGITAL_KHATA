
import uuid
import enum
from datetime import datetime, date

from sqlalchemy import (
    DateTime,
    Date,
    Text,
    ForeignKey,
    Enum,
    Index,
    CheckConstraint,
    text,
    func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class NotificationType(str, enum.Enum):
    CREDIT_ADDED = "credit_added"
    PAYMENT_RECEIVED = "payment_received"
    BALANCE_UPDATED = "balance_updated"
    PAYMENT_REMINDER = "payment_reminder"


class NotificationStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"


class Notification(Base):
    __tablename__ = "notifications"

    __table_args__ = (
        CheckConstraint(
            """
            notification_type != 'PAYMENT_REMINDER'
            OR (
                transaction_id IS NOT NULL
                AND reminder_date IS NOT NULL
            )
            """,
            name="ck_payment_reminder_required_fields"
        ),
        Index(
            "uq_transaction_reminder_date",
            "transaction_id",
            "reminder_date",
            unique=True,
            postgresql_where=text(
                "notification_type = 'PAYMENT_REMINDER'"
            )
        ),
    )

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

    transaction_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("transactions.id", ondelete="SET NULL"),
        nullable=True
    )

    notification_type: Mapped[NotificationType] = mapped_column(
        Enum(NotificationType, name="notification_type"),
        nullable=False
    )

    reminder_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    status: Mapped[NotificationStatus] = mapped_column(
        Enum(NotificationStatus, name="notification_status"),
        default=NotificationStatus.PENDING,
        nullable=False
    )

    sent_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    customer: Mapped["Customer"] = relationship(
        back_populates="notifications"
    )

    transaction: Mapped["Transaction | None"] = relationship(
        back_populates="notifications"
    )
