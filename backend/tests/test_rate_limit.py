from unittest.mock import patch


def test_rate_limiter_exceeded_returns_429(client):
    with patch("app.providers.cache.redis_client.RedisClient.check_rate_limit") as mock_rate_limit:
        # Simulate rate limit exceeded
        mock_rate_limit.return_value = (False, 45)

        response = client.post(
            "/api/complaints",
            json={
                "text": "Frequent power outages in our commercial area.",
                "location": "Commercial Area, F-7",
            },
        )
        assert response.status_code == 429
        assert "Retry-After" in response.headers
        assert response.headers["Retry-After"] == "45"
        assert "Rate limit exceeded" in response.json()["detail"]
