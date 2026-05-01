---
date: 2026-05-01
topic: express-internal-dashboard-v1
---

# Express Internal Dashboard V1

## What We're Building
We are defining a first version of an internal dashboard application with a Node/Express backend and a simple frontend page. The initial user is a single internal user (the project owner), and the main goal is to open the app and quickly see key POS metrics and recommendation outputs.

This v1 should surface the highest-value dashboard information with minimal complexity: core KPIs, trend snapshots, and recommendation summaries from existing domain logic. It is intentionally a read-first experience, not an admin system.

## Why This Approach
We considered three directions: backend-first, frontend-mock-first, and API + simple dashboard page. We chose API + simple dashboard page because it provides the fastest end-to-end validation of user value while keeping the architecture clean.

This option also aligns with YAGNI: enough structure to support growth (API boundary + UI consumption), but no premature investment in advanced workflows, multi-user concerns, or rich UI frameworks.

## Key Decisions
- Build a single-user internal dashboard first: optimize for fast iteration and clarity before team-wide rollout.
- Focus on quick visibility of key metrics as the primary success criterion: dashboard usefulness beats feature breadth in v1.
- Use an Express API with one simple frontend page: creates a clean contract while still delivering immediate visual value.
- Keep v1 read-only: no CRUD/admin editing in initial scope to avoid unnecessary complexity.
- Align with existing repository patterns and domain outputs: reuse current deterministic data/recommendation contracts.

## Open Questions
- Which specific KPI set must appear in the first visible dashboard view?
- Should v1 use static sample data loading or directly wire existing ingestion outputs from day one?
- What refresh expectation is acceptable for v1 (manual refresh vs lightweight periodic refresh)?

## Next Steps
-> `/workflows:plan` for implementation details.
