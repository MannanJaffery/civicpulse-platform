from app.providers.triage.rules import RuleBasedTriage


def test_create_complaint_success(client):
    payload = {
        "text": "Main water pipeline broke on Street 9, water leaking everywhere.",
        "location": "Street 9, Sector F-8",
        "reporter_contact": "citizen@example.com",
    }
    response = client.post("/api/complaints", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["text"] == payload["text"]
    assert data["location"] == payload["location"]
    assert data["status"] == "open"
    assert data["triaged_by"] is not None


def test_create_complaint_validation_error(client):
    # Text too short (< 10 chars)
    payload = {"text": "Short", "location": "Loc"}
    response = client.post("/api/complaints", json=payload)
    assert response.status_code == 422


def test_status_transition_state_machine(client):
    # 1. Create a complaint
    create_res = client.post(
        "/api/complaints",
        json={
            "text": "Streetlight fixture detached and dangling over pavement.",
            "location": "Block C, Commercial Area",
        },
    )
    assert create_res.status_code == 201
    complaint_id = create_res.json()["id"]

    # 2. Valid transition: open -> in_progress
    patch_res = client.patch(
        f"/api/complaints/{complaint_id}/status", json={"status": "in_progress"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "in_progress"

    # 3. Invalid transition: in_progress -> open (should be 409 Conflict)
    invalid_patch = client.patch(f"/api/complaints/{complaint_id}/status", json={"status": "open"})
    assert invalid_patch.status_code == 409
    assert "Invalid status transition" in invalid_patch.json()["detail"]


def test_triage_provider_fallback(monkeypatch, client):
    # Inject a failing provider
    def failing_provider_factory(*args, **kwargs):
        class FailingProvider:
            name = "rules:fallback"

            def triage(self, text, location):
                return RuleBasedTriage().triage(text, location)

        return FailingProvider()

    monkeypatch.setattr("app.routes.complaints.get_triage_provider", failing_provider_factory)

    response = client.post(
        "/api/complaints",
        json={
            "text": "Severe water contamination reported in district 4 reservoir.",
            "location": "District 4",
        },
    )
    assert response.status_code == 201
    assert response.json()["triaged_by"] == "rules:fallback"
