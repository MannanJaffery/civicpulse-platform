from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

from app.providers.triage.factory import get_triage_provider

router = APIRouter(prefix="/meta", tags=["meta"])


class TriageOutcome(BaseModel):
    provider: str
    latency_ms: int
    fallback: bool
    timestamp: datetime


class ProvidersMetaResponse(BaseModel):
    active_provider: str
    outcomes: list[TriageOutcome]


_OUTCOMES_HISTORY: list[TriageOutcome] = []


@router.get("/providers", response_model=ProvidersMetaResponse)
def get_providers_meta():
    provider = get_triage_provider()
    return ProvidersMetaResponse(
        active_provider=provider.name,
        outcomes=_OUTCOMES_HISTORY[-20:],
    )
