"""add_various_to_phase_enum

Revision ID: f236444523f3
Revises: 190c03369212
Create Date: 2026-04-02 02:08:29.086837

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f236444523f3'
down_revision: Union[str, Sequence[str], None] = '190c03369212'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE phase_enum ADD VALUE IF NOT EXISTS 'various'")


def downgrade() -> None:
    """Downgrade schema."""
    # PostgreSQL does not support removing enum values in-place safely.
    # Keep downgrade as a no-op for this enum extension migration.
    pass
