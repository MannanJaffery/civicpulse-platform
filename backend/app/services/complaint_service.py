import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.orm import Session

from app.models import ComplaintModel
from app.providers.cache.redis_client import get_redis_client
from app.providers.triage.base import Category, Priority, TriageResult
from app.providers.triage.factory import get_triage_provider
from app.providers.triage.rules import RuleBasedTriage
from app.repositories.complaint_repository import ComplaintRepository

logger = logging.getLogger("civicpulse.complaint_service")


class ComplaintCreateDTO(BaseModel):
    text: str = Field(..., min_length=10, max_length=2000)
    location: str = Field(..., min_length=3, max_length=200)
    reporter_contact: Optional[str] = None


class ComplaintResponseDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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

    @classmethod
    def from_orm_model(cls, model: Any) -> "ComplaintResponseDTO":
        raw_id = getattr(model, "id", None)
        complaint_id: uuid.UUID = (
            raw_id if isinstance(raw_id, uuid.UUID) else uuid.UUID(str(raw_id))
        )

        raw_status = getattr(model, "status", "open")
        status_str: str = (
            raw_status.value if hasattr(raw_status, "value") else str(raw_status)
        )

        raw_cat = getattr(model, "category", Category.OTHER)
        category_enum: Category = (
            raw_cat if isinstance(raw_cat, Category) else Category(str(raw_cat))
        )

        raw_prio = getattr(model, "priority", Priority.NORMAL)
        priority_enum: Priority = (
            raw_prio if isinstance(raw_prio, Priority) else Priority(str(raw_prio))
        )

        raw_contact = getattr(model, "reporter_contact", None)
        reporter_contact_val: Optional[str] = (
            str(raw_contact) if raw_contact is not None else None
        )

        raw_summary = getattr(model, "ai_summary", None)
        ai_summary_val: Optional[str] = (
            str(raw_summary) if raw_summary is not None else None
        )

        raw_created_at = getattr(model, "created_at", None)
        created_at_val: datetime = (
            raw_created_at
            if isinstance(raw_created_at, datetime)
            else datetime.now(timezone.utc)
        )

        raw_updated_at = getattr(model, "updated_at", None)
        updated_at_val: datetime = (
            raw_updated_at
            if isinstance(raw_updated_at, datetime)
            else datetime.now(timezone.utc)
        )

        return cls(
            id=complaint_id,
            text=str(getattr(model, "text", "")),
            location=str(getattr(model, "location", "")),
            reporter_contact=reporter_contact_val,
            category=category_enum,
            priority=priority_enum,
            status=status_str,
            ai_summary=ai_summary_val,
            triaged_by=str(getattr(model, "triaged_by", "unknown")),
            triage_latency_ms=int(str(getattr(model, "triage_latency_ms", 0))),
            created_at=created_at_val,
            updated_at=updated_at_val,
        )


class PaginatedComplaintsDTO(BaseModel):
    items: list[ComplaintResponseDTO]
    total: int
    page: int
    page_size: int


class RateLimitExceededException(Exception):
    def __init__(self, retry_after: int):
        self.retry_after = retry_after
        super().__init__(f"Rate limit exceeded. Retry after {retry_after} seconds.")


class ComplaintNotFoundException(Exception):
    pass


class InvalidStateTransitionException(Exception):
    def __init__(self, current_status: str, target_status: str):
        self.current_status = current_status
        self.target_status = target_status
        super().__init__(f"Invalid status transition from '{current_status}' to '{target_status}'")


# Explicit Status State Machine Transition Table
VALID_TRANSITIONS: dict[str, list[str]] = {
    "open": ["in_progress", "rejected"],
    "in_progress": ["resolved", "rejected"],
    "resolved": [],
    "rejected": [],
}

# Observability ring buffer for triage outcomes
_TRIAGE_OUTCOMES_HISTORY: list[dict[str, Any]] = []


