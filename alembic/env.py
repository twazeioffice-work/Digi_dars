import asyncio
import os
from logging.config import fileConfig

from sqlalchemy.ext.asyncio import async_engine_from_config
from sqlalchemy import pool
from alembic import context
from dotenv import load_dotenv

# 1. Load environment variables
load_dotenv()

# 2. Alembic Config object
config = context.config

# 3. Inject the DATABASE_URL from settings / environment
from app.config import settings
database_url = os.getenv("DATABASE_URL", settings.DATABASE_URL)

# Ensure async driver for postgresql (asyncpg) or sqlite (aiosqlite)
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif database_url.startswith("sqlite://"):
    database_url = database_url.replace("sqlite://", "sqlite+aiosqlite://", 1)

config.set_main_option("sqlalchemy.url", database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 4. Import Base and ALL models so Alembic can read them
from app.database import Base 

import app.models.auth
import app.models.finance
import app.models.academic
import app.models.communication
import app.models.enums

target_metadata = Base.metadata

def do_run_migrations(connection):
    """Run migrations in the context of the async connection."""
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True, # Detects changes to column types
    )

    with context.begin_transaction():
        context.run_migrations()

async def run_migrations_online():
    """Run migrations in 'online' mode using async engine."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
