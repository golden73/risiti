import os

# Force an isolated in-memory database before any app module reads settings.
os.environ["DATABASE_URL"] = "sqlite://"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlmodel import Session, SQLModel  # noqa: E402

from app.db import engine  # noqa: E402
from app.main import app  # noqa: E402
from app.seed import seed_if_empty  # noqa: E402


@pytest.fixture()
def clean_db():
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    yield


@pytest.fixture()
def session(clean_db):
    with Session(engine) as db:
        seed_if_empty(db)
        yield db


@pytest.fixture()
def client(clean_db):
    with TestClient(app) as test_client:
        yield test_client
