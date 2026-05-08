# FermatMind Personality & Career Decision OS Update Summary

Scope: PRAC train handoff summary
Source branch: `origin/main` at `b40ba3c3fe31e84d58f0c3b23ecad0f40b418d77`
Runtime behavior changed: no

This document summarizes the completed Public Runtime Authority Convergence train and records the current operating facts for future focused scans, branch starts, commits, pushes, and PR handoffs.

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

## Current Operating Definition

FermatMind is currently a public assessment and career-decision platform with a strong backend/CMS authority core and an operational but still mixed public runtime.

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
| Career job detail | `operational` | Backend career job bundle, SEO authority, and explainability are rendered. |
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
