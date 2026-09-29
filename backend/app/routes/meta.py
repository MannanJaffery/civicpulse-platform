from fastapi import APIRouter
from pydantic import BaseModel

from app.providers.triage.factory import get_triage_provider
from app.services.complaint_service import get_triage_outcomes_history

router = APIRouter(prefix="/meta", tags=["meta"])


class TriageOutcome(BaseModel):
    provider: str
    latency_ms: int
    fallback: bool
    timestamp: str


class ProvidersMetaResponse(BaseModel):
    active_provider: str
    outcomes: list[TriageOutcome]


@router.get("/providers", response_model=ProvidersMetaResponse)
def get_providers_meta():
    provider = get_triage_provider()
    history = get_triage_outcomes_history()
    return ProvidersMetaResponse(
        active_provider=provider.name,
        outcomes=[TriageOutcome(**item) for item in history],
    )
