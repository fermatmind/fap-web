# Evidence-scoped PR proposals

## Candidates

| ID | Repo | Tier | Single root cause | Status |
| --- | --- | --- | --- | --- |
| PUBLIC-SURFACE-L1-PERFORMANCE-BUDGET-01 | fap-web | L1 | No stable shared L1 regression budget currently protects the landing/start boundary. | READY_NOT_STARTED |
| PUBLIC-SURFACE-L1-LAYOUT-CLS-01 | fap-web | L1 | Shared test landing layout shift. | EVIDENCE_READY_TRACE_REQUIRED |
| GLOBAL-LAYOUT-NONHOME-PRELOAD-SCOPE-01 | fap-web | L1/L2/L3 | Homepage-only top.png preload is declared in global layouts. | READY_NOT_STARTED |
| ASSESSMENT-IQ-EQ-METADATA-CONTRACT-01 | Owner pending: fap-api authority or fap-web projection | L3 | Metadata authority/projection is missing on four exact routes. | ROOT_OWNER_DIAGNOSIS_REQUIRED |
| NONCAREER-DISCOVERABILITY-AUTHORITY-GUARD-01 | fap-api | Shared discoverability | Incomplete authority projections can silently activate as partial/empty cohorts. | READY_WAITING_ON_C06 |
| NONCAREER-DISCOVERABILITY-CONSUMER-GUARD-01 | fap-web | Shared discoverability | Consumer may accept an incomplete authority projection as successful empty/partial state. | READY_WAITING_ON_C06 |
| PUBLIC-CWV-RUM-PRIVACY-SAFE-INSTRUMENTATION-01 | fap-web | L1/L2/L3 | No readable field CWV/RUM source exists in the current workspace. | DESIGN_READY_PRODUCTION_APPROVAL_REQUIRED |

Each row in `technical_pr_candidates.csv` contains exact title, evidence, scope, likely files, exclusions, checks, dependencies, production impact, rollback and manifest/state proposal.

## Scope controls

- L1 budget, L1 layout shift and global preload are separate PRs.
- Frontend and backend authority work remain separate.
- Ingress/cache, application rendering, analytics and CMS media are not combined.
- IQ/EQ metadata work cannot choose a repository until the authority payload/projection owner is verified.
- No article latency/media implementation PR is proposed from the current short-window evidence.
- RUM instrumentation requires a separate production tracking approval.

## Manifest state

This audit does not register or modify PR-train manifest/state. Proposed IDs become executable only when Program Controller confirms/starts their exact scope. The two shrink guards remain dependency-gated by Career C06.
