"""Add missing track columns and create royalties/royalty_transactions tables

Revision ID: a1b2c3d4e5f7
Revises: 8d81deb06c6f
Create Date: 2026-03-30 16:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f7'
down_revision: Union[str, Sequence[str], None] = '8d81deb06c6f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- 1. Add missing columns to track table ---
    op.add_column('track', sa.Column('track_file_path', sa.String(), nullable=True))
    op.add_column('track', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('track', sa.Column('updated_at', sa.DateTime(), nullable=True))

    # --- 2. Create royalties table ---
    royalty_right_enum = sa.Enum('Master', 'Recording', name='royalty_right_enum', create_type=False)
    royalty_type_enum = sa.Enum(
        'Mechanical', 'Performance', 'Synchronization', 'Neighboring',
        'Reproduction', 'Digital', 'Physical',
        name='royalty_type_enum', create_type=False,
    )

    op.create_table(
        'royalties',
        sa.Column('royalty_id', sa.UUID(), nullable=False),
        sa.Column('right', royalty_right_enum, nullable=True),
        sa.Column('royalty', royalty_type_enum, nullable=True),
        sa.Column('platform_id', sa.UUID(), nullable=True),
        sa.Column('track_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('royalty_id'),
        sa.ForeignKeyConstraint(['platform_id'], ['platforms.platform_id']),
        sa.ForeignKeyConstraint(['track_id'], ['track.track_id']),
    )

    # --- 3. Create royalty_transactions table ---
    op.create_table(
        'royalty_transactions',
        sa.Column('royalty_transaction_id', sa.UUID(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('currency', sa.String(), nullable=True),
        sa.Column('royalty_id', sa.UUID(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('royalty_transaction_id'),
        sa.ForeignKeyConstraint(['royalty_id'], ['royalties.royalty_id']),
    )


def downgrade() -> None:
    op.drop_table('royalty_transactions')
    op.drop_table('royalties')

    sa.Enum(name='royalty_type_enum').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='royalty_right_enum').drop(op.get_bind(), checkfirst=True)

    op.drop_column('track', 'updated_at')
    op.drop_column('track', 'created_at')
    op.drop_column('track', 'track_file_path')
