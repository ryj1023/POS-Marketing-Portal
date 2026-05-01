# Uplift Definition V1

## Purpose
Define how V1 computes and reports promotion uplift for accepted rule-based recommendations.

## Inclusion Rules
- Default metric includes only recommendations with manager action `accept`.
- `defer` and `reject` are excluded from default uplift rollups.
- Optional diagnostic view may show all actions, clearly labeled as non-default.

## Baseline and Comparison
- Baseline window: prior 2 completed weeks for the same weekday and hour-band pattern.
- Comparison window: active business day after recommendation acceptance.
- If baseline units are zero, uplift percent is undefined; report `0` uplift value and `INSUFFICIENT_BASELINE` flag.

## Calculations
- Unit uplift: `actual_units - baseline_units`.
- Revenue uplift: `(actual_units - baseline_units) * item_price`.
- Uplift percent: `(actual_units - baseline_units) / baseline_units` when baseline is greater than zero.

## Reporting Constraints
- All uplift outputs must include business date, item code, action status, baseline units, actual units, and method version.
- Uplift numbers are directional performance indicators and should be presented with caveat text.
- Any change to baseline policy increments uplift method version.
