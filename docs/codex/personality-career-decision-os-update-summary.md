# FermatMind Personality & Career Decision OS Update Summary

Scope: PRAC train handoff summary
Source branch: `origin/main` at `0e8a76361fdb5129fae1a5befa55dc6a779aac80`
Runtime behavior changed: yes, for Career public runtime reconciliation and discoverability eligibility

This document summarizes the completed Public Runtime Authority Convergence train and the Career 2786 public-resolution / runtime-reconciliation work from the last several days. It records the current operating facts for future focused scans, branch starts, commits, pushes, and PR handoffs.

## Completed PRAC Train

Train name: `public-runtime-authority-convergence-train`

| PR | Status | Merge SHA | Artifact | Link |
| --- | --- | --- | --- | --- |
| PR-PRAC-01 Production Frontend Source-of-Truth Lock | merged | `6d496d9262f84f78f2ca8feb814370730f11a232` | `docs/runtime/public-frontend-source-of-truth.md` | <https://github.com/fermatmind/fap-web/pull/689> |
| PR-PRAC-02 Page Family Runtime Contract Coverage | merged | `43d64baf350c1ca345f1624cd1987f76d8446748` | `docs/runtime/page-family-runtime-coverage.md` | <https://github.com/fermatmind/fap-web/pull/691> |
| PR-PRAC-03 Frontend Fallback Authority Lockdown | merged | `aa38378987da3d89ca7d1a3b46eaa85383862952` | `docs/runtime/frontend-fallback-authority-inventory.md` | <https://github.com/fermatmind/fap-web/pull/693> |
| PR-PRAC-04 Claim Runtime Boundary Matrix | merged | `68dbc85a33c47a84b902c8048ca5dfdfe95e64b0` | `docs/claims/public-claim-boundary-matrix.md` | <https://github.com/fermatmind/fap-web/pull/694> |
| PR-PRAC-05 Discoverability Authority Convergence | merged | `26343e0281500990ef624788a529e0b49978b810` | `docs/seo/discoverability-authority-convergence.md` | <https://github.com/fermatmind/fap-web/pull/695> |
| PR-PRAC-06 Freemium Public Runtime Coverage | merged | `b40ba3c3fe31e84d58f0c3b23ecad0f40b418d77` | `docs/freemium/freemium-runtime-coverage.md` | <https://github.com/fermatmind/fap-web/pull/696> |

All six merge commits are contained in `origin/main`.

## Career 2786 Program Summary

The Career work completed over the last several days should be read as two related but distinct programs:

1. Public-resolution governance: every source row receives a terminal decision.
2. Runtime reconciliation: every public runtime surface is forced to consume the same publish truth instead of deriving visibility independently.

The important operating rule for future scans is:

```text
CareerFullReleaseLedger
-> CareerRuntimePublishProjection
-> runtime consumers
```

The frontend, sitemap generator, llms generator, dataset/index APIs, route existence, and SEO metadata must not become independent publication authority.

### Career Completion Definition

Career 2786 completion does not mean all 2786 workbook rows are live public canonical job pages.

The final governance definition is:

```text
2786 workbook/source rows have terminal public-resolution outcomes.
793 rows are canonical public Career job assets.
1993 rows are governed non-public / held / excluded rows.
```

The non-public governed categories are:

| Category | Count | Public behavior |
| --- | ---: | --- |
| duplicate identity hold | 254 | Not public job detail, not sitemap, not llms, not llms-full. |
| broad group hold | 75 | Not a job page, no public family hub unless future policy approves. |
| CN proxy hold | 1663 | Not US canonical job, no CN proxy public page unless future CN authority/trust policy approves. |
| manual hold | 1 | `software-developers`, manual hold / non-public. |

Do not describe this as "uploaded". Use precise state language:

```text
content asset completed
imported into backend authority
authority aligned
public-resolved
canonical public published
sitemap eligible
llms eligible
live routable public URL
held / governed / non-public
```

### Career Public Type Matrix

The public-resolution type matrix is now the required vocabulary for future Career scans:

