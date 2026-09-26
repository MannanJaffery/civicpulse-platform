# ADR 0004: PII and Data Governance in AI Triage

## Status
Accepted

## Context
Citizen complaints may contain Personally Identifiable Information (PII) such as phone numbers, citizen names, and street addresses. Free LLM provider tiers (e.g. Google Gemini free tier) may retain data for model improvement.

## Decision
1. Sanitize/redact sensitive regex patterns (e.g. phone numbers, email addresses) before sending prompts to external LLMs.
2. Only transmit the sanitized complaint body text and generalized municipal district/location.
3. For zero-leakage enterprise deployments, use the local `OllamaTriage` provider running entirely inside the private container network.

## Consequences
- Protects citizen privacy and minimizes PII exposure.
- Maintains compliance with data protection policies.
