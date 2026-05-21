# CMS API Environment Runbook

Status: PR-CMSOPS-1

## Purpose

FermatMind public surfaces are CMS/API authoritative. Articles, homepage recommendation slots, SEO metadata, sitemap/llms enumeration, content pages, career content, topic pages, and mutable media references must come from the backend CMS or public APIs. Frontend code should not reintroduce local editorial fallbacks for these surfaces.

## Environment Roles

Production uses the production public API:

```env
NEXT_PUBLIC_API_URL=https://api.fermatmind.com
```

Daily frontend development and design review should use a stable staging/preview CMS API with seeded editorial content:

```env
NEXT_PUBLIC_API_URL=https://staging-api.fermatmind.com
```

Local backend integration uses a local API only when developing CMS/API contracts, importers, or backend behavior:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Local API mode is not the default for homepage/content review because it depends on a local database, local CMS seed state, and local media availability.

## Dev Startup Check

`pnpm dev` runs `scripts/check-cms-api-health.mjs` before starting Next.js. The check verifies that CMS-backed homepage and article content are usable before a browser review begins:

- It reads `NEXT_PUBLIC_API_URL` from shell env, `.env.local`, or `.env`.
- It probes the public article enumeration endpoint.
- It probes the public `home` landing surface and requires `recommended_articles` or `homepage_recommended_articles`.
- It requires the homepage recommendation block to expose 6 published public zh-CN article references.
- It verifies required backend static media paths for footer QR codes and default social preview images return image responses.
- It fails closed by default when required CMS data is missing or unreachable, because stale Next.js fetch cache can otherwise hide missing CMS data.
- It uses a 10-second default request timeout. Override with `CMS_API_HEALTH_TIMEOUT_MS` only when investigating network behavior, not to hide missing CMS content.
- It can be downgraded only with `CMS_API_HEALTH_STRICT=0` for intentionally degraded product-shell work.

Run it directly with:

```bash
pnpm check:cms-api
```

For intentionally degraded product-shell work only, a developer can opt out of the local fail-closed behavior:

```bash
CMS_API_HEALTH_STRICT=0 pnpm dev
```

Do not use that override for homepage/content review, release smoke, SEO review, or CMS contract work.

## Operating Policy

- Use staging API for normal frontend work, IAB review, visual diffing, and SEO review.
- Use local API only for backend/CMS integration.
- Do not add local article JSON, MDX, or static public images to make CMS-backed content appear.
- If local API mode is selected, start the backend and import the CMS baselines before starting the frontend.
- If CMS/API is unavailable, high-traffic pages should use last-known-good cache or a minimal shell.
- Optional sections such as homepage recommended reading should not render large empty bands when the CMS returns no items.

## Last-Known-Good Runtime Coverage

CMS-backed public entry points should degrade in this order:

```text
CMS/API fresh content
  -> stale last-known-good CMS/API response
  -> minimal shell, empty optional section, or 404 for missing detail content
```

Current LKG-covered surfaces include:

- Homepage, tests hub, tests category, and career center landing surfaces.
- Homepage recommended article block.
- Article list pages and test-detail related article slots.
- Article detail content and article SEO metadata.
- Help/company/policy content pages.
- `llms.txt` and `llms-full.txt` CMS article/help enumeration.

LKG entries are runtime cache values derived from CMS/API responses. They are not frontend editorial fixtures and must not be used to add local article/content fallbacks.

## Staging Baseline Requirements

The staging CMS baseline should include:

- Homepage recommended articles block with 6 published article references per locale.
- At least 20 published articles for `/articles`.
- MBTI, Big Five, and Enneagram related article coverage.
- Homepage, tests hub, test category, career center, and topic landing surface payloads.
- Content pages for help, policy, company, brand, career, about, privacy, terms, refund, and support surfaces.
- SEO metadata for public entry pages.
- Media Library references for article covers, social images, and mutable marketing images.
- Backend static media serving for the required Media Library baseline paths, including footer WeChat QR codes and default social preview images.
- Sitemap and `llms.txt` enumerable records.

## Staging Baseline Validation

Run the read-only baseline validator before release smoke, design review, and large CMS content migrations:

```bash
pnpm cms:baseline:staging
```

The command defaults to:

```env
NEXT_PUBLIC_API_URL=https://staging-api.fermatmind.com
STAGING_WEB_URL=https://staging.fermatmind.com
```

Override those when validating another environment:

```bash
pnpm cms:baseline:staging -- --api-url https://api.fermatmind.com --web-url https://fermatmind.com
```

The validator is intentionally dry-run and read-only. It does not import content, mutate CMS records, write frontend fixtures, or create local article fallbacks. It verifies:

- Homepage `recommended_articles` or `homepage_recommended_articles` page block has exactly 6 published public articles per locale.
- Article listing exposes at least 20 published public articles per locale.
- MBTI, Big Five, and Enneagram related articles are present through CMS article metadata.
- Sampled articles include title, excerpt, cover image, SEO title/description/canonical, and social image metadata.
- Required content pages include about, privacy, terms, and at least one help page per locale.
- `sitemap.xml`, `llms.txt`, and `llms-full.txt` enumerate sampled CMS article routes.

Print the validation plan without network calls:

```bash
node scripts/validate-staging-cms-baseline.mjs --print-plan --json
```

If the validator fails, fix CMS/backend data or media references first. Do not patch the frontend with static article/content copies to satisfy the baseline.

## Staging Content Release Order

Staging content should be rebuilt by backend CMS/API importers and CMS publishing tools, not by manual frontend edits. Use this order for baseline refreshes, recovery, and release preparation:

