import uuid


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
    assert data["category"] == "water"
    assert data["triaged_by"] is not None
    assert "created_at" in data
    assert "updated_at" in data


def test_create_complaint_validation_error_short_text(client):
    # Text too short (< 10 chars)
    payload = {"text": "Short", "location": "Sector F-8"}
    response = client.post("/api/complaints", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "errors" in data
    assert any("text" in str(err["field"]) for err in data["errors"])


def test_create_complaint_validation_error_short_location(client):
    # Location too short (< 3 chars)
    payload = {"text": "Valid length complaint text here.", "location": "F"}
    response = client.post("/api/complaints", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert "errors" in data
    assert any("location" in str(err["field"]) for err in data["errors"])


def test_get_complaint_by_id(client):
    # Create complaint
    create_res = client.post(
        "/api/complaints",
        json={
            "text": "Pothole on service road causing traffic delay.",
            "location": "Service Road North, G-10",
        },
    )
    assert create_res.status_code == 201
    complaint_id = create_res.json()["id"]

    # Fetch by ID
    get_res = client.get(f"/api/complaints/{complaint_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == complaint_id


def test_get_complaint_not_found(client):
    random_id = str(uuid.uuid4())
    response = client.get(f"/api/complaints/{random_id}")
    assert response.status_code == 404
    assert "Complaint with id" in response.json()["detail"]


def test_list_complaints_pagination_and_filtering(client):
    # Create 3 complaints
    for i in range(3):
        client.post(
            "/api/complaints",
            json={
                "text": f"Complaint text item number {i} with sufficient length.",
                "location": f"Sector G-{i + 1}",
            },
        )

    # List complaints
    list_res = client.get("/api/complaints?page=1&page_size=2")
    assert list_res.status_code == 200
    data = list_res.json()
    assert len(data["items"]) == 2
    assert data["total"] == 3
    assert data["page"] == 1
    assert data["page_size"] == 2


def test_status_transition_state_machine_valid(client):
    # 1. Create complaint (starts open)
    create_res = client.post(
        "/api/complaints",
        json={
            "text": "Streetlight fixture detached and dangling over pavement.",
            "location": "Block C, Commercial Area",
        },
    )
    assert create_res.status_code == 201
    complaint_id = create_res.json()["id"]

    # 2. open -> in_progress
    patch_res1 = client.patch(
        f"/api/complaints/{complaint_id}/status", json={"status": "in_progress"}
    )
    assert patch_res1.status_code == 200
    assert patch_res1.json()["status"] == "in_progress"

    # 3. in_progress -> resolved
    patch_res2 = client.patch(f"/api/complaints/{complaint_id}/status", json={"status": "resolved"})
    assert patch_res2.status_code == 200
    assert patch_res2.json()["status"] == "resolved"


def test_status_transition_invalid_409(client):
    create_res = client.post(
        "/api/complaints",
        json={
            "text": "Water pipeline burst causing street flooding.",
            "location": "Sector H-8/4",
        },
    )
    complaint_id = create_res.json()["id"]

    # Advance to in_progress
    client.patch(f"/api/complaints/{complaint_id}/status", json={"status": "in_progress"})

    # Invalid: in_progress -> open
    invalid_patch = client.patch(f"/api/complaints/{complaint_id}/status", json={"status": "open"})
    assert invalid_patch.status_code == 409
    assert (
        "Invalid status transition from 'in_progress' to 'open'" in invalid_patch.json()["detail"]
    )


def test_status_transition_terminal_state_409(client):
    create_res = client.post(
        "/api/complaints",
        json={
            "text": "Garbage dump overflowing outside residential colony.",
            "location": "Street 19, F-11",
        },
    )
    complaint_id = create_res.json()["id"]

    # open -> rejected
    client.patch(f"/api/complaints/{complaint_id}/status", json={"status": "rejected"})

    # rejected -> in_progress (invalid because rejected is terminal)
    invalid_patch = client.patch(
        f"/api/complaints/{complaint_id}/status", json={"status": "in_progress"}
    )
    assert invalid_patch.status_code == 409
    assert (
        "Invalid status transition from 'rejected' to 'in_progress'"
        in invalid_patch.json()["detail"]
    )
