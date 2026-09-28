from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.providers.cache.redis_client import get_redis_client
from app.repositories.complaint_repository import ComplaintRepository


class StatsResponseDTO(BaseModel):
    total_complaints: int
    by_category: dict[str, int]
    by_priority: dict[str, int]
    by_status: dict[str, int]


class StatsService:
    def __init__(self, db: Session):
        self.repo = ComplaintRepository(db)
        self.redis = get_redis_client()

    def get_stats(self) -> tuple[StatsResponseDTO, bool]:
        """
        Returns (stats_dto, is_cache_hit)
        """
        cached = self.redis.get_stats_cache()
        if cached is not None:
            return StatsResponseDTO(**cached), True

        # Cache miss - compute from database
        aggregates = self.repo.get_stats_aggregates()
        self.redis.set_stats_cache(aggregates, ttl_seconds=30)
        return StatsResponseDTO(**aggregates), False
