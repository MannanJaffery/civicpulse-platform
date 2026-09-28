import uuid
from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models import ComplaintModel, ComplaintStatus
from app.providers.triage.base import Category, Priority


class ComplaintRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: dict[str, Any]) -> ComplaintModel:
        complaint = ComplaintModel(
            id=data.get("id") or uuid.uuid4(),
            text=str(data["text"]),
            location=str(data["location"]),
            reporter_contact=data.get("reporter_contact"),
            category=Category(str(data["category"])),
            priority=Priority(str(data["priority"])),
            status=ComplaintStatus(str(data.get("status", "open"))),
            ai_summary=data.get("ai_summary"),
            triaged_by=str(data["triaged_by"]),
            triage_latency_ms=int(data.get("triage_latency_ms", 0)),
            created_at=data.get("created_at") or datetime.now(timezone.utc),
            updated_at=data.get("updated_at") or datetime.now(timezone.utc),
        )
        self.db.add(complaint)
        self.db.commit()
        self.db.refresh(complaint)
        return complaint

    def get_by_id(self, complaint_id: UUID) -> Optional[ComplaintModel]:
        return self.db.get(ComplaintModel, complaint_id)

    def list_complaints(
        self,
        category: Optional[Category] = None,
        priority: Optional[Priority] = None,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[ComplaintModel], int]:
        query = select(ComplaintModel)
        count_query = select(func.count(ComplaintModel.id))

        if category:
            query = query.where(ComplaintModel.category == category)
            count_query = count_query.where(ComplaintModel.category == category)
        if priority:
            query = query.where(ComplaintModel.priority == priority)
            count_query = count_query.where(ComplaintModel.priority == priority)
        if status:
            status_enum = ComplaintStatus(status)
            query = query.where(ComplaintModel.status == status_enum)
            count_query = count_query.where(ComplaintModel.status == status_enum)

        total = int(self.db.execute(count_query).scalar_one())

        offset = (page - 1) * page_size
        stmt = query.order_by(desc(ComplaintModel.created_at)).offset(offset).limit(page_size)
        items = list(self.db.execute(stmt).scalars().all())

        return items, total

    def update_status(self, complaint_id: UUID, new_status: str) -> Optional[ComplaintModel]:
        complaint = self.get_by_id(complaint_id)
        if not complaint:
            return None
        complaint.status = ComplaintStatus(new_status)
        complaint.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(complaint)
        return complaint

    def get_stats_aggregates(self) -> dict[str, Any]:
        total = int(self.db.execute(select(func.count(ComplaintModel.id))).scalar_one())

        # Category counts
        cat_stmt = select(ComplaintModel.category, func.count(ComplaintModel.id)).group_by(
            ComplaintModel.category
        )
        cat_results: dict[Any, int] = {
            row[0]: int(row[1]) for row in self.db.execute(cat_stmt).all()
        }
        by_category = {c.value: cat_results.get(c, 0) for c in Category}

        # Priority counts
        prio_stmt = select(ComplaintModel.priority, func.count(ComplaintModel.id)).group_by(
            ComplaintModel.priority
        )
        prio_results: dict[Any, int] = {
            row[0]: int(row[1]) for row in self.db.execute(prio_stmt).all()
        }
        by_priority = {p.value: prio_results.get(p, 0) for p in Priority}

        # Status counts
        status_stmt = select(ComplaintModel.status, func.count(ComplaintModel.id)).group_by(
            ComplaintModel.status
        )
        status_results: dict[Any, int] = {
            row[0]: int(row[1]) for row in self.db.execute(status_stmt).all()
        }
        by_status = {
            s.value: status_results.get(s, 0)
            for s in [
                ComplaintStatus.OPEN,
                ComplaintStatus.IN_PROGRESS,
                ComplaintStatus.RESOLVED,
                ComplaintStatus.REJECTED,
            ]
        }

        return {
            "total_complaints": total,
            "by_category": by_category,
            "by_priority": by_priority,
            "by_status": by_status,
        }
