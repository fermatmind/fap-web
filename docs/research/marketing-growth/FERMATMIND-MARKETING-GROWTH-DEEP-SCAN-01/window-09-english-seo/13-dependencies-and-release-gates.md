# Dependencies and Release Gates

| Scope | Current state | Remaining gate | Write authority |
|---|---|---|---|
| E01 GSC regional/device split | `E01_GSC_EXACT_MARKET_SPLIT_REFRESH_COMPLETE` | Preserve M01 top-row/privacy boundaries; language and equivalent joint searchAppearance remain `UNKNOWN` | read-only evidence only |
| E02 RIASEC experiment | `RIASEC_EXACT_BASELINE_AND_CMS_EXPERIMENT_PROPOSAL_READY_NOT_APPLIED` | Separate CMS-authority scope before applying proposal | backend CMS landing surface/page blocks |
| E03 Personality | `EN_PERSONALITY_PAGE_LEVEL_AUDIT_COMPLETE_CANDIDATES_NOT_APPLIED` | Separate metadata/link-authority scope per selected candidate | backend personality/CMS authority |
| E04 Articles | `EN_ARTICLE_LEDGER_EXACT_MARKET_SPLIT_COMPLETE_ACTIONS_NOT_APPLIED` | Separate Article CMS scope per selected refresh; Window 5 retains 90-day disposal authority | backend CMS Article authority |
| E06 W3 Articles | `W3_ARTICLES_LIVE_QA_PASS_DISCOVERABILITY_NOT_AUTHORIZED` | New exact authorization for any indexability, sitemap, llms or Search Channel change | backend authority plus generated V2 control |
| B03 technical evidence | `B03_TECHNICAL_EVIDENCE_PARTIALLY_BLOCKED` | Public sample/norm, reliability, validity, reviewer and complete technical-manual evidence | backend/public evidence owners |
| Career candidates | `WAITING_ON_C06_C07` | C06/C07 authority reconciliation and operator exact slugs | backend Career authority |
| Career Guides | `CAREER_GUIDE_PACKAGE_WAITING_EXACT_SLUG_CONFIRMATION` | C06/C07, exact slugs and frozen PASS assets; no current formal package | future per-occupation scope |
| 28-day decision | `ENGLISH_PILOT_WAITING_28_DAY_WINDOW` | Actual release plus complete observation window | monitor only |

W3 Articles and Career Guides remain independent scopes with separate roots, packages, SHAs, imports and PRs. W3 Article publication/live QA does not authorize discoverability. Production deployment, database migration, secrets/permissions, CMS writes outside the named proposal scopes, sitemap/llms/indexability and Search Channel submission remain separately controlled.
