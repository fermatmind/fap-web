# Method Boundary And Risk Audit

## Findings

| risk_area | result | evidence |
| --- | --- | --- |
| Private result leakage | PASS | 0 private-result phrase hits |
| Clinical/hiring/deterministic claims | PASS | 0 unsafe no-go hits |
| Big Five as official 32 types | PASS | No unsafe no-go hits were found for official 32-type framing |
| Method boundary visibility | PASS | 34/34 pages include method boundary |
| Internal CMS/package wording | FAIL | 9 visible internal wording hits |

## No-Go Terms Context

The raw audit counted no-go terms in many pages, but the unsafe classifier did not flag them as unsafe because the terms appear in method-boundary or exclusion contexts, such as not using Big Five pages for diagnosis, hiring, or deterministic life decisions. This is acceptable and should be preserved.

## Boundary Copy Guidance

The next repair should keep clear disclaimers, but should avoid letting every page use the same boundary paragraph. Recommended page-specific variations:

- Domain pages: explain what the domain can and cannot tell a reader.
- High/low polarity pages: explain why high/low is contextual, not a moral ranking.
- Hub page: explain Big Five as a dimensional model, not a type label system.
- Facets hub: explain facet language as interpretive detail, not a diagnostic subtest.
