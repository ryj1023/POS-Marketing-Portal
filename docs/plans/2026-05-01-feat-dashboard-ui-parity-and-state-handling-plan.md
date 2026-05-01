---
title: feat: Dashboard UI Parity and State Handling
type: feat
date: 2026-05-01
---

# feat: Dashboard UI Parity and State Handling

## Overview

Update the internal dashboard UI to match the approved mockup direction and fully implement panel state handling requirements. This work focuses on visual and behavioral parity for core dashboard panels while preserving existing deterministic backend contracts and synchronized filter semantics.

## Problem Statement / Motivation

The current UI is functional but incomplete relative to the target dashboard experience. It lacks several key panels and state behaviors expected by existing specs and mockups, which limits usability and confidence in dashboard outputs.

Without clear parity and state requirements, the UI can drift from data contracts and provide inconsistent behavior during loading, empty data, stale data, and error conditions.

## Proposed Solution

Deliver a UI update that includes all v1 dashboard panels shown in mockups, plus explicit panel-state behavior and freshness semantics:

- Header context (store/location/date/shift + live indicator)
- KPI strip with directional deltas
- Best-selling items panel
- Category breakdown panel
- Hourly quantity chart panel
- Recommendation panel with action affordances
- Recent transactions panel

Use one synchronized filter/request cycle so all panels represent the same data context at all times.

## Technical Considerations

- **Architecture impacts**
  - Keep current lightweight frontend approach and existing backend response contract alignment.
  - Avoid introducing new framework complexity for v1.
- **Performance implications**
  - Preserve quick first-render behavior while adding richer panel rendering.
  - Define behavior for rapid filter changes to prevent mixed-cycle panel displays.
- **Security considerations**
  - Internal app context remains unchanged; no new external integration risk in this feature scope.

## Acceptance Criteria

- [x] UI includes all v1 panels from the mockup references:
  - `docs/mockups/Screenshot 2026-05-01 at 8.44.05 AM.png`
  - `docs/mockups/Screenshot 2026-05-01 at 8.44.20 AM.png`
- [x] All dashboard panels render from one synchronized filter/request context (no mixed old/new panel content).
- [x] Every panel supports and visibly distinguishes `loading`, `error`, `empty`, `insufficient_data`, and `ready`.
- [x] Freshness behavior is implemented with two warning tiers:
  - stale warning when data age exceeds 2 hours during business hours,
  - stronger warning when data age exceeds 24 hours.
- [x] Empty and insufficient-data states preserve visible filters and freshness metadata and use distinct user-facing copy.
- [x] Header and metadata clearly surface `data_as_of` and relevant refresh context.
- [x] Recommendation panel presents ranked recommendations with rationale and expected lift context consistent with existing deterministic rules.
- [x] Recent transactions panel presents most recent processed batch entries with clear timestamp and total formatting.
- [x] UI formatting is consistent for currency, percentages, unit counts, and positive/negative deltas.
- [x] Accessibility baseline is met for keyboard navigation, semantic headings/landmarks, and visible/announced state changes.

## Success Metrics

- Dashboard matches the mockup panel structure closely enough for internal stakeholder sign-off.
- Users can identify KPI performance, trend context, recommendation opportunities, and latest transactions in one scan.
- UI behavior for loading/empty/error/stale conditions is deterministic and testable.

## Dependencies & Risks

- **Dependencies**
  - Existing contract and freshness specs:
    - `docs/specs/dashboard-panel-contracts.md`
    - `docs/specs/data-freshness-and-filters.md`
  - Existing UI/API shape and current app shell:
    - `src/ui/public/index.html`
    - `src/ui/public/main.js`
    - `src/ui/dashboard/render.js`
- **Risks**
  - Contract naming drift between docs and runtime filter keys.
  - Ambiguity in business-hours definition for stale warnings.
  - UI complexity growth without explicit panel-state matrix.
- **Mitigation**
  - Lock canonical filter schema for this UI phase.
  - Document stale-warning policy and timezone assumptions before implementation.
  - Define panel-by-panel state expectations and review against mockups.

## SpecFlow Findings Integrated

This plan incorporates the following gaps identified during flow analysis:

- Missing panel parity versus mockups.
- Missing explicit state model across all panels.
- Missing second-tier stale warning and business-hours policy clarity.
- Missing behavior for synchronized rerenders during filter changes and slow responses.
- Missing explicit differentiation of empty vs insufficient-data UX.

## Open Questions

- What is the canonical filter key vocabulary for UI requests and state display?
- What exact business-hours window should drive stale-warning logic?
- Is visual parity expected to be exact (spacing/colors/typography) or functionally equivalent?
- Should recommendation actions be in scope for this UI-only phase or staged to a follow-up plan?

## References & Research

### Internal References

- Brainstorm source: `docs/brainstorms/2026-05-01-express-internal-dashboard-v1-brainstorm.md`
- Prior implementation plan: `docs/plans/2026-05-01-feat-express-internal-dashboard-v1-plan.md`
- Expanded requirements plan: `docs/plans/2026-05-01-feat-pos-log-dashboard-expanded-requirements-plan.md`
- Current frontend shell: `src/ui/public/index.html:1`
- Current UI renderer logic: `src/ui/public/main.js:1`
- Current dashboard response shape: `src/ui/dashboard/render.js:1`
- Mockup files:
  - `docs/mockups/Screenshot 2026-05-01 at 8.44.05 AM.png`
  - `docs/mockups/Screenshot 2026-05-01 at 8.44.20 AM.png`

### Institutional Learnings

- No `docs/solutions/` directory currently exists; no prior institutional learnings were available for reuse.

### External Research Decision

- External research was skipped: this is a low-risk UI parity update with strong local patterns, contracts, and mockup references already available.
