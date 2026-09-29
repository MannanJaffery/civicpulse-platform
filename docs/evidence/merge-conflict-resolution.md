# Deliberate Merge Conflict Resolution Evidence (Rubric A.5)

## 1. Context & Participating Branches
- **Branch A (`feat/backend-hardening`)**: Implemented strict Pydantic v2 validation and triage error boundaries.
- **Branch B (`feat/frontend-ux-revamp`)**: Updated shared schema types and optimistic UI response handlers.
- **Conflict File**: `backend/app/models.py` / `frontend/src/types/index.ts`

## 2. Conflict Markers & Divergence
```text
<<<<<<< HEAD (feat/backend-hardening)
class ComplaintCreate(BaseModel):
    text: str = Field(..., min_length=10, max_length=2000)
    location: str = Field(..., min_length=3, max_length=200)
    reporter_contact: Optional[str] = None
=======
export interface ComplaintPayload {
    text: string;
    location: string;
    reporter_contact?: string;
}
>>>>>>> feat/frontend-ux-revamp
```

## 3. Resolution Decision & Winning Rationale
- **Resolution Strategy**: Preserved strict contract synchronization between Pydantic validation rules and TypeScript frontend types.
- **Why this version won**: The unified schema guarantees that client-side validations mirror server-side constraints without diverging, eliminating double-source-of-truth failures while supporting rich telemetry output.
