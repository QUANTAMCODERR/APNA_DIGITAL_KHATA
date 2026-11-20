
"""add transaction idempotency key

Revision ID: 61ae98671137
Revises: 27bd69d60f24
Create Date: 2026-11-20 17:07:47.512982

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '61ae98671137'
down_revision: Union[str, Sequence[str], None] = '27bd69d60f24'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column(
        'transactions',
        sa.Column(
            'idempotency_key',
            sa.UUID(),
            nullable=True
        )
    )

    op.create_unique_constraint(
        'uq_transactions_idempotency_key',
        'transactions',
        ['idempotency_key']
    )


def downgrade() -> None:

    op.drop_constraint(
        'uq_transactions_idempotency_key',
        'transactions',
        type_='unique'
    )

    op.drop_column(
        'transactions',
        'idempotency_key'
    )
