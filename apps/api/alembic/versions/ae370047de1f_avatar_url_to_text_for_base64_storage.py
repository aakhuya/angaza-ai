"""avatar_url to Text for base64 storage

Revision ID: ae370047de1f
Revises: f7c0657cb01d
Create Date: 2026-10-19

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "ae370047de1f"
down_revision = "f7c0657cb01d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # `batch_alter_table` rebuilds the table for SQLite (which has no
    # ALTER COLUMN TYPE) and uses a native ALTER COLUMN TYPE for Postgres.
    # Without batch mode, this migration fails on SQLite with
    # `OperationalError: near "ALTER": syntax error`.
    with op.batch_alter_table("profiles") as batch_op:
        batch_op.alter_column(
            "avatar_url",
            existing_type=sa.String(length=255),
            type_=sa.Text(),
            existing_nullable=False,
            existing_server_default=None,
        )


def downgrade() -> None:
    with op.batch_alter_table("profiles") as batch_op:
        batch_op.alter_column(
            "avatar_url",
            existing_type=sa.Text(),
            type_=sa.String(length=255),
            existing_nullable=False,
        )