def record_triage_outcome(provider: str, latency_ms: int, fallback: bool) -> None:
    global _TRIAGE_OUTCOMES_HISTORY
    _TRIAGE_OUTCOMES_HISTORY.append(
        {
            "provider": provider,
            "latency_ms": latency_ms,
            "fallback": fallback,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )
    if len(_TRIAGE_OUTCOMES_HISTORY) > 50:
        _TRIAGE_OUTCOMES_HISTORY.pop(0)


def get_triage_outcomes_history() -> list[dict[str, Any]]:
    return _TRIAGE_OUTCOMES_HISTORY[-20:]


class ComplaintService:
    def __init__(self, db: Session):
        self.repo = ComplaintRepository(db)
        self.redis = get_redis_client()

    def create_complaint(self, dto: ComplaintCreateDTO, client_ip: str) -> ComplaintResponseDTO:
        # 1. Distributed rate limiter check in Redis
        allowed, retry_after = self.redis.check_rate_limit(client_ip, limit=20, window_seconds=60)
        if not allowed:
            raise RateLimitExceededException(retry_after)

        # 2. Triage classification & latency measurement
        provider = get_triage_provider()
        start_time = datetime.now(timezone.utc)

        is_fallback = False
        triaged_by_name = getattr(provider, "name", "unknown")
        triage_res: TriageResult

        try:
            triage_res = provider.triage(dto.text, dto.location)
            # If LLM returned fixed confidence 0.80, it used internal fallback
            if (
                getattr(provider, "name", "") in ("llm:groq", "llm:ollama")
                and triage_res.confidence == 0.80
            ):
                triaged_by_name = "rules:fallback"
                is_fallback = True
        except Exception as exc:
            logger.warning(
                json.dumps(
                    {
                        "event": "triage_fallback",
                        "provider": getattr(provider, "name", "unknown"),
                        "error_class": exc.__class__.__name__,
                        "message": f"Triage provider raised {exc}. Falling back to RuleBasedTriage.",
                    }
                )
            )
            fallback_provider = RuleBasedTriage()
            triage_res = fallback_provider.triage(dto.text, dto.location)
            triaged_by_name = "rules:fallback"
            is_fallback = True

        latency_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
        record_triage_outcome(triaged_by_name, latency_ms, is_fallback)

        # 3. Persistence
        created_model = self.repo.create(
            {
                "id": uuid.uuid4(),
                "text": dto.text,
                "location": dto.location,
                "reporter_contact": dto.reporter_contact,
                "category": triage_res.category.value,
                "priority": triage_res.priority.value,
                "status": "open",
                "ai_summary": triage_res.summary,
                "triaged_by": triaged_by_name,
                "triage_latency_ms": latency_ms,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            }
        )

        # 4. Invalidate stats cache on new write
        self.redis.invalidate_stats_cache()

        return ComplaintResponseDTO.from_orm_model(created_model)

    def get_complaint(self, complaint_id: UUID) -> ComplaintResponseDTO:
        model = self.repo.get_by_id(complaint_id)
        if not model:
            raise ComplaintNotFoundException(f"Complaint with id '{complaint_id}' not found")
        return ComplaintResponseDTO.from_orm_model(model)

    def list_complaints(
        self,
        category: Optional[Category] = None,
        priority: Optional[Priority] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> PaginatedComplaintsDTO:
        page_size = min(max(1, page_size), 100)
        page = max(1, page)
        models, total = self.repo.list_complaints(
            category=category,
            priority=priority,
            status=status,
            page=page,
            page_size=page_size,
        )
        return PaginatedComplaintsDTO(
            items=[ComplaintResponseDTO.from_orm_model(m) for m in models],
            total=total,
            page=page,
            page_size=page_size,
        )

    def update_status(self, complaint_id: UUID, new_status: str) -> ComplaintResponseDTO:
        model = self.repo.get_by_id(complaint_id)
        if not model:
            raise ComplaintNotFoundException(f"Complaint with id '{complaint_id}' not found")

        current_status = model.status.value if hasattr(model.status, "value") else str(model.status)
        allowed_transitions = VALID_TRANSITIONS.get(current_status, [])

        if new_status not in allowed_transitions:
            raise InvalidStateTransitionException(current_status, new_status)

        updated_model = self.repo.update_status(complaint_id, new_status)
        self.redis.invalidate_stats_cache()

        assert updated_model is not None
        return ComplaintResponseDTO.from_orm_model(updated_model)
