import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.models.base import Base
from app.models import entities, live, user  # noqa: F401  (register tables)
from app.models.session import normalise_database_url

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Prefer the environment variable; fall back to the .ini value. Always
# normalise the scheme so SQLAlchemy selects psycopg v3, not psycopg2.
_url = os.getenv("DATABASE_URL") or config.get_main_option("sqlalchemy.url") or "sqlite:///./angaza.db"
config.set_main_option("sqlalchemy.url", normalise_database_url(_url))

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
