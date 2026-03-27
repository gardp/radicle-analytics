"""add instruction source back

Revision ID: b7a2f6c91d1a
Revises: f81541398d0c
Create Date: 2026-03-17 20:05:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "b7a2f6c91d1a"
down_revision: Union[str, Sequence[str], None] = "f81541398d0c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TABLE instructions ADD COLUMN IF NOT EXISTS source VARCHAR")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TABLE instructions DROP COLUMN IF EXISTS source")