| `public_resolution_type` | Runtime meaning | Selected display import | Sitemap / llms default |
| --- | --- | --- | --- |
| `public_canonical_job` | Canonical job detail candidate/published job. | Allowed only when `import_eligible=true` and selected import guard passes. | Eligible only when runtime projection says published, indexable, canonical self, release gate pass. |
| `public_alias_redirect` | Alias or redirect, never canonical job. | Not eligible. | No independent sitemap/llms entry by default. |
| `public_family_hub` | Future family/industry hub, not a job. | Not eligible. | Excluded until explicit family hub release policy, trust/schema/children, and projection-backed eligibility exist. |
| `public_cn_proxy_page` | Future CN-specific proxy/reference surface, not a US O*NET canonical job. | Not eligible. | Excluded by default; requires CN authority policy, disclaimer, evidence, trust manifest. |
| `public_nonindex_reference` | Future public accessible noindex reference. | Not eligible. | Never sitemap/llms eligible by default. |
| `keep_non_public_with_policy` | Ledger-governed non-public row. | Not eligible. | Excluded everywhere. |
| `blocked_until_governance_approval` | Cannot become public without later governance decision. | Not eligible. | Excluded everywhere. |

Hard stop lines:

- `career_job_display_assets` existence alone is not public eligibility.
- Frontend route existence is not public eligibility.
- Dataset/index membership is not public eligibility.
- Sitemap/llms inclusion is not public eligibility.
- `software-developers` must remain manual hold unless explicitly approved later.
- CN rows must not be converted into US canonical O*NET jobs.

## Career Governance PR Train

The backend governance train established the CareerFullReleaseLedger and encoded terminal decisions for all 2786 rows. The key completed workstreams were:

| Workstream | Result | Current scan meaning |
| --- | --- | --- |
| Phase 1 Public Resolution Ledger | 2786 rows represented; no decision means no public eligibility. | Future scans should use the ledger as first source of truth for row-level public outcome. |
| Phase 2A Duplicate Identity Governance | 254 duplicate rows governed; active public aliases remain guarded. | Duplicate rows cannot leak through job detail, dataset/search, sitemap, llms, or alias surfaces. |
| Phase 2B Broad Group Governance | 75 broad-group rows governed; 0 active public family hubs. | Broad rows cannot masquerade as canonical job pages. Family/industry surfaces are future-gated. |
| Phase 2C CN Proxy Governance | 1663 CN rows blocked until CN authority/trust policy. | CN rows are not US canonical jobs, not sitemap/llms eligible, and not public proxy pages by default. |
| Phase 2D Manual Hold Governance | `software-developers` kept manual hold / non-public. | Manual hold rows cannot be released by import, frontend fallback, alias, or dataset visibility. |
| API Guard Fix | Duplicate/CN/broad/manual rows blocked from public job detail APIs. | Detail API must use public-resolution / runtime projection guard, not asset existence alone. |
| Phase 3 Public Type Owner & Guard | Every public type has owner/guard policy. | Future public expansion must select the correct owner by `public_resolution_type`. |
| Phase 4 Approved Canonical Subset Manifest | No new approved canonical candidates; train no-op. Selected import guard hardened. | Selected display import can only accept `public_canonical_job + import_eligible=true + status=upload_candidate`. |
| Phase 5A/B/C SEO-GEO Gate | No active non-canonical public type; trust/release/sitemap/llms gates no-op complete. | Do not add CN/family/nonindex sitemap or llms entries without a new approved policy train. |

Verified fap-api PRs from the Career governance / reconciliation train:

