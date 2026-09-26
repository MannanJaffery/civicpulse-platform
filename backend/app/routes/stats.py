from fastapi import APIRouter, Response
from pydantic import BaseModel

router = APIRouter(prefix="/stats", tags=["stats"])


class CategoryStats(BaseModel):
    category: str
    count: int


class PriorityStats(BaseModel):
    priority: str
    count: int


class StatsResponse(BaseModel):
    total_complaints: int
    by_category: list[CategoryStats]
    by_priority: list[PriorityStats]


@router.get("", response_model=StatsResponse)
def get_stats(response: Response):
    # Sets X-Cache header demonstrating cache status
    response.headers["X-Cache"] = "MISS"

    return StatsResponse(
        total_complaints=0,
        by_category=[
            CategoryStats(category="water", count=0),
            CategoryStats(category="electricity", count=0),
            CategoryStats(category="sanitation", count=0),
            CategoryStats(category="roads", count=0),
            CategoryStats(category="streetlights", count=0),
            CategoryStats(category="other", count=0),
        ],
        by_priority=[
            PriorityStats(priority="high", count=0),
            PriorityStats(priority="normal", count=0),
            PriorityStats(priority="low", count=0),
        ],
    )
