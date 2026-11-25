from sqlalchemy.pool import NullPool, StaticPool
from sqlmodel import Session, SQLModel, create_engine

from .config import settings
from . import models  # noqa: F401  (register tables with SQLModel.metadata)


def _make_engine(url: str):
    if url.startswith("sqlite"):
        return create_engine(
            url, connect_args={"check_same_thread": False}, poolclass=StaticPool
        )
    if ":6543" in url or "pooler" in url:
        # Supabase transaction pooler: no server-side prepared statements.
        return create_engine(
            url,
            poolclass=NullPool,
            connect_args={"prepare_threshold": None},
            pool_pre_ping=True,
        )
    return create_engine(url, pool_pre_ping=True)


engine = _make_engine(settings.DATABASE_URL)


def get_session():
    with Session(engine) as session:
        yield session


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def drop_db_and_tables() -> None:
    SQLModel.metadata.drop_all(engine)