| PR | Status | Merge SHA | Main effect |
| --- | --- | --- | --- |
| <https://github.com/fermatmind/fap-api/pull/1213> | merged | `719e8ef1bf0c79f5de6bd567589c53e784f03e8d` | Added Career public resolution ledger. |
| <https://github.com/fermatmind/fap-api/pull/1218> | merged | `ea70dfa220a3a09028eeb0f5b2326a5ee82689b3` | Recorded duplicate identity ledger decisions. |
| <https://github.com/fermatmind/fap-api/pull/1219> | merged | `7294dc803d5219275fd11b0029934e67437def23` | Added ledger-backed duplicate alias support. |
| <https://github.com/fermatmind/fap-api/pull/1223> | merged | `a182077c6e3f9e060ef0b0b71b0fc4974acc989c` | Added duplicate alias materialization command. |
| <https://github.com/fermatmind/fap-api/pull/1229> | merged | `926a2e0509cee4571168b52cf5ee4aee56fd1b4e` | Resolved duplicate aliases from display assets. |
| <https://github.com/fermatmind/fap-api/pull/1237> | merged | `85c459fc5a9fe290c491c36189fc4e9a8d1eb479` | Required release-approved targets for duplicate aliases. |
| <https://github.com/fermatmind/fap-api/pull/1241> | merged | `96a8da005dcdd07f10d59709dbaf6cd30b50880a` | Recorded broad group ledger decisions. |
| <https://github.com/fermatmind/fap-api/pull/1243> | merged | `857977e6bd169ad50c0918ad0637243b78a51300` | Guarded Career family hubs with public resolution ledger. |
| <https://github.com/fermatmind/fap-api/pull/1248> | merged | `cfdff5690061b045222dc7dcd10b1aa149f79c19` | Recorded CN and manual hold ledger defaults. |
| <https://github.com/fermatmind/fap-api/pull/1250> | merged | `49c8470800046bbd777e4066dc5ed6fc482338d5` | Added CN authority policy validator. |
| <https://github.com/fermatmind/fap-api/pull/1253> | merged | `942627b251a35f45601727070940060a5d22e608` | Added CN trust manifest policy. |
| <https://github.com/fermatmind/fap-api/pull/1254> | merged | `3010db62e7e62a4955a5cb8d53050857ea47a057` | Guarded CN proxy public owner. |
| <https://github.com/fermatmind/fap-api/pull/1257> | merged | `c52c84c82a6b7d920efdfa181a003550eb2beaf4` | Enforced public-resolution guard on Career job detail API. |
| <https://github.com/fermatmind/fap-api/pull/1274> | merged | `edaf13f606f9256917ad3a9a990b935e6428ba3e` | Aligned Career deploy verification SOP and count terminology. |
| <https://github.com/fermatmind/fap-api/pull/1277> | merged | `14cfd10e0a4ee415ab778737afa661268e8c1120` | Required `public_canonical_job` for selected Career imports. |
| <https://github.com/fermatmind/fap-api/pull/1282> | merged | `c4d7304cf16c1009bff16183d9c5092c4f52ad73` | Added Career runtime publish projection authority. |
| <https://github.com/fermatmind/fap-api/pull/1283> | merged | `e6f3c79a08fccd681348b85c5fe3af22ee7c2839` | Unified Career runtime surfaces with publish projection. |
| <https://github.com/fermatmind/fap-api/pull/1284> | merged | `31aab501c09eddaf1cd9c5fd6446e714ae45d7cb` | Reconciled Career release gate runtime validation. |

Future backend scans should verify current `origin/main` against these merge SHAs before assuming the Career authority chain is present.

## Career Frontend And Runtime PRs

The fap-web side completed the runtime convergence needed to consume backend Career truth. Verified merged PRs include:

| PR | Status | Merge SHA | Main effect |
| --- | --- | --- | --- |
| <https://github.com/fermatmind/fap-web/pull/651> | merged | `d84934d9746b7e2f1846ea849260cb2a3fd1d24b` | Career job frontend started consuming backend Career job SEO authority. |
| <https://github.com/fermatmind/fap-web/pull/652> | merged | `aeea3da5df7da724b134a652c38d8437bc62cac8` | Career sitemap URLs were gated by SEO authority. |
| <https://github.com/fermatmind/fap-web/pull/683> | merged | `9ea02daf1310588b41b922a7b31555e8551bce91` | Career job SEO JSON-LD was gated by trust/visible structured data. |
| <https://github.com/fermatmind/fap-web/pull/684> | merged | `5b9836474aa75f3d711d7fba45687dbccd4a1e4e` | Sitemap and llms inclusion were unified with runtime projection. |
| <https://github.com/fermatmind/fap-web/pull/697> | merged | `ba7577798482199859368deae33169a8ad07ef72` | Career frontend metadata authority was reconciled with backend runtime projection. |
| <https://github.com/fermatmind/fap-web/pull/700> | merged | `d0c83a43bff696f298f4f90d211315e326c5a080` | Career industry/family URLs were removed from sitemap/llms until projection-backed release. |

