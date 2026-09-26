# ADR 0001: Pluggable TriageProvider Interface

## Status
Accepted

## Context
The application requires classifying citizen complaints using an AI/LLM model. External models can experience latency spikes, rate limits, or outages. We require swappable implementations (Groq/Gemini, Ollama, Rule-based keyword matching, Simulated CI fake) without altering business logic.

## Decision
Define a `TriageProvider` protocol/interface returning a validated `TriageResult` Pydantic model. Use a factory pattern driven by `TRIAGE_PROVIDER` environment variable with automated fallback to `RuleBasedTriage`.

## Consequences
- Business logic in `services/` is decoupled from LLM SDKs.
- Automated tests run deterministically in CI via `SimulatedTriage`.
