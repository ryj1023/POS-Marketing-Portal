# Data Freshness and Filters Contract V1

## Data Freshness
- Every dashboard response must include `data_as_of` (ISO timestamp, store-local timezone conversion in UI).
- A stale-data warning appears when `now - data_as_of > 2 hours` during business hours.
- A stronger warning appears when `now - data_as_of > 24 hours`.
- Freshness warning text must explain that recommendations are based on historical imported data.

## Global Filter Contract
- One global filter context drives all panels.
- Filter keys:
  - `date_start`
  - `date_end`
  - `granularity` (`hour`, `day`, `week`)
  - `categories` (optional list)
  - `items` (optional list)
- All panel queries must receive identical filter values from the same request context.

## Consistency Guarantees
- KPI totals must equal aggregate totals implied by chart/table panels under the same filter.
- Recommendation candidates and exclusions must be generated from the same filtered dataset used for KPI/charts.
- If filters are changed, all panels rerender from the same request cycle or show loading state until synchronized.

## Timezone Rules
- Canonical storage is UTC.
- Business logic bins and deltas in store-local timezone.
- Day boundary and week boundary calculations use store-local midnight and week start policy.

## Empty and Insufficient States
- `empty`: valid filter with no transactions in range.
- `insufficient_data`: transactions exist but history does not meet recommendation minimum threshold.
- Both states must preserve visible filters and `data_as_of`.
