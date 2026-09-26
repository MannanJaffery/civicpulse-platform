def test_liveness_probe(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "process": "healthy"}


def test_readiness_probe(client):
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"


def test_metrics_endpoint(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "http_requests_total" in response.text
