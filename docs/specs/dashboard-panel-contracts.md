# Dashboard Panel Contracts V1

## Scope
Defines panel-level data contracts for the POS Log Promo Intelligence Dashboard V1.

## Shared Context
- All panels must use the same active filter object: `business_date_range`, `time_granularity`, `category_filter`, `item_filter`.
- All panel payloads must include `data_as_of` in store-local time and ISO format.
- If a filter has no matching data, panel returns an empty state payload instead of partial stale data.

## KPI Strip
- Metrics: `revenue`, `transaction_count`, `average_basket`, `units_sold`.
- Delta method: day-over-day against previous completed business day in store-local timezone.
- Card payload shape:
  - `metric_id`
  - `value`
  - `delta_value`
  - `delta_percent`
  - `delta_direction` (`up`, `down`, `flat`)

## Best Sellers (Chart + Table)
- Primary rank metric: `units_sold` descending.
- Deterministic tie-breakers: `revenue` descending, then `item_code` ascending.
- Chart payload: top items with `item_code`, `item_description`, `units_sold`.
- Table payload: chart fields plus `revenue`, `gross_margin`, `rank`.

## Category Breakdown (Donut + Table)
- Primary metric for V1: `units_sold`.
- Percentage basis: item units in category divided by total units in active filter context.
- Donut payload: `category`, `units_sold`, `percent_of_total`.
- Table payload: donut fields plus `revenue`, `gross_margin`.

## Hourly Quantity View
- Bin size: 1-hour bins in store-local timezone.
- Range: includes all hours touched by transactions in active filter context.
- Payload: `hour_start_local`, `units_sold`.
- Week/day trend mode uses same binning rules; only grouping key changes.

## Recommendation Panel
- Label: `Rule-based promotion suggestions`.
- Payload: 3-5 ranked items from recommendation rules output.
- Includes rationale, expected lift estimate, and exclusion summary.
- Actions (`accept`, `reject`, `defer`) persist by `business_date` and `item_code`.

## Recent Transactions Panel
- Data source: most recent processed batch only.
- Not a live stream.
- Payload includes `receipt_id`, `transaction_time_local`, `items`, `basket_total`.
- Must surface `last_refresh_at` next to panel title.

## Panel States
- Required states for each panel: `loading`, `error`, `empty`, `insufficient_data`, `ready`.
- `error` must include user-facing recovery guidance where possible.
