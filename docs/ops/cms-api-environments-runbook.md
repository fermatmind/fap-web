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

`pnpm dev` runs `scripts/check-cms-api-health.mjs` before starting Next.js. The check is intentionally non-blocking:

- It reads `NEXT_PUBLIC_API_URL` from shell env, `.env.local`, or `.env`.
- It probes the public article enumeration endpoint.
- It prints a warning if the CMS API is unreachable or the smoke query returns no articles.
- It does not stop the dev server.

Run it directly with:

```bash
pnpm check:cms-api
```

## Operating Policy

- Use staging API for normal frontend work, IAB review, visual diffing, and SEO review.
- Use local API only for backend/CMS integration.
- Do not add local article JSON, MDX, or static public images to make CMS-backed content appear.
- If CMS/API is unavailable, high-traffic pages should use last-known-good cache or a minimal shell.
- Optional sections such as homepage recommended reading should not render large empty bands when the CMS returns no items.

## Staging Baseline Requirements

The staging CMS baseline should include:

- Homepage recommended articles block with 6 published article references per locale.
- At least 20 published articles for `/articles`.
- MBTI, Big Five, and Enneagram related article coverage.
- Homepage, tests hub, test category, career center, and topic landing surface payloads.
- Content pages for help, policy, company, brand, career, about, privacy, terms, refund, and support surfaces.
- SEO metadata for public entry pages.
- Media Library references for article covers, social images, and mutable marketing images.
- Sitemap and `llms.txt` enumerable records.

## Release Smoke

Before content release or frontend release, verify:

```bash
pnpm check:cms-api
curl -fsS "$NEXT_PUBLIC_API_URL/api/v0.5/articles?locale=zh-CN&page=1&per_page=6&org_id=0" >/dev/null
curl -fsS http://localhost:3000/ >/dev/null
curl -fsS http://localhost:3000/zh/articles >/dev/null
```

Expected release behavior:

- Homepage recommended articles are visible when the CMS block is configured.
- `/zh/articles` has article cards.
- Article detail routes open.
- SEO metadata comes from CMS/API.
- Sitemap and llms routes enumerate CMS/API records.

## Repository Rule Impact

This runbook reinforces the existing content authority rule: CMS/backend remains the source of truth for public editorial and marketing content. This PR adds operational guidance and dev observability only; it does not introduce a new content surface or a frontend fallback content store.
