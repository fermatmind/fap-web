# Career Identity Quality Gates

Identity is the boundary layer for every downstream career block. It must be stricter about official mappings than about reader-facing style.

## PASS Requirements

- Official boundary source exists for every slug.
- SOC/O*NET/ISCO/CIP fields are copied from source or seed evidence, not inferred from title text.
- Canonical slug remains unchanged.
- `title_en`, `title_zh`, aliases, and cleaned display titles do not contain machine disambiguators, backend notes, or "occupation boundary" phrases.
- Exact, aggregate, adjacent, narrower specialization, alias, and local-market title relationships are labeled separately.
- Ambiguous identity rows are `REPAIR_REQUIRED` or `BLOCKED`; they are not repaired with generic prose.
- Locale labels are reader-safe but traceable to official/seed identity.

## Block-Specific Failures

- title similarity used as mapping proof
- downstream salary/AI/fit content used to infer identity
- invented classification code
- cleaned title that changes the canonical occupation scope
- unbounded local-market title treated as official occupation

## Staging Readiness

Before any downstream block uses identity as control baseline, verify frozen SHA, row count, duplicate slug count, and exact control order.
