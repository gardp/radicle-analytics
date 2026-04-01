"""Add track_id to Action, remove track_id from Instruction

Revision ID: c4d5e6f7a8b9
Revises: 8d81deb06c6f
Create Date: 2026-04-01 13:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4d5e6f7a8b9'
down_revision: Union[str, Sequence[str], None] = '8d81deb06c6f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Add track_id column to action table (FK to track)
    op.add_column('action', sa.Column('track_id', sa.UUID(), nullable=True))
    op.create_foreign_key(
        'fk_action_track_id',
        'action', 'track',
        ['track_id'], ['track_id'],
    )

    # 2. Drop track_id FK and column from instructions table
    op.drop_constraint('instructions_track_id_fkey', 'instructions', type_='foreignkey')
    op.drop_column('instructions', 'track_id')


def downgrade() -> None:
    """Downgrade schema."""
    # 1. Re-add track_id to instructions
    op.add_column('instructions', sa.Column('track_id', sa.UUID(), nullable=True))
    op.create_foreign_key(
        'instructions_track_id_fkey',
        'instructions', 'track',
        ['track_id'], ['track_id'],
    )

    # 2. Drop track_id from action
    op.drop_constraint('fk_action_track_id', 'action', type_='foreignkey')
    op.drop_column('action', 'track_id')
