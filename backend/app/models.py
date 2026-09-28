import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Index,
    Integer,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy import (
    Enum as SqlEnum,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base
from app.providers.triage.base import Category, Priority


class ComplaintStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class ComplaintModel(Base):
    __tablename__ = "complaints"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    reporter_contact: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    category: Mapped[Category] = mapped_column(
        SqlEnum(Category, name="category_enum", native_enum=False),
        nullable=False,
    )
    priority: Mapped[Priority] = mapped_column(
        SqlEnum(Priority, name="priority_enum", native_enum=False),
        nullable=False,
    )
    status: Mapped[ComplaintStatus] = mapped_column(
        SqlEnum(ComplaintStatus, name="status_enum", native_enum=False),
        nullable=False,
        default=ComplaintStatus.OPEN,
    )

    ai_summary: Mapped[Optional[str]] = mapped_column(String(140), nullable=True)
    triaged_by: Mapped[str] = mapped_column(String(50), nullable=False)
    triage_latency_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        CheckConstraint(
            "length(text) >= 10 AND length(text) <= 2000", name="chk_complaints_text_len"
        ),
        CheckConstraint(
            "length(location) >= 3 AND length(location) <= 200", name="chk_complaints_location_len"
        ),
        Index("ix_complaints_status_priority", "status", "priority"),
        Index("ix_complaints_created_at", "created_at"),
    )
