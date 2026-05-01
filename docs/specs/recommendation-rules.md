# Recommendation Rules V1

## Scope
This document defines deterministic recommendation logic for the POS Log Promo Intelligence Dashboard V1.
The output label in UI and docs is "Rule-based promotion suggestions".

## Rule IDs
- `R-001`: Compute candidate score using weighted blend of item volume and margin rate.
- `R-002`: Rank by score descending; tie-break by margin rate descending, then item code ascending.
- `R-003`: Return top `N` allowed candidates where `N` defaults to 3 and maxes at 5.
- `R-004`: Attach rationale fields for every included candidate.

## Scoring
- `volume_score = min(units / 20, 1.0)`
- `margin_score = gross_margin / revenue`
- `final_score = 0.6 * volume_score + 0.4 * margin_score`

## Guardrails
- `G-001`: Exclude if `margin_score < 0.20`.
- `G-002`: Exclude if transaction count is less than 3.
- `G-003`: Excluded candidates must include one or more exclusion reasons.
- `G-004`: Exclude if history window is below minimum threshold.

## Tie-Breakers
1. Higher `final_score`
2. Higher `margin_score`
3. Lexicographically smaller `item_code`

## Reproducibility Requirements
- Same input data, same guardrail thresholds, and same rules version must produce byte-identical ranking output.
- Recommendation run metadata must capture business date, history window, rules version, and generated timestamp.

## Output Contract
- Panel returns 3-5 candidates (`top_n` configurable, default 3).
- Each candidate includes `item_code`, `final_score`, `expected_lift`, and `rationale`.
- `rationale` includes at minimum `volume_signal`, `margin_signal`, and `time_window_signal`.
- Excluded items are returned in an exclusion list with one or more machine-readable `exclusion_reason` codes and manager-facing text.

## Expected Lift Method (V1)
- Purpose: provide directional estimate, not causal proof.
- Baseline window: prior 2 completed weeks matching the same weekday and store-local hour bands.
- Comparison signal: projected units uplift based on observed dip-window recovery factor capped at 20%.
- Revenue uplift estimate: `projected_unit_uplift * item_price`.
- If baseline units are zero, set expected lift to `0` and emit `INSUFFICIENT_BASELINE` exclusion/warning metadata.

## Defaults
- Minimum history threshold: 4 weeks.
- Uplift baseline window: prior 2 weeks.
- Recommendation count (`top_n`): 3 (configurable up to 5).
