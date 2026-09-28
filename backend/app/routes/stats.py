from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.db import get_db_session
from app.services.stats_service import StatsResponseDTO, StatsService

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("", response_model=StatsResponseDTO)
def get_stats(
    response: Response,
    db: Session = Depends(get_db_session),
):
    service = StatsService(db)
    stats_dto, is_hit = service.get_stats()

    response.headers["X-Cache"] = "HIT" if is_hit else "MISS"
    return stats_dto
