import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db import get_db_session
from app.providers.triage.base import Category, Priority
from app.services.complaint_service import (
    ComplaintCreateDTO,
    ComplaintNotFoundException,
    ComplaintResponseDTO,
    ComplaintService,
    InvalidStateTransitionException,
    RateLimitExceededException,
)

router = APIRouter(prefix="/complaints", tags=["complaints"])


class ComplaintCreateRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=2000)
    location: str = Field(..., min_length=3, max_length=200)
    reporter_contact: Optional[str] = None


class StatusUpdateRequest(BaseModel):
    status: str = Field(..., description="Target status (open, in_progress, resolved, rejected)")


class PaginatedComplaintsResponse(BaseModel):
    items: list[ComplaintResponseDTO]
    total: int
    page: int
    page_size: int


@router.post("", response_model=ComplaintResponseDTO, status_code=status.HTTP_201_CREATED)
def create_complaint(
    payload: ComplaintCreateRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db_session),
):
    client_ip = request.client.host if request.client else "127.0.0.1"
    # Support forwarded headers if behind reverse proxy
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()

    service = ComplaintService(db)
    try:
        dto = ComplaintCreateDTO(
            text=payload.text,
            location=payload.location,
            reporter_contact=payload.reporter_contact,
        )
        return service.create_complaint(dto, client_ip=client_ip)
    except RateLimitExceededException as exc:
        response.headers["Retry-After"] = str(exc.retry_after)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(exc),
            headers={"Retry-After": str(exc.retry_after)},
        )


@router.get("/{complaint_id}", response_model=ComplaintResponseDTO)
def get_complaint(
    complaint_id: uuid.UUID,
    db: Session = Depends(get_db_session),
):
    service = ComplaintService(db)
    try:
        return service.get_complaint(complaint_id)
    except ComplaintNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with id '{complaint_id}' not found",
        )


@router.get("", response_model=PaginatedComplaintsResponse)
def list_complaints(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[Category] = None,
    priority: Optional[Priority] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db_session),
):
    service = ComplaintService(db)
    result = service.list_complaints(
        category=category,
        priority=priority,
        status=status_filter,
        page=page,
        page_size=page_size,
    )
    return PaginatedComplaintsResponse(
        items=result.items,
        total=result.total,
        page=result.page,
        page_size=result.page_size,
    )


@router.patch("/{complaint_id}/status", response_model=ComplaintResponseDTO)
def update_complaint_status(
    complaint_id: uuid.UUID,
    payload: StatusUpdateRequest,
    db: Session = Depends(get_db_session),
):
    service = ComplaintService(db)
    try:
        return service.update_status(complaint_id, payload.status)
    except ComplaintNotFoundException:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with id '{complaint_id}' not found",
        )
    except InvalidStateTransitionException as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Invalid status transition from '{exc.current_status}' to '{exc.target_status}'",
        )
