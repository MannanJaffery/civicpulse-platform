from unittest.mock import MagicMock, patch


def test_liveness_probe(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "process": "healthy"}


def test_readiness_probe_success(client):
    with patch("app.main.get_redis_client") as mock_get_redis:
        mock_redis = MagicMock()
        mock_redis.ping.return_value = True
        mock_get_redis.return_value = mock_redis

        response = client.get("/ready")
        assert response.status_code == 200
        assert response.json()["status"] == "ready"
        assert response.json()["database"] == "connected"
        assert response.json()["cache"] == "connected"


def test_readiness_probe_cache_failure_503(client):
    with patch("app.main.get_redis_client") as mock_get_redis:
        mock_redis = MagicMock()
        mock_redis.ping.return_value = False
        mock_get_redis.return_value = mock_redis

        response = client.get("/ready")
        assert response.status_code == 503
        assert response.json()["status"] == "unready"
        assert any("cache" in dep for dep in response.json()["failed_dependencies"])


def test_metrics_endpoint(client):
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "http_requests_total" in response.text
    assert "http_request_duration_seconds" in response.text
