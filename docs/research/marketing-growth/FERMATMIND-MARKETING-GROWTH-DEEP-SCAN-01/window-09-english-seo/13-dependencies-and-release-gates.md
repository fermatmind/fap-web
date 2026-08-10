# Dependencies and Release Gates

| Scope | Required next evidence | Current state | Write authority |
|---|---|---|---|
| GSC regional split | exact EN query×page×country×device export | `PARTIAL`; UK+OTHER UNKNOWN | read-only export |
| RIASEC experiment | CMS-authoritative copy proposal, exact baseline, measurement plan | candidate only | separate CMS scope |
| Personality | window-04 ownership and complete page rows | `PAGE_LEVEL_AUDIT_INCOMPLETE` | separate backend/CMS scope |
| Articles refresh | query evidence and source repair | 40-row ledger complete; market split partial | separate Article scope |
| W3 Articles | trusted V2 receipt-chain reconciliation | existing authority package referenced; `W3_ARTICLE_PACKAGE_READY_NOT_PROMOTED` | trusted fap-api workflow |
| Career candidates | C06+C07 + authority reconciliation | WAITING_ON_C06_C07 | backend Career authority |
| Career Guides | operator exact slugs + frozen PASS assets | no current package; `STRUCTURAL_ISOLATION_PASS / FORMAL_PACKAGE_ISOLATION_PENDING` | future per-occupation scope |
| 28-day decision | actual release + full observation window | WAITING | monitor only |

Production deployment, CMS/database writes, search-surface changes, and submission remain separately controlled.
