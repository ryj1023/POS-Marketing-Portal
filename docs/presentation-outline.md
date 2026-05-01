# Presentation Outline: POS Promo Intelligence Dashboard

## Slide 1 — Title
**"From Raw Receipts to Smart Promotions"**
*How AI helped build a tool that tells store managers what to promote — today.*

- Project name: POS Promo Intelligence Dashboard
- Date: May 2026

---

## Slide 2 — The Problem
**Store managers are flying blind on promotions**

- Daily promotion decisions are made by gut feel or slow manual spreadsheet work
- Transaction logs exist but are raw JSON/CSV — no one has time to analyze them
- Result: missed revenue, inconsistent promotions, no measurable lift

> *Speaker note: Set the scene — a shift manager opens their morning with a mountain of receipts and no clear answer to "what should I put on sale today?"*

---

## Slide 3 — The Users & Their One Question
**Who is this for, and what do they actually need?**

- **Primary user:** Store manager making daily operational decisions
- **The question they need answered every morning:** *What should we promote today?*
- Current alternatives: gut feel, spreadsheets, vendor reps — all slow and inconsistent

---

## Slide 4 — Solution Overview
**A decision-support dashboard built around one outcome: promo uplift**

Three-layer architecture:
1. **Data onboarding** — import & validate JSON transaction logs
2. **Analytics context** — trends, margins, category & item performance
3. **Rule-based recommendations** — ranked promotion candidates with rationale

> *Speaker note: Emphasize promo-first framing. This is NOT a generic analytics tool.*

---

## Slide 5 — What the Dashboard Shows
**Six panels, one filter context**

| Panel | What it answers |
|---|---|
| KPI Strip | Is today healthy vs. yesterday? |
| Best Sellers | What's moving? What needs restocking? |
| Category Breakdown (Donut) | Where do volume and margin come from? |
| Hourly Quantity Chart | When are the rush windows? |
| Promotion Suggestions | What should we run a promo on today? |
| Recent Transactions | What just happened? |

---

## Slide 6 — The Recommendation Engine
**Deterministic. Transparent. Auditable.**

- Scores each item: `60% volume + 40% margin`
- Guardrails automatically exclude low-margin or sparse items
- Manager takes action: **Accept / Reject / Defer**
- All decisions persist — and feed the uplift calculation

*No black box. Every suggestion includes a human-readable rationale.*

---

## Slide 7 — Measuring Success: Promo Uplift
**Did the promotion actually work?**

- Baseline: prior 2-week average for same weekday + hour band
- Comparison: actual units on the day the promo ran
- Formula: `(actual - baseline) / baseline`
- Only **accepted** recommendations count in the default rollup

*The dashboard closes the loop — from suggestion to measurable result.*

---

## Slide 8 — How AI Built This (The Meta Story)
**The tool was spec'd, planned, and scaffolded largely under AI direction**

Workflow:
1. Human wrote a ~1-page brief with a rough schema and a list of desired panels
2. AI generated the brainstorm (scope, tradeoffs, YAGNI reasoning)
3. AI produced the full V1 feature plan (ERD, acceptance criteria, risk register)
4. AI expanded requirements into spec contracts (panel data shapes, filter rules, uplift math)
5. AI wrote the implementation: ingestion, aggregation, scoring, guardrails, uplift calculator, dashboard renderer, integration test

---

## Slide 9 — What AI Did Autonomously
**The specific artifacts AI produced without being prompted step-by-step**

- Chose the "promo-first" approach over two alternatives (and documented why)
- Applied YAGNI — deferred LLM features, real-time feeds, and broad analytics
- Defined all scoring formulas, guardrail thresholds, and tie-breaker rules
- Wrote spec contracts for every dashboard panel including empty/error/loading states
- Flagged scope conflicts (e.g. "AI suggestions" wording vs deterministic engine) and resolved them
- Produced integration tests covering the full import → recommend → action → uplift loop

---

## Slide 10 — What Humans Decided
**Where human judgment still mattered**

- The initial problem statement and target user
- Approval of the promo-first direction (vs. analytics-first)
- Confirming the transaction data schema
- Reviewing the scoring and guardrail thresholds for business correctness
- Final say on what V1 ships vs. what waits for V2

> *Speaker note: AI did the heavy lifting, but the business judgment calls — what matters, what to defer — stayed with the human.*

---

## Slide 11 — V1 Scope Boundaries (What We Intentionally Left Out)
**Decisions AI helped enforce**

- No LLM-generated recommendations in V1 (deferred explicitly)
- No real-time transaction feed (historical batch import only)
- No multi-store analytics
- No manager feedback loop for ML retraining (yet)

*These weren't accidents — they were documented tradeoffs.*

---

## Slide 12 — What's Next
**V2 signals worth watching**

- LLM narration layer on top of the rule engine ("here's why today's recommendations differ from yesterday")
- Manager feedback loop to refine scoring weights over time
- Multi-store rollup view
- Real-time ingestion when the infrastructure supports it

---

## Slide 13 — Key Takeaways
**Three things to remember**

1. A narrow, specific problem statement let AI plan and build effectively — broad prompts would have produced generic output
2. Deterministic rules + transparent rationale beat "AI magic" for operational trust
3. AI can carry 80–90% of the planning and implementation load when given a clear outcome to optimize for

---

## Slide 14 — Q&A / Demo
**"What should we promote today?"**

*[Live or recorded dashboard demo — show KPI strip, recommendation panel, accept action, uplift view]*

---

## Design Notes

- **Tone:** Confident, technical-but-accessible — audience is likely mixed (technical + business)
- **AI story slides (8–10):** Heart of the presentation — give them the most real estate
- **Mockups:** Use screenshots from `docs/mockups/` on slides 5 or 6
- **Formulas:** Slides 6 and 7 could show the scoring and uplift formulas as styled callout boxes
