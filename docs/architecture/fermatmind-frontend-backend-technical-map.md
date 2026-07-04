# FermatMind Frontend And Backend Technical Map

Status: working technical map
Last updated: 2026-07-04
Scope: `/Users/rainie/Desktop/GitHub/fap-web` and `/Users/rainie/Desktop/GitHub/fap-api`

## System Summary

FermatMind / 费马测试 is a multilingual assessment and growth platform. The live product presents MBTI, Big Five, RIASEC, Enneagram, IQ, EQ, career, articles, policy, science, and support surfaces.

The system boundary is:

- `fap-web`: public Next.js web application, UI rendering, take flows, result shells, SEO routes, API adapters, tracking clients, and local frontend validation.
- `fap-api`: Laravel backend, CMS authority, public APIs, scoring, assessment drivers, norms, content publishing, media authority, commerce, support, and operations.

The backend or declared authority layer remains the source of truth for mutable content, public enumeration, content authority, scoring, and private data decisions.

## Frontend Repository

Path:

```text
/Users/rainie/Desktop/GitHub/fap-web
```

Runtime:

- Next.js 16
- React 19
- TypeScript
- pnpm 10.28.1
- Node.js `>=24 <25`

Core directories:

- `app/`: App Router routes, localized routes, SEO routes, sitemap, robots, `llms.txt`, API route handlers.
- `components/`: shared UI, assessment UI, result shells, CMS rendering, marketing shells, ops UI.
- `lib/`: API adapters, assessment-specific client logic, SEO authority adapters, CMS clients, tracking, scoring/result assembly helpers used by frontend.
- `scripts/`: validation, SEO generation/checks, ops smoke checks, launch readiness scripts.
- `tests/`: contract, a11y, Playwright, visual, and assessment-specific checks.
- `docs/`: architecture, audits, PR train metadata, launch runbooks, and operational records.

Important frontend entry points:

- Home: `app/(localized)/[locale]/page.tsx`
- Tests hub: `app/(localized)/[locale]/tests/page.tsx`
- Test detail: `app/(localized)/[locale]/tests/[slug]/page.tsx`
- Content pages: `app/(localized)/[locale]/contentPageRoute.tsx`
- Articles: `app/(localized)/[locale]/articles/page.tsx`, `app/(localized)/[locale]/articles/[slug]/page.tsx`
- Career pages: `app/(localized)/[locale]/career/*`
- Sitemap/robots/LLMS: `app/sitemap.xml/route.ts`, `app/robots.ts`, `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts`

Assessment frontend modules:

- MBTI: `lib/mbti/`, `components/result/mbti/`, MBTI compare/history/relationship routes.
- Big Five: `lib/big5/`, `components/big5/`, `components/result/big5/`.
- RIASEC: `lib/riasec/`, `components/result/riasec/`, RIASEC history routes.
- Enneagram: `lib/enneagram/`, `components/result/enneagram/`.
- IQ: `lib/iq/`, `components/quiz/iq/`, `components/result/iq/`, `scripts/iq/`.
- EQ/clinical: `components/result/eq/`, `lib/clinical/`, `components/clinical/`.

Frontend validation commands:

```bash
cd /Users/rainie/Desktop/GitHub/fap-web
pnpm lint
pnpm lint:spacing
pnpm typecheck
pnpm test:contract
pnpm build
git diff --check
```

Assessment-specific checks:

```bash
cd /Users/rainie/Desktop/GitHub/fap-web
pnpm verify:riasec-launch
pnpm verify-big5-contract-freeze
pnpm verify-enneagram-contract-freeze
```

## Backend Repository

Path:

```text
/Users/rainie/Desktop/GitHub/fap-api
```

Runtime:

- Laravel 12
- PHP 8.4
- Composer
- Backend Node build tools for Vite/Ops theme where needed
- Filament Ops panel

Core directories:

- `backend/routes/api.php`: API route truth.
- `backend/app/Http/Controllers/`: public, admin, ops, and API controllers.
- `backend/app/Services/Assessment/`: assessment drivers and scorers.
- `backend/app/Services/Cms/`: article/content CMS workflows.
- `backend/app/Services/ContentPages/`: content page publishing.
- `backend/app/Services/Iq/`: IQ bank, norm authority, result redaction, observability.
- `backend/app/Services/BigFive/`, `backend/app/Services/Mbti/`, `backend/app/Services/Enneagram/`, `backend/app/Services/Content/`: assessment domain services.
- `backend/app/Console/Commands/`: importers, dry-runs, release gates, observability, publishing and repair commands.
- `backend/app/Filament/Ops/`: operational CMS/admin resources.
- `backend/tests/`: Laravel and domain tests.
- `content_packages/`: versioned content packages and baseline content sources.
- `docs/`: backend architecture, operations, release, security, and content-authority documentation.

Important backend modules:

- Assessment drivers: `MbtiDriver`, `BigFiveOceanDriver`, `RiasecDriver`, `EnneagramDriver`, `IqTestDriver`.
- Scoring: `MbtiScorer`, `BigFiveScorerV3`, `RiasecScorer`, Enneagram scorers, IQ beta standard score service.
- Norms: `NormsImport`, `NormsIqImport`, `ScaleNormStat`, `ScaleNormsVersion`, `NormSource`.
- CMS: `Article`, `ArticleRevision`, `ArticleSeoMeta`, `ArticleCategory`, `ArticleTag`, `LandingSurface`, `SupportArticle`.
- Content pages: controlled publish service and local baseline importer.
- Media/content SEO: article image metadata, inline image replacement, release closeout, discoverability release.

Backend validation commands:

