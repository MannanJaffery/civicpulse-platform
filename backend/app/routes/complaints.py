import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Response, status
from pydantic import BaseModel, Field

from app.providers.triage.base import Category, Priority
from app.providers.triage.factory import get_triage_provider

router = APIRouter(prefix="/complaints", tags=["complaints"])


class ComplaintCreate(BaseModel):
    text: str = Field(..., min_length=10, max_length=2000)
    location: str = Field(..., min_length=3, max_length=200)
    reporter_contact: Optional[str] = None


class ComplaintResponse(BaseModel):
    id: uuid.UUID
    text: str
    location: str
    reporter_contact: Optional[str] = None
    category: Category
    priority: Priority
    status: str
    ai_summary: Optional[str] = None
    triaged_by: str
    triage_latency_ms: int
    created_at: datetime
    updated_at: datetime


class StatusUpdate(BaseModel):
    status: str


# In-memory store for initial boilerplate
_IN_MEMORY_COMPLAINTS: dict[uuid.UUID, ComplaintResponse] = {}

VALID_TRANSITIONS = {
    "open": ["in_progress", "rejected"],
    "in_progress": ["resolved", "rejected"],
    "resolved": [],
    "rejected": [],
}


@router.post("", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(payload: ComplaintCreate):
    provider = get_triage_provider()
    start_time = datetime.now(timezone.utc)
    
    triage_res = provider.triage(payload.text, payload.location)
    latency_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

    complaint_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    complaint = ComplaintResponse(
        id=complaint_id,
        text=payload.text,
        location=payload.location,
        reporter_contact=payload.reporter_contact,
        category=triage_res.category,
        priority=triage_res.priority,
        status="open",
        ai_summary=triage_res.summary,
        triaged_by=provider.name,
        triage_latency_ms=latency_ms,
        created_at=now,
        updated_at=now,
    )
    _IN_MEMORY_COMPLAINTS[complaint_id] = complaint
    return complaint


@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: uuid.UUID):
    if complaint_id not in _IN_MEMORY_COMPLAINTS:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
    return _IN_MEMORY_COMPLAINTS[complaint_id]


@router.get("", response_model=list[ComplaintResponse])
def list_complaints(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[Category] = None,
    priority: Optional[Priority] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
):
    items = list(_IN_MEMORY_COMPLAINTS.values())
    if category:
        items = [i for i in items if i.category == category]
    if priority:
        items = [i for i in items if i.priority == priority]
    if status_filter:
        items = [i for i in items if i.status == status_filter]

    start = (page - 1) * page_size
    return items[start : start + page_size]


@router.patch("/{complaint_id}/status", response_model=ComplaintResponse)
def update_status(complaint_id: uuid.UUID, update: StatusUpdate):
    if complaint_id not in _IN_MEMORY_COMPLAINTS:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")

    complaint = _IN_MEMORY_COMPLAINTS[complaint_id]
    current_status = complaint.status
    target_status = update.status

    allowed_targets = VALID_TRANSITIONS.get(current_status, [])
    if target_status not in allowed_targets:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Invalid status transition from '{current_status}' to '{target_status}'",
        )

    updated_complaint = complaint.model_copy(
        update={"status": target_status, "updated_at": datetime.now(timezone.utc)}
    )
    _IN_MEMORY_COMPLAINTS[complaint_id] = updated_complaint
    return updated_complaint
