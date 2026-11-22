
"""add payment reminder support

Revision ID: 954ac24c4069
Revises: 61ae98671137
Create Date: 2026-11-21 19:11:30.858069

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '954ac24c4069'
down_revision: Union[str, Sequence[str], None] = '61ae98671137'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Add the new PostgreSQL enum value.
    # Autocommit is required before using the new value in constraints.
    with op.get_context().autocommit_block():
        op.execute(
            "ALTER TYPE notification_type "
            "ADD VALUE IF NOT EXISTS 'payment_reminder'"
        )

    # Add reminder date column.
    op.add_column(
        'notifications',
        sa.Column('reminder_date', sa.Date(), nullable=True)
    )

    # Ensure every payment reminder has a transaction and reminder date.
    op.create_check_constraint(
        'ck_payment_reminder_required_fields',
        'notifications',
        """
        notification_type != 'payment_reminder'
        OR (
            transaction_id IS NOT NULL
            AND reminder_date IS NOT NULL
        )
        """
    )

    # Prevent duplicate reminders for the same transaction and date.
    op.create_index(
        'uq_transaction_reminder_date',
        'notifications',
        ['transaction_id', 'reminder_date'],
        unique=True,
        postgresql_where=sa.text(
            "notification_type = 'payment_reminder'"
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        'uq_transaction_reminder_date',
        table_name='notifications',
        postgresql_where=sa.text(
            "notification_type = 'payment_reminder'"
        )
    )

    op.drop_constraint(
        'ck_payment_reminder_required_fields',
        'notifications',
        type_='check'
    )

    op.drop_column('notifications', 'reminder_date')

    # PostgreSQL does not directly support removing an enum value.
    # The unused payment_reminder value is intentionally retained.
