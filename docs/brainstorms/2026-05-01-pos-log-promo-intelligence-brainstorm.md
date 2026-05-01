---
date: 2026-05-01
topic: pos-log-promo-intelligence
---

# POS Log Promo Intelligence Dashboard (V1)

## What We're Building
We are defining a V1 dashboard for store managers that helps answer one daily question: what should we promote today? The product will analyze single-store historical POS logs (JSON/CSV source mapped to the transaction schema in `docs/initial-plan.md`) and present clear, action-oriented promotion suggestions.

The dashboard will include core sales context (item/category performance over day/week windows, margin visibility, and trend indicators), but the center of gravity is promotion decision support rather than general exploration. LLM functionality is out of scope for V1; recommendations will be deterministic and rule-based.

## Why This Approach
We considered three directions: promo-first, balanced analytics + promo, and exploration-first analytics. We selected the promo-first approach because it most directly serves the primary user (store manager) and target outcome (promo uplift), while keeping scope tight enough for a focused first release.

This also follows YAGNI: we avoid building broad exploratory tooling or AI generation before proving the value of straightforward promotion guidance. If V1 shows uplift and adoption, richer analytics and optional AI narration can be layered in later.

## Key Decisions
- Primary user is store manager for daily operational decisions.
- Core decision supported is what to promote today.
- V1 scope is single-store historical data (non-real-time ingestion).
- Success metric is promo uplift after managers use recommendations.
- Recommendation engine is rule-based only; no LLM dependency in V1.
- Dashboard design prioritizes actionability over broad analysis depth.

## Open Questions
- What minimum data history is required for reliable recommendations (for example, 2 weeks vs 8 weeks)?
- What business guardrails should block bad promos (low stock, too-low margin, vendor constraints)?
- How should managers provide feedback on suggestions (accept/reject/edited) for future iteration?
- What baseline period should be used to measure promo uplift consistently?

## Next Steps
Proceed to `/workflows:plan` to define implementation approach, system design, data processing flow, and delivery steps.