### Runtime Reconciliation Findings And Fixes

Earlier reality scans found a mismatch:

```text
ledger/governance reality
!= runtime publish reality
```

Observed blockers before reconciliation:

- `/en/career/jobs/actors` rendered `noindex`.
- Dataset/index APIs exposed `software-developers`.
- Dataset/index APIs exposed CN rows.
- 793 canonical public claim did not match runtime route/sitemap/llms reality.
- Sitemap/llms had only 87 unique job slugs at one point.
- Family/industry URLs were discoverability-published despite active `public_family_hub=0`.
- Index/detail mismatch existed: indexable rows did not consistently have public detail route 200.

The resolved architecture is:

```text
CareerFullReleaseLedger
  owns row-level public-resolution decision

CareerRuntimePublishProjection
  derives runtime fields from ledger and release policy

Runtime surfaces consume projection:
  detail API
  dataset/search/discovery APIs
  frontend career job detail metadata
  sitemap
  llms.txt
  llms-full.txt
```

Runtime fields future scans should expect in projection/export outputs:

```text
slug
locale
public_resolution_type
runtime_publish_state
detail_route_enabled
dataset_visible
search_visible
sitemap_live
llms_live
llms_full_live
canonical_url
canonical_self
robots_indexable
release_gate_pass
```

Allowed runtime publish states:

```text
blocked
published_candidate
published
quarantined
```

Do not add another state machine in frontend code.

### Frontend Metadata Authority Fix

Before PR #697, Career job metadata could still render noindex because frontend metadata logic used `renderState.canIndexPage`. That value could be affected by trust/claim content-rendering gates even when backend `seo_contract` said `index,follow`.

Current rule:

```text
backend seo_contract / runtime projection decides robots and canonical metadata
frontend render state decides content sections only
```

Meaning:

- Trust/claim permission can hide or alter content sections.
- Trust/claim permission must not independently force `noindex` for a released canonical job.
- For `public_canonical_job + release_gate_pass=true + seo_contract=index,follow`, frontend metadata must render `index,follow` and canonical self.
- CN/family/non-public rows remain protected because their projection does not grant canonical job publish eligibility.

Important artifact:

```text
/tmp/career_frontend_metadata_authority_reconciliation.json
```

Note: this artifact was initially written while live validation was still blocked by a later industry sitemap issue; the PR itself merged and the metadata authority fix was deployed.

### Career Industry / Family Discoverability Fix

Before PR #700, the following URLs were hardcoded into sitemap/llms/llms-full even though runtime detail route truth did not support them:

```text
/en/career/industries
/zh/career/industries
/en/career/industries/building-and-grounds-cleaning
/zh/career/industries/building-and-grounds-cleaning
```

Root cause:

```text
Frontend sitemap/llms generators expanded local industry/family route lists.
They were acting as publication authority while active public_family_hub=0.
```

Current rule:

```text
Career industry/family URLs remain excluded from sitemap/llms/llms-full
until a projection-backed public_family_hub release policy makes them routable and eligible.
```

Current live validation after PR #700 deploy:

```text
pnpm seo:assert-live-sitemap
  pass, total_urls=257, bad_count=0

pnpm seo:assert-live-llms
  pass, total_urls=119, bad_count=0

pnpm seo:assert-live-llms-full
  pass, total_urls=119, bad_count=0

career/(industries|family) matches in sitemap/llms/llms-full
  0
```

Artifact:

```text
/tmp/career_industry_runtime_reconciliation.json
/tmp/career_industry_runtime_reconciliation.md
```

## Current Career Runtime Reality

As of `origin/main` at `0e8a76361fdb5129fae1a5befa55dc6a779aac80`, future scans should start from these facts:

