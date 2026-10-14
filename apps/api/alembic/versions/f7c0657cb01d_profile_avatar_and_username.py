"""profile avatar and username

Revision ID: f7c0657cb01d
Revises: 4215faadbaff
Create Date: 2026-10-14

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "f7c0657cb01d"
down_revision: Union[str, None] = "4215faadbaff"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # SQLite refuses to add a NOT NULL column without a default. Add the
    # columns with a server_default so existing rows are backfilled, then drop
    # the server default so future writes use the application-level default.
    with op.batch_alter_table("profiles") as batch:
        batch.add_column(
            sa.Column("avatar_url", sa.String(length=255), nullable=False, server_default="")
        )
    with op.batch_alter_table("profiles") as batch:
        batch.alter_column("avatar_url", server_default=None)

    with op.batch_alter_table("users") as batch:
        batch.add_column(sa.Column("username", sa.String(length=40), nullable=True))
        batch.create_unique_constraint("uq_users_username", ["username"])


def downgrade() -> None:
    with op.batch_alter_table("users") as batch:
        batch.drop_constraint("uq_users_username", type_="unique")
        batch.drop_column("username")
    with op.batch_alter_table("profiles") as batch:
        batch.drop_column("avatar_url")
