"""merge heads

Revision ID: a16be2d14eb8
Revises: c4d5e6f7a8b9, 3535fcca33e9
Create Date: 2026-04-01 19:00:56.274801

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a16be2d14eb8'
down_revision: Union[str, Sequence[str], None] = ('c4d5e6f7a8b9', '3535fcca33e9')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
