"""preferences json and onboarding flag

Revision ID: 4215faadbaff
Revises: fde767fd2652
Create Date: (regenerated)

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "4215faadbaff"
down_revision: Union[str, None] = "fde767fd2652"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # SQLite cannot add a NOT NULL column without a server-side default, and
    # even on Postgres we want existing rows to receive a value rather than
    # fail the migration. server_default covers both.
    op.add_column(
        "preferences",
        sa.Column(
            "onboarding_completed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.add_column(
        "preferences",
        sa.Column(
            "preferences_json",
            sa.JSON(),
            nullable=False,
            server_default=sa.text("'{}'"),
        ),
    )


def downgrade() -> None:
    op.drop_column("preferences", "preferences_json")
    op.drop_column("preferences", "onboarding_completed")
