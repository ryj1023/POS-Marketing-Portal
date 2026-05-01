---
title: feat: Express Internal Dashboard V1
type: feat
date: 2026-05-01
---

# feat: Express Internal Dashboard V1

## Overview

Create a first-version internal dashboard experience with a Node/Express backend and one simple frontend page for a single internal user. The product goal is quick visibility into core POS KPIs, trend snapshots, and recommendation summaries, while keeping scope intentionally read-only and minimal.

The plan builds on existing deterministic domain logic and dashboard contracts already present in this repository, avoiding unnecessary framework or architecture expansion in v1.

## Problem Statement / Motivation

The repository already contains ingestion, analytics, recommendation, uplift, and dashboard view-model logic, but no runtime web application entry point for fast day-to-day visibility. A lightweight Express + simple frontend layer closes that gap and turns existing logic into a usable internal decision surface.

## Proposed Solution

Add an HTTP-serving dashboard surface that:

- exposes a stable dashboard response contract for the UI,
- renders one simple internal page for KPI/trend/recommendation visibility,
- preserves deterministic behavior and current domain boundaries,
- keeps v1 read-only (no CRUD/admin workflows).

## Technical Considerations

- **Architecture impacts**
  - Keep domain ownership in current layers: `src/data`, `src/analytics`, `src/recommendations`, `src/metrics`, `src/ui`.
  - Add orchestration and transport boundaries without restructuring domain modules.
- **Performance implications**
  - Optimize for "quick visibility" on first load; define measurable threshold for internal usage.
  - Prevent mixed-generation panel rendering when filters change rapidly.
- **Security considerations**
  - Internal single-user context lowers complexity, but access mode and exposure boundary still need explicit definition.

## Acceptance Criteria

- [ ] Dashboard provides one first-load view with minimum KPI/trend/recommendation set needed for decision usefulness.
- [ ] All visible panels reflect one unified filter generation (no cross-panel mismatch).
- [ ] A single canonical filter key schema is documented and used consistently across contract and UI.
- [ ] Each panel is always in exactly one state: `loading`, `error`, `empty`, `insufficient_data`, or `ready`.
- [ ] Dashboard always includes freshness metadata (`data_as_of`) and applies warning semantics at defined thresholds.
- [ ] KPI, trend, and recommendation outputs are deterministic and consistent for identical filters.
- [ ] Recommendation action outcomes are durable and unambiguous for repeated actions on the same key.
- [ ] Empty and insufficient-data experiences are clearly distinct and preserve filter context.
- [ ] Initial dashboard usage remains read-only (no create/update/delete workflows in v1).
- [ ] Integration tests validate first-load behavior, filter consistency, panel states, freshness behavior, and recommendation action semantics.

## Success Metrics

- Internal user can open the dashboard and read core KPIs/recommendations in one pass without manual data stitching.
- First-load readiness and refresh behavior meet a declared "quick visibility" target.
- Deterministic tests remain stable across repeated runs for identical input datasets.

## Dependencies & Risks

- **Dependencies**
  - Existing contract specs remain source of truth.
  - Existing domain modules provide required aggregates/recommendations.
- **Primary risks**
  - Filter-schema drift between existing specs.
  - Timezone/business-hours ambiguity causing freshness confusion.
  - Out-of-order updates causing panel inconsistency.
- **Mitigation direction**
  - Publish canonical v1 contract addendum before implementation.
  - Define store-local timezone and business-hours policy explicitly.
  - Define synchronization semantics for rapid filter changes.

## SpecFlow Findings Integrated

The following gaps were identified and incorporated into this plan:

- Canonical filter schema must be unified across docs and behavior.
- State transition semantics must be explicit for `loading/error/empty/insufficient_data/ready`.
- Recommendation action conflict/idempotency rules must be defined.
- Freshness policy must define business-hours and timezone source of truth.
- `data_as_of` and `last_refresh_at` semantics must be clearly distinguished.

## Open Decisions To Resolve Before Implementation

- Exact v1 KPI set shown on first load.
- Canonical filter key names for all layers.
- Default initial filter values.
- Repeated recommendation action policy on the same `business_date + item_code`.
- Explicit target for "quick visibility" success timing.

## References & Research

### Internal References

- Brainstorm input: `docs/brainstorms/2026-05-01-express-internal-dashboard-v1-brainstorm.md`
- Dashboard contract: `docs/specs/dashboard-panel-contracts.md`
- Freshness and filter contract: `docs/specs/data-freshness-and-filters.md`
- Recommendation determinism context: `docs/specs/recommendation-rules.md`
- Existing dashboard view-model shape: `src/ui/dashboard/render.js:4`
- Existing domain recommendation module style: `src/recommendations/rules_engine.js:1`
- Existing ingestion module style: `src/data/ingestion/pos_importer.js:1`
- Existing end-to-end integration test pattern: `tests/integration/import_and_recommendation_flow.test.js:10`
- Related prior plans:
  - `docs/plans/2026-05-01-feat-pos-log-promo-intelligence-dashboard-v1-plan.md`
  - `docs/plans/2026-05-01-feat-pos-log-dashboard-expanded-requirements-plan.md`

### Institutional Learnings

- No `docs/solutions/` directory currently exists in this repository; no prior institutional solution notes were available to apply.

### External Research Decision

- External research was intentionally skipped for this plan because:
  - the feature is low-risk (no payments/security/external API integration),
  - repository-local contracts and patterns are already strong and directly relevant,
  - scope is an internal MVP with clear YAGNI constraints.