| Fact | Current value / policy |
| --- | --- |
| Workbook/source rows | 2786 public-resolved rows. |
| Canonical public assets | 793 governed canonical Career jobs. |
| Governed non-public rows | 1993. |
| Active public alias redirects | 0 unless future release-approved target policy activates them. |
| Active public family hubs | 0. |
| Active public CN proxy pages | 0. |
| Active public nonindex references | 0. |
| `software-developers` | manual hold / non-public. |
| Runtime projection | Established as the single runtime publish projection. |
| Detail API visibility | Must consume runtime projection. |
| Dataset/search/discovery visibility | Must consume runtime projection. |
| Sitemap/llms/llms-full | Must consume projection/SEO authority; no independent Career family/CN/manual expansion. |
| Live sitemap after industry fix | `bad_count=0`, `total_urls=257`. |
| Live llms after industry fix | `bad_count=0`, `total_urls=119`. |
| Live llms-full after industry fix | `bad_count=0`, `total_urls=119`. |

Do not infer that `total_urls=257` means Career has only 257 public jobs. It is a frontend sitemap total across current included public surfaces. Career job coverage must be checked through the backend projection/export/release gate artifacts, not by collapsing all URL counts into one number.

## Career Count And State Vocabulary

Future scans must keep these counts separate:

| Count / state | Meaning | Not equivalent to |
| --- | --- | --- |
| 2786 | Workbook/source rows with terminal public-resolution outcomes. | Not live public page count. |
| 793 | Canonical public Career assets governed as public canonical jobs. | Not full workbook count. |
| 1993 | Governed non-public rows. | Not upload backlog. |
| 2319 | Dataset/jobs API legacy/alternate member count observed during earlier audits. | Not canonical public assets and not workbook total. |
| 257 | Current live sitemap total URLs after PR #700. | Not Career canonical asset count. |
| 119 | Current live llms/llms-full URL count after PR #700. | Not Career canonical asset count. |

Use exact wording:

- `public-resolved`: a ledger decision exists.
- `canonical public published`: runtime projection and release policies publish a public canonical job.
- `sitemap live`: sitemap generator includes the URL and live validator passes.
- `llms live`: llms generator includes the URL and live validator passes.
- `held/governed/non-public`: the row has a terminal non-public decision.

## Career Growth Phase 6 Readiness

The Phase 6 growth-lane scan produced:

```text
final decision: PHASE_6_READY_WITH_HOLDS
blockers: 0
```

Ready or design-ready lanes:

- MBTI to Career, if links target only projection-approved canonical public Career jobs.
- Analytics / attribution hardening.
- Career landing / marketing surfaces limited to existing canonical public assets.

Hold lanes:

- RIASEC to Career: hold until stable RIASEC-to-Career mapping and eligibility guard exist.
- Career Discovery: hold broad expansion until ledger/projection guard is proven on all discovery/list/search APIs.
- Big Five to Career: must remain a separate scan; do not include by default.

Known attribution gap:

```text
Career attribution exists but still needs first-class test_slug and UTM propagation for cross-assessment growth lanes.
```

Artifact:

```text
/tmp/career_phase6_growth_expansion_lane_scan.json
/tmp/career_phase6_growth_expansion_lane_scan.md
```

## Current Operating Definition

FermatMind is currently a public assessment and career-decision platform with a strong backend/CMS authority core. Some non-Career public surfaces still have mixed migration/fallback areas, but Career publish visibility has been reconciled around backend ledger/projection authority.

The intended OS chain remains:

```text
Test
-> Signal
-> Semantic Meaning
-> Decision Domain
-> Evidence
-> Report
-> Profile Memory
-> Next Action
```

The PRAC train did not build new OS layers. It made current public runtime authority explicit and testable.

## Source-of-Truth Boundary

The public frontend source-of-truth for current runtime audits is:

```text
/Users/rainie/Desktop/GitHub/fap-web
```

The nested copy below is not public runtime:

```text
/Users/rainie/Desktop/GitHub/fap-api/fap-web
```

It is classified as `skeleton_or_stale` and must not be used to judge public renderer coverage.

## Current Public Runtime Reality

