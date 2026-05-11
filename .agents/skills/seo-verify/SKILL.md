---
name: seo-verify
description: Validate SEO surfaces for fap-web: sitemap generation, sitemap assertion, llms.txt assertion, and llms-full.txt assertion. Used after backend content changes or deployments.
---

# SEO Verification

## Purpose
Validate that fap-web SEO surfaces (sitemap.xml, llms.txt, llms-full.txt) correctly enumerate CMS-backed content. Used after backend content promotions, new page launches, or deployments to ensure search engines see the correct canonical URLs.

## When to Use
- After deploying career canonical rollout or new content pages
- After updating CMS content that affects sitemap/LLMS enumeration
- Before marking a content release as live
- When debugging `bad_count` errors in sitemap or LLMS outputs

## When Not to Use
- For backend-only changes that don't affect public URLs
- For frontend component changes unrelated to SEO metadata
- When the API server is unreachable — fix connectivity first

## Hard Invariants
- **Do not** hardcode sitemap/LLMS entries — they must come from CMS/public APIs.
- **Do not** skip the assertion step after content changes.
- **Do not** deploy if `bad_count > 0` in any SEO surface.
- **Do not** manually edit generated sitemap/LLMS files.

## Standard Workflow

### Step 1 — Generate Sitemap
```bash
pnpm seo:generate-sitemap
```

### Step 2 — Check Sitemap
```bash
pnpm seo:check-sitemap
```

### Step 3 — Assert Live SEO Surfaces
```bash
pnpm seo:assert-live-sitemap
pnpm seo:assert-live-llms
pnpm seo:assert-live-llms-full
```

### Step 4 — Push to Baidu (if applicable)
```bash
pnpm seo:push-baidu
```

## Acceptance Commands
```bash
pnpm seo:generate-sitemap
pnpm seo:assert-live-sitemap
pnpm seo:assert-live-llms
pnpm seo:assert-live-llms-full
```

## Output Contract
Each SEO assertion must return exit code 0. Expected output:
- `bad_count=0` for all three surfaces (sitemap, llms, llms-full)
- All promoted slugs present in sitemap
- All promoted slugs present in llms.txt
- All promoted slugs present in llms-full.txt
- No cn-* leakage
- No software-developers leakage
- No family/industry ghost URLs

## Stop Conditions
- `bad_count > 0` in any SEO surface
- Missing canonical slugs in sitemap or LLMS files
- Unauthorized slugs (cn-*, software-developers, family, industry) appearing in SEO surfaces
- API server returns non-200 for any CMS-backed URL in the sitemap
