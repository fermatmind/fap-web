# Editorial Quality Block Boundaries

The shared editorial quality gate checks public usefulness across blocks. It must still respect block ownership.

## Block Boundaries

- `career-identity`: official boundary, title cleanup, alias/disambiguation, classification consistency.
- `career-work-activities`: real tasks, tools, stakeholders, settings, work rhythms, and environment.
- `career-skills-entry`: verifiable skills, tools, credentials, projects, portfolio, internships, and entry preparation.
- `career-fit`: RIASEC/work-style/personality-adjacent signals and safe test-conversion copy.
- `career-risk-future`: AI impact, risk, safety, automation boundaries, and future-change notes.
- `career-adjacent-comparison`: related roles, transfer cost, shared/different work, and switching boundaries.
- `career-salary`: salary and employment reference assets. It keeps its own evidence and estimate gates.
- `career-page-assembly`: reader-safe composition of PASS blocks. It must not create new facts.

## Cross-Block Leakage

The gate should flag:

- salary language inside non-salary blocks
- AI impact claims inside work/identity/fit blocks
- personality diagnosis or outcome claims inside non-fit blocks
- page assembly facts that do not trace to a source block
- search or SEO candidate fields in reader assets

## Repair Boundary

When a field appears wrong because an upstream block is weak, the repair plan must point to the source block. Page assembly should not patch upstream factual gaps with local copy.