| Area | Current status | Evidence |
| --- | --- | --- |
| Home / tests hub | `partial` | CMS-backed surfaces exist, but product shell fallback remains. |
| Test detail | `operational` | Scale lookup and public landing/answer surfaces are consumed; SEO/FAQ/CTA fallback remains tracked risk. |
| Test take | `operational` | Private/noindex attempt runtime, not public discoverability. |
| Result/report | `operational` | Report access, result projections, invite unlock, and private noindex policies exist. |
| Paywall/order/payment | `operational` | MBTI loop is strongest; cross-scale funnel remains partial. |
| Topic detail | `partial` | CMS topic and answer/SEO surfaces exist; CTA and llms fallback risk remains. |
| Personality detail | `partial` | CMS projection exists, but frontend fallback projection remains visible product-code truth. |
| Article detail | `partial` | CMS article surface exists; Article JSON-LD fallback remains `migration_required`. |
| Career job detail | `operational` | Backend career job bundle, runtime projection, SEO authority, and explainability are rendered. |
| Career recommendation detail | `operational` | MBTI recommendation surface is deterministic snapshot direction support, not a live personalized recommender. |
| Career guide detail | `partial` | CMS-backed guide renderer exists; evidence and claim gates are less complete than career job detail. |
| Profile/history | `operational` | Private account/report history runtime, not public SEO surface. |
| Share | `partial` | Public share renderer exists, but share routes remain protected-flow governed. |
| Help/legal/static | `partial` | CMS content pages exist where present; route coverage is broader than content maturity. |

## Fallback Authority Locks

The following fallback classes are now locked for future scans and PR reviews:

```text
safe_static
product_code_only
compatibility_wrapper
watchlist
migration_required
forbidden
```

Current high-risk fallback areas:

- Test metadata, FAQ, and CTA fallback: `migration_required`
- Topic CTA fallback: `migration_required`
- Personality fallback projection: `migration_required`
- Article JSON-LD fallback: `migration_required`
- llms topic fallback: `migration_required`
- Static sitemap layer: `compatibility_wrapper`
- Local career recommendation placeholder: `forbidden`
- Frontend-local graph edge expansion: `forbidden`

Rule for future work:

```text
Frontend fallback must not become SEO truth, graph truth, recommendation truth, or claim truth.
```

## Claim Boundary Locks

Claim status enum:

```text
allowed
soft_allowed
needs_disclaimer
internal_only
forbidden
```

Explicitly forbidden public claims:

- RIASEC precise best-career recommendation.
- Big Five precise career matching.
- AI precise career planning.
- Career fit score as hiring, success, income, or placement guarantee.
- Snapshot recommendation as live personalized recommender.
- sitemap, llms, or schema as true graph.
- Frontend local ranking as recommendation engine.

Allowed with boundary:

- RIASEC describes career interest direction.
- Big Five explains trait and workplace behavior tendencies.
- MBTI describes preference, expression style, and identity language.
- Career Graph may describe occupation structure, tasks, skills, score components, and evidence when backend claim permissions allow it.
- MBTI career recommendation is snapshot-based career direction support.

## Discoverability Authority Locks

Backend/CMS owns mutable SEO and discoverability truth where backend/CMS surfaces exist. Frontend may render, normalize, budget, and deny-list exposure, but it must not silently widen discoverability.

Current locked surfaces:

- Sitemap authority: `next-sitemap.config.js` plus backend sitemap-source and shared deny policy.
- Backend sitemap source: `/v0.5/seo/sitemap-source` consumer.
- llms and llms-full: frontend routes with CMS/backend consumers and shared deny policy.
- JSON-LD: must align with visible content, canonical URL, or backend structured data authority.
- FAQPage: must come from visible FAQ or visible answer-surface content.
- Evidence Container: must be visible and grounded.
- Private flows: excluded from sitemap, llms, llms-full, indexable HTML, and public JSON-LD.

Known sidecar:

```text
Local sitemap generation changes only lastmod timestamps in public/sitemap.xml.
URL count remains stable and sitemap indexability passes.
Do not include generated lastmod drift in unrelated PRs.
```

## Freemium Runtime Reality

Freemium classification enum:

```text
full_loop
backend_ready
frontend_partial
MBTI_only
cross_scale_partial
blocked
unknown
```