1. Import Media Library assets and generated variants.
2. Import or update articles, including locale, publish state, SEO, cover image, social image, categories, and tags.
3. Import or update landing surfaces and page blocks, including homepage recommended articles, tests hub, test category pages, career center, and topic surfaces.
4. Import or update content pages, including about, privacy, terms, refund, support, help, company, brand, and career pages.
5. Warm relevant runtime caches or last-known-good entries from CMS/API responses.
6. Run staging smoke with the baseline validator.

The order matters because articles and media must exist before page blocks reference them, and content pages must exist before sitemap or llms enumeration is considered complete. If the smoke fails, fix CMS data, importer ordering, media references, or backend validation. Do not add frontend fallback content.

Use the packaged staging smoke entry point for the final read-only check:

```bash
pnpm cms:baseline:staging:smoke
```

The smoke command defaults to the staging API and staging web origin. Override the targets when validating another preview stack:

```bash
CMS_BASELINE_API_URL=https://staging-api.fermatmind.com \
CMS_BASELINE_WEB_URL=https://staging.fermatmind.com \
pnpm cms:baseline:staging:smoke
```

## Release Smoke

Before content release or frontend release, verify:

```bash
pnpm check:cms-api
pnpm cms:baseline:staging:smoke
curl -fsS "$NEXT_PUBLIC_API_URL/api/v0.5/articles?locale=zh-CN&page=1&per_page=6&org_id=0" >/dev/null
curl -fsSI "$NEXT_PUBLIC_API_URL/static/social/wechat-qr-official-258.jpg" | grep -Ei '^content-type: image/' >/dev/null
curl -fsS http://localhost:3000/ >/dev/null
curl -fsS http://localhost:3000/zh/articles >/dev/null
```

`scripts/deploy_web_pm2.sh` can run the staging baseline smoke after the normal deployment probes when explicitly enabled:

```bash
RUN_CMS_BASELINE_STAGING_SMOKE=1 \
CMS_BASELINE_API_URL=https://staging-api.fermatmind.com \
CMS_BASELINE_WEB_URL=https://staging.fermatmind.com \
pnpm deploy:pm2
```

The deploy script leaves this disabled by default so production deploys and unrelated operational recovery tasks are not blocked by staging content gaps. Staging release jobs should enable it after the CMS baseline import has completed.

`scripts/deploy_web_pm2.sh` can also run a content-release revalidation smoke against the frontend consumer after the normal PM2 convergence checks:

```bash
RUN_CONTENT_RELEASE_REVALIDATE_SMOKE=1 \
CONTENT_RELEASE_REVALIDATE_URL=https://www.fermatmind.com/api/content-release/revalidate \
CONTENT_RELEASE_REVALIDATE_TOKEN=shared-release-token \
CONTENT_RELEASE_REVALIDATE_LOCALE=zh-CN \
CONTENT_RELEASE_REVALIDATE_TYPE=content_page \
CONTENT_RELEASE_REVALIDATE_SLUG=help-privacy \
CONTENT_RELEASE_REVALIDATE_PATHS=/help/privacy,/support \
pnpm deploy:pm2
```

Use the packaged smoke directly when validating a deployed environment outside the full PM2 deploy:

```bash
CONTENT_RELEASE_REVALIDATE_URL=https://www.fermatmind.com/api/content-release/revalidate \
CONTENT_RELEASE_REVALIDATE_TOKEN=shared-release-token \
pnpm cms:content-release:smoke
```

This smoke is read-only with respect to CMS data. It only verifies that:

- the frontend revalidation consumer is reachable
- the shared token is accepted
- release payload paths are normalized into localized frontend paths
- the response reports the expected `revalidated_paths`

Deployment wiring for end-to-end release invalidation must stay aligned across backend and frontend:

- backend: `OPS_CONTENT_RELEASE_CACHE_INVALIDATION_URLS`
- backend: `OPS_CONTENT_RELEASE_CACHE_INVALIDATION_SECRET`
- frontend: `CONTENT_RELEASE_REVALIDATE_TOKEN`

The backend invalidation URL list should point at the frontend `/api/content-release/revalidate` consumer, and the backend secret must match the frontend token exactly.

For article releases, the backend content-release planner sends locale-aware paths instead of relying on manual cache-busters. The default release set must include the localized homepage, article list, article detail, `/llms.txt`, and `/llms-full.txt`; package graph metadata can add Topic, Test, Personality, and Career Guide paths. The frontend consumer intentionally accepts only public content paths and reports any rejected paths in `rejected_paths`.

Minimum production release wiring:

- `OPS_CONTENT_RELEASE_CACHE_INVALIDATION_URLS=https://www.fermatmind.com/api/content-release/revalidate`
- `OPS_CONTENT_RELEASE_CACHE_INVALIDATION_SECRET=<shared secret>`
- `CONTENT_RELEASE_REVALIDATE_TOKEN=<same shared secret>`

Sitemap note: `sitemap.xml` is a generated static artifact, not a path that this revalidation consumer can rewrite. Daily publishing still needs a sitemap regeneration/deploy step, or a future dynamic sitemap rollout, before sitemap freshness can be treated as automatic.

Expected release behavior:

- Homepage recommended articles are visible when the CMS block is configured.
- `/zh/articles` has article cards.
- Article detail routes open.
- Footer WeChat QR code and default social preview media load from backend media/static hosting.
- SEO metadata comes from CMS/API.
- Sitemap and llms routes enumerate CMS/API records.
- Content release invalidation can be probed through the frontend revalidation consumer without manual `.next/cache` deletion.

## Repository Rule Impact

This runbook reinforces the existing content authority rule: CMS/backend remains the source of truth for public editorial and marketing content. The staging baseline validator is a read-only operational guard; it does not introduce a new content surface or a frontend fallback content store.
