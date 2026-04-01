"""merge migration heads

Revision ID: 8d81deb06c6f
Revises: 76f3e44aa5fe, d1a2b3c4e5f6
Create Date: 2026-03-30 02:09:20.019934

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8d81deb06c6f'
down_revision: Union[str, Sequence[str], None] = ('76f3e44aa5fe', 'd1a2b3c4e5f6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