Current freemium facts:

- MBTI result to locked/full report to checkout to order wait to entitlement to report/PDF/history is `full_loop`.
- Big Five paywall coverage is `cross_scale_partial`.
- Invite unlock is `MBTI_only`.
- Module bundle logic is `cross_scale_partial`.
- Email and retention lifecycle is `frontend_partial`.

The PRAC train did not change checkout, payment, entitlement, report access, SKU logic, commerce runtime, paywall UI, public funnel behavior, scoring, attempts, auth, or recommendation runtime.

## What Is Ready For Focused Scans

Future scans can start from the following stable evidence:

- Production frontend source lock:
  - `docs/runtime/public-frontend-source-of-truth.md`
  - `docs/runtime/generated/public-frontend-source-of-truth.v1.json`
- Page-family coverage:
  - `docs/runtime/page-family-runtime-coverage.md`
  - `docs/runtime/generated/page-family-runtime-coverage.v1.json`
- Fallback authority:
  - `docs/runtime/frontend-fallback-authority-inventory.md`
  - `docs/runtime/generated/frontend-fallback-authority-inventory.v1.json`
- Claim boundary:
  - `docs/claims/public-claim-boundary-matrix.md`
  - `docs/claims/generated/public-claim-boundary-matrix.v1.json`
- Discoverability authority:
  - `docs/seo/discoverability-authority-convergence.md`
  - `docs/seo/generated/discoverability-authority-matrix.v1.json`
- Freemium coverage:
  - `docs/freemium/freemium-runtime-coverage.md`
  - `docs/freemium/generated/freemium-runtime-coverage.v1.json`

## Recommended Next Scan Inputs

Use this order for future scan-only work:

1. Confirm `origin/main` contains the latest PRAC merge SHA.
2. Confirm current worktree has no unrelated staged changes.
3. Read this summary and the six PRAC artifacts above.
4. Identify the focused scan domain:
   - RIASEC semantic layer.
   - Big Five semantic layer.
   - Career Graph reality.
   - Recommendation reality.
   - GEO / AI search readiness.
   - Freemium runtime deep scan.
   - Public runtime authority follow-up.
5. Record evidence by file path, route path, API contract, artifact, and test.
6. Do not convert scan findings into runtime implementation unless explicitly scoped in a later PR.

## Branch And PR Start Checklist

Use a clean branch from latest `origin/main`:

```bash
git fetch origin main --prune
git switch main
git pull --ff-only origin main
git switch -c codex/<focused-scan-or-doc-scope>
```

Before staging:

```bash
git status --short --branch
git diff --check
```

Stage only scoped files:

```bash
git add <scoped-files-only>
git diff --cached --check
git commit -m "<type(scope): concise summary>"
git push -u origin <branch>
gh pr create --base main --head <branch> --title "<title>" --body-file <body-file>
```

Do not stage:

- Runtime page changes unless explicitly scoped.
- Checkout, payment, entitlement, auth, attempt, scoring, or report lifecycle changes.
- Generated `public/sitemap.xml` timestamp drift unless the PR explicitly owns sitemap generation.
- Frontend-local SEO, graph, recommendation, or claim authority.

## Current Stop Lines

Do not start these from PRAC follow-up docs:

- New test onboarding.
- Topic Graph expansion.
- Career pSEO expansion.
- Recommendation engine work.
- Behavior Graph.
- Long-term Profile.
- B2B dashboard.
- AI-generated SEO pages.
- Frontend rewrite.
- Backend rewrite.

## Board-Level Summary

FermatMind now has a documented public runtime authority baseline. The backend/CMS platform core remains the truth owner where surfaces exist, while the frontend is explicitly constrained to deterministic rendering and governed compatibility fallback.

The platform is not yet a fully converged Personality and Career Decision OS. It has the required authority skeleton: public frontend source lock, page-family runtime matrix, fallback authority inventory, claim boundary matrix, discoverability authority guardrails, and freemium runtime coverage. The next work should use these artifacts as the evidence floor for focused scans before expanding semantics, graph, recommendation, GEO, or long-term profile systems.
