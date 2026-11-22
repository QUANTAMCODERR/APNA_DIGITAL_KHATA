
"""fix payment reminder enum mapping

Revision ID: e3707e5e81d0
Revises: 954ac24c4069
Create Date: 2026-11-21 19:32:35.616559

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3707e5e81d0'
down_revision: Union[str, Sequence[str], None] = '954ac24c4069'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Fix PostgreSQL notification enum mapping."""

    # Add the uppercase enum label expected by SQLAlchemy.
    # PostgreSQL requires this to be committed before using it.
    with op.get_context().autocommit_block():
        op.execute(
            "ALTER TYPE notification_type "
            "ADD VALUE IF NOT EXISTS 'PAYMENT_REMINDER'"
        )

    # Remove the previous lowercase partial index.
    op.drop_index(
        'uq_transaction_reminder_date',
        table_name='notifications'
    )

    # Remove the previous lowercase check constraint.
    op.drop_constraint(
        'ck_payment_reminder_required_fields',
        'notifications',
        type_='check'
    )

    # Recreate check constraint with uppercase enum label.
    op.create_check_constraint(
        'ck_payment_reminder_required_fields',
        'notifications',
        """
        notification_type != 'PAYMENT_REMINDER'
        OR (
            transaction_id IS NOT NULL
            AND reminder_date IS NOT NULL
        )
        """
    )

    # Recreate partial unique index with uppercase enum label.
    op.create_index(
        'uq_transaction_reminder_date',
        'notifications',
        ['transaction_id', 'reminder_date'],
        unique=True,
        postgresql_where=sa.text(
            "notification_type = 'PAYMENT_REMINDER'"
        )
    )


def downgrade() -> None:
    """Restore the previous lowercase reminder conditions."""

    op.drop_index(
        'uq_transaction_reminder_date',
        table_name='notifications'
    )

    op.drop_constraint(
        'ck_payment_reminder_required_fields',
        'notifications',
        type_='check'
    )

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

    op.create_index(
        'uq_transaction_reminder_date',
        'notifications',
        ['transaction_id', 'reminder_date'],
        unique=True,
        postgresql_where=sa.text(
            "notification_type = 'payment_reminder'"
        )
    )

    # PostgreSQL does not directly support removing enum values.
    # Both enum labels are retained.
