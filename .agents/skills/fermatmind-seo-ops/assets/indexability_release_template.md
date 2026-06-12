# Indexability Release Report

## Decision

`INDEXABILITY_RELEASE_PASS` / `INDEXABILITY_RELEASE_PASS_WITH_HOLDS` / `INDEXABILITY_RELEASE_FAIL` / `STOP_COUPLED_ACTION_NOT_APPROVED` / `ACCESS_REQUIRED`

## Authorized scope

| Field | Value |
|---|---|
| Task |  |
| Article ID |  |
| URL |  |
| Approved action |  |
| Schema | hold / allow |
| Hreflang | hold / allow |
| Sitemap | hold / allow |
| llms | hold / allow |
| Search Channel | hold / allow |
| ISR/revalidation | hold / allow |

## Post-release checks

| Check | Expected | Observed | Status | Evidence |
|---|---|---|---|---|
| HTTP | 200 |  |  |  |
| Robots | indexable if approved |  |  |  |
| Sitemap | according to hold/allow |  |  |  |
| llms | according to hold/allow |  |  |  |
| JSON-LD/schema | according to hold/allow |  |  |  |
| hreflang/alternate | according to hold/allow |  |  |  |
| Search Channel | unchanged unless approved |  |  |  |
| Private URL | none |  |  |  |
| CTA | public canonical |  |  |  |

## Blockers or warnings

- 
