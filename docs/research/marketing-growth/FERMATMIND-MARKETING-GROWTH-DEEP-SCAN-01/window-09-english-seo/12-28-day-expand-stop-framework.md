# 28-Day Expand / Hold / Refresh / Stop Framework

## Clock

The clock starts only after actual publication and live QA. Record T+0, T+3, T+7, T+14, and T+28. No pilot cohort in this report receives a final EXPAND or STOP decision.

## Decision standard

- EXPAND requires authority/live-QA, safety, technical stability, real non-brand demand, clear ownership, positive user signal, non-thin next pages, and source readiness.
- HOLD covers insufficient samples, incomplete recrawl, unclear direction, tracking/Career confounders, or missing field data.
- REFRESH requires a correct owner plus a specific snippet/content/CTA gap and enough query evidence.
- STOP means stop further English expansion, not automatic unpublish/delete; it requires the full window and adequate crawl unless safety/legal defects require immediate withdrawal.

The exact fields and empty baseline rows are in `en_28_day_decision_spec.json` and `en_28_day_review.csv`.
