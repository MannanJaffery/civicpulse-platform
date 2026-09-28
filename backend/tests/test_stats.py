def test_stats_aggregation_and_x_cache_header(client):
    # Create two complaints
    client.post(
        "/api/complaints",
        json={
            "text": "Main water pipeline broke on Street 9, water leaking everywhere.",
            "location": "Street 9, Sector F-8",
        },
    )
    client.post(
        "/api/complaints",
        json={
            "text": "Streetlight fixture detached and dangling over pavement.",
            "location": "Block C, Commercial Area",
        },
    )

    # First request: Cache MISS
    res1 = client.get("/api/stats")
    assert res1.status_code == 200
    assert res1.headers.get("X-Cache") == "MISS"
    data1 = res1.json()
    assert data1["total_complaints"] >= 2
    assert "by_category" in data1
    assert "by_priority" in data1
    assert "by_status" in data1

    # Second request: Cache HIT
    res2 = client.get("/api/stats")
    assert res2.status_code == 200
    assert res2.headers.get("X-Cache") == "HIT"
    assert res2.json() == data1


def test_stats_cache_invalidation_on_write(client):
    # Prime cache
    res1 = client.get("/api/stats")
    assert res1.status_code == 200

    # Ensure cache is warm
    res_warm = client.get("/api/stats")
    assert res_warm.headers.get("X-Cache") == "HIT"

    # Write a new complaint (triggers cache invalidation)
    client.post(
        "/api/complaints",
        json={
            "text": "Kachra kundi overflowing near dispensary with foul smell.",
            "location": "Plot 12, Sector I-10",
        },
    )

    # Subsequent request should be a Cache MISS
    res_after_write = client.get("/api/stats")
    assert res_after_write.status_code == 200
    assert res_after_write.headers.get("X-Cache") == "MISS"
