# Career Surface Technical Notes

Last reviewed: 2026-05-31

This document is the fap-web entry point for Career surface technical ownership,
runtime authority, and discoverability behavior. It consolidates the current
1046 career detail rollout state and points to the source reports that explain
how backend authority, frontend rendering, sitemap, `llms.txt`, and
`llms-full.txt` fit together.

## Career Content Agent Closeout

The 1046-career content agent mainline is now closed out for production
operation. The generation, launch, QA, post-import safety, state bookkeeping, and
artifact-root persistence evidence is summarized in:

- `docs/career/career-content-agent-technical-summary-2026-06-25.md`
- `generated/fermatmind-content-agent-state/`
- `generated/career-content-artifact-root-persistence-qa/`

Current technical verdict:

- career block generation and page assembly: complete;
- production import and post-import live QA/SEO safety: complete;
- baseline artifact registry and persistent artifact root restore: complete;
- SEO/GEO query intent and adjacent/internal-link graph work: enhancement
  lanes only, candidate-first, not runtime authority.

Future scans should start from the technical summary above before proposing new
career content-agent tasks.

## Current Production Shape

- Public Career detail cohort: 1046 canonical career slugs.
- Localized public detail URLs: 2092 (`1046` EN + `1046` ZH).
- Career detail pages are backend-authoritative. fap-web renders and emits
  metadata from backend public API contracts; it must not create local Career
  content authority.
- The currently excluded slugs remain blocked from page runtime, sitemap, and
  LLM surfaces:
  - `software-developers`
  - `digital-forensics-analysts`
  - `computer-occupations-all-other`
- `llms-full.txt` is served from a quality-gated cache artifact when available.
  Complete artifacts must include the 2092 approved Career detail URLs and must
  not include excluded slugs, staging URLs, or private flow URLs.

## Authority Model

Career publishing authority lives in fap-api, not in fap-web.

The 1046 public runtime is driven by backend runtime projection and dataset
authority:

- runtime projection / release ledger
- public dataset hub cache
- Career jobs API
- per-detail SEO contract / SEO surface
- sitemap source and public discoverability gates

fap-web consumes this authority through:

- `lib/career/api/fetchCareerJobBundle.ts`
- `lib/career/adapters/adaptCareerJobBundle.ts`
- `app/(localized)/[locale]/career/jobs/[slug]/page.tsx`
- `lib/seo/backendSitemapSource.ts`
- `app/llms.txt/route.ts`
- `app/llms-full.txt/route.ts`

Do not treat these fap-web surfaces as content authority. They are render,
metadata, and discoverability consumers.

## Frontend Runtime Surfaces

| Surface | fap-web owner | Backend authority |
| --- | --- | --- |
| Career jobs index | `app/(localized)/[locale]/career/jobs/page.tsx` | `/api/v0.5/career/jobs` |
| Career job detail | `app/(localized)/[locale]/career/jobs/[slug]/page.tsx` | Career job bundle + SEO surface |
| Sitemap Career URLs | `lib/seo/backendSitemapSource.ts` and sitemap route | backend sitemap source / Career jobs `seo_contract` |
| `llms.txt` Career URLs | `app/llms.txt/route.ts` | backend sitemap source / Career jobs `seo_contract` |
| `llms-full.txt` Career URLs | `app/llms-full.txt/route.ts` | backend sitemap source / Career jobs `seo_contract` |

The detail page can output `index,follow` only when backend index authority is
explicit. Candidate-only, excluded, gated, draft, noindex, manual-hold, or
conflict pages must remain noindex or notFound.

## Discoverability Behavior

`llms.txt` is the lighter URL and summary surface. It can enumerate the 2092
Career detail URLs from backend authority within the configured route budget.

`llms-full.txt` is the heavier rich discoverability artifact. After the 1046
rollout, request-time generation became too expensive to run synchronously on
every public request. The current behavior is:

1. Return a fresh complete in-process or shared last-known-good artifact when
   available.
