import os

import pytest
from fastapi.testclient import TestClient

# Ensure simulated triage provider is used in tests
os.environ["TRIAGE_PROVIDER"] = "simulated"
os.environ["ENVIRONMENT"] = "test"

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
