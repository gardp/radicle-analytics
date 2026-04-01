"""Add instruction_id to action, drop content_id from instructions

Revision ID: d1a2b3c4e5f6
Revises: 8c6caa6b3696
Create Date: 2026-03-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1a2b3c4e5f6'
down_revision: str = '8c6caa6b3696'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add instruction_id FK (NOT NULL) to action table
    op.add_column('action', sa.Column('instruction_id', sa.UUID(), nullable=False))
    op.create_foreign_key(
        'fk_action_instruction_id',
        'action', 'instructions',
        ['instruction_id'], ['instruction_id'],
    )
    op.create_index('ix_action_instruction_id', 'action', ['instruction_id'])

def downgrade() -> None:
    # Re-add content_id FK to instructions table
    op.add_column('instructions', sa.Column('content_id', sa.UUID(), nullable=True))

    # Drop instruction_id FK from action table
    op.drop_index('ix_action_instruction_id', 'action')
    op.drop_constraint('fk_action_instruction_id', 'action', type_='foreignkey')
    op.drop_column('action', 'instruction_id')