2. Build or refresh the full response through a bounded background path.
3. Cache only complete artifacts that pass the Career cohort quality gate.
4. Return an explicit degraded 200 response only when no complete artifact is
   available before the response deadline.

The shared cache implementation is in `lib/seo/llmsFullResponseCache.ts`.
Route-level budgets are in `lib/seo/llmsRouteBudget.ts`.

## Quality Gates

`llms-full.txt` complete artifact quality requires:

- at least 2092 unique localized Career detail URLs;
- representative 1046 rollout sample slugs in both EN and ZH;
- zero hits for excluded slugs;
- zero staging URLs;
- zero private flow URLs such as take, result, share, order, pay, or payment.

Career metadata quality requires:

- backend `robots_policy` allows index;
- backend indexability state is indexable/indexed;
- backend reason codes include runtime publication authority such as
  `runtime_publish_projection` plus a release/runtime publication reason;
- local claim and structured-data gates remain intact.

## Claim Boundary

Career pages may present occupation information, work-style context, and
decision-support framing. They must not claim:

- best career for the user;
- hiring fit;
- salary guarantee;
- career success guarantee;
- diagnosis or treatment;
- personality or psychometric result determines career outcome;
- RIASEC precisely recommends a career.

Frontend claim guards and related policy artifacts live under:

- `docs/claims/career-fit-graph-ai-claim-guards.md`
- `docs/claims/june-seo-p0-pseo-freeze-claim-guard.md`
- `tests/contracts/career-fit-graph-ai-claim-guards.contract.test.ts`
- `tests/contracts/seo-geo-llms-claim-guards.contract.test.ts`

## Source Reports

Primary fap-web reports:

- `docs/seo/detail-ready-1046-frontend-metadata-revalidation-01.md`
- `docs/seo/detail-ready-1046-discoverability-exposure-repair-01.md`
- `docs/seo/detail-ready-1046-career-detail-metadata-and-llms-full-stability-repair-01.md`
- `docs/seo/detail-ready-1046-llms-full-artifact-consistency-repair-01.md`

Relevant fap-api authority reports:

- `backend/docs/seo/detail-ready-1046-delta-authority-repair-01.md`
- `backend/docs/seo/career-1046-ops-scope-reconciliation-01.md`
- `backend/docs/career/audits/runtime_candidate_prep.md`
- `backend/docs/career/audits/runtime_artifact_refresh.md`

## Important Scope Distinction

The public 1046 runtime is not the same scope as legacy CMS/Ops Career job
counts. fap-api reports currently distinguish:

- public runtime projection: 1046 Career slugs;
- localized public URLs: 2092;
- legacy CMS/Ops `career_jobs` table scope: separate and smaller;
- SEO Intel URL Truth/read-model scope: requires separate bridge/repair before
  operators should use it as the full Career runtime count.

This means fap-web should keep consuming public runtime/API authority for
public rendering, while Ops dashboards need explicit labels or read-model repair
before being used as the source for 1046 runtime counts.

## Smoke Checklist

For read-only Career discoverability smoke, verify:

- `/api/v0.5/career/jobs?locale=en` returns 1046 items.
- `/api/v0.5/career/jobs?locale=zh-CN` returns 1046 items.
- `/en/career/jobs` and `/zh/career/jobs` return 200 and index/follow.
- sampled EN/ZH detail pages return 200, exact canonical, index/follow, title,
  and H1.
- `/sitemap.xml` contains 2092 Career detail URLs.
- `/llms.txt` contains 2092 Career detail URLs.
- `/llms-full.txt` repeatedly returns 200 complete cache artifacts with 2092
  Career detail URLs.
- excluded slugs are absent from sitemap, `llms.txt`, and `llms-full.txt`.
- Search Channel remains closed unless a separate SEO Ops task explicitly
  approves submission.

## Known Follow-up

`CAREER-1046-OPS-READ-MODEL-REPAIR-01` is the recommended backend/Ops follow-up:
add a read-only SEO Ops / SEO Intel bridge that labels runtime-published Career
URL Truth separately from legacy CMS Career jobs scope. This is not a fap-web
rendering bug.
