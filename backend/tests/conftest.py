import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Force test configuration
os.environ["TRIAGE_PROVIDER"] = "simulated"
os.environ["ENVIRONMENT"] = "test"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["RATE_LIMIT_PER_MINUTE"] = "20"

from app.db import Base, get_db_session
from app.main import app
from app.providers.cache.redis_client import get_redis_client

# In-memory SQLite for deterministic, fast, hermetic testing
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    redis_client = get_redis_client()
    redis_client._in_memory_store.clear()
    yield
    Base.metadata.drop_all(bind=test_engine)
    redis_client._in_memory_store.clear()


@pytest.fixture
def db_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db_session] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