```bash
cd /Users/rainie/Desktop/GitHub/fap-api/backend
composer test
php artisan test
php artisan route:list --path=api --except-vendor
bash scripts/verify_mbti.sh
git diff --check
```

Backend CI chain:

```bash
cd /Users/rainie/Desktop/GitHub/fap-api
bash backend/scripts/ci_verify_mbti.sh
```

## Authority Boundaries

### Backend/CMS Authority

These must be controlled by backend CMS, public APIs, or backend authority services:

- Articles and article SEO.
- Article covers, categories, tags, publication state, and related placement.
- Homepage modules, tests hub modules, test category page modules, module ordering, CTA copy, landing SEO.
- Help, policy, company, brand, careers, about, charter, privacy, terms, refund, support, and similar content pages.
- Career guides, career jobs, career recommendations, occupation metadata, personality public profiles, topics, FAQs and SEO sections.
- Mutable editorial/marketing/social/article/landing images through Media Library.
- Sitemap, `llms.txt`, public SEO metadata, discoverability and indexability enumeration.
- DailyGiving proof media, proof state, and indexability.
- Assessment scoring, backend-private banks, norms, report payload authority, and result privacy decisions.

### Frontend Product-Code Authority

The frontend may own:

- Rendering components.
- Interaction flows.
- Client-side state for active take flows.
- API adapters.
- Result shell layout and display of backend-provided payloads.
- Payment/order UI.
- Tracking client calls that do not expose private result paths.
- Icons, fonts, fixed brand assets, and non-operational product assets.
- Empty/error shells for unavailable CMS responses.

The frontend must not add full editorial fallback content for CMS-backed pages.

## Public Site Research Snapshot

Checked live pages on 2026-07-04:

- `https://fermatmind.com/`: public homepage presents FermatMind as a system for self-understanding, career exploration, and ability growth.
- `https://fermatmind.com/zh/tests`: public tests include MBTI, Big Five, RIASEC, Enneagram, IQ, and EQ.
- `https://fermatmind.com/zh/science`: public science page says assessments are structured observation, not final labels, and says missing public evidence should be marked Unknown.
- `https://fermatmind.com/zh/method-boundaries`: public boundary page says results are structured references and must not replace high-stakes professional decisions.
- `https://fermatmind.com/zh/reliability-validity`: public reliability/validity page says current public pages do not provide specific reliability, validity, sample, or norm figures unless reviewed and published.
- `https://fermatmind.com/zh/data-privacy`: public data page says private results and user-specific links should not enter sitemap, `llms.txt`, public internal links, social links, or public analytics surfaces.
- `https://fermatmind.com/zh/tests/iq-test-intelligence-quotient-assessment`: public IQ page currently describes an original 30-question assessment with backend-private scoring and a non-diagnostic boundary.

Implementation implication:

- Do not let Codex invent stronger science claims than the backend/public evidence provides.
- Keep IQ wording conservative unless backend norm authority and reviewed public copy support a stronger claim.
- Treat private user-specific pages as non-public technical paths.

## Common Cross-Repo Change Patterns

### New Assessment Surface

Backend first:

1. Define or update assessment driver, scorer, form summary, result payload contract, privacy behavior, and any CMS/public discoverability contract.
2. Add backend tests and route contract checks.
3. Add dry-run or fixture validation where payload shape is complex.

Frontend second:

1. Add or update API adapter.
2. Add UI shell and renderer for backend-provided payload.
3. Add contract tests and targeted Playwright/a11y tests.
4. Verify SEO/indexability comes from backend authority.

### Public Content Or SEO Surface

Backend first:

1. Add CMS model/resource/import/dry-run/publish workflow.
2. Define public API and discoverability/indexability.
3. Validate content ownership, publication state, media references, and noindex/sitemap/llms policy.

Frontend second:

1. Render backend payload.
2. Provide empty/error states.
3. Avoid local editorial fallback copy.
4. Verify sitemap and `llms.txt` enumerate from backend/public APIs.

### Result Page Or Report Surface

Backend first:

1. Define scoring and report payload.
2. Redact private/internal fields.
3. Add report contract tests and privacy checks.

Frontend second:

1. Render only contract fields.
2. Avoid client-side inference for authority decisions.
3. Verify locked/unlocked states, PDF/download behavior, and private route caching.

## Repository Rule Impact Checklist

Any PR that changes these areas must include a "Repository rule impact" note:

- Content ownership.
- Publishing SOP.
- Backend CMS models.
- Public content APIs.
- Media asset handling.
- SEO generation.
- Sitemap or `llms.txt` enumeration.
- Frontend fallback behavior.
- New public content surface.
- Assessment authority, scoring, norms, report payload, privacy, or discoverability.

The note must state whether the surface is:

- CMS/backend-authoritative.
- Frontend product-code-only.
- Temporary migration fallback.
- Deprecated.

Temporary migration fallback must include owner, removal condition, and target removal PR or issue.

## Codex Handoff Checklist

When asking Codex to work across these repositories, provide:

- Repository: `fap-web`, `fap-api`, or both.
- Scope: exact behavior and paths if known.
- Authority: backend/CMS/API or frontend product-code-only.
- Validation: required commands or manifest PR id.
- GitHub expectation: research only, implement only, commit, push, PR, or merge.
- Public research requirement: whether live FermatMind pages should be checked.

Example:

```text
在 fap-web 做一个 scoped PR，只改 IQ result renderer，不改 backend，不新增文案权威。
请先确认 backend payload contract，再改 UI，运行 pnpm typecheck、相关 contract/a11y 测试和 git diff --check，最后开 PR。
```
