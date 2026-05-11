---
name: deploy-web
description: Deploy fap-web to production using PM2. Covers build, PM2 reload, rolling convergence check, health check, and SEO smoke verification.
---

# Deploy fap-web to Production

## Purpose
Deploy the fap-web Next.js application to production using the PM2 process manager. Ensures zero-downtime deployment with rolling reload convergence, health checks, and post-deploy smoke verification.

## When to Use
- After merging backend changes that require frontend rebuild (career rollout, new CMS content)
- After frontend code changes that need production deployment
- When performing a routine production deployment

## When Not to Use
- When `pnpm build` fails locally
- When the fap-api backend is unhealthy — fix backend first
- For staging-only deploys — use the staging deploy workflow
- When SEO surfaces have `bad_count > 0` — fix SEO before deploying

## Hard Invariants
- **Do not** deploy if `pnpm build` fails.
- **Do not** deploy if SEO surfaces have errors.
- **Do not** skip the PM2 rolling reload convergence check.
- **Do not** skip the health check after deployment.
- **Do not** deploy if the backend API is unreachable.
- **Do not** deploy if the release gate fails.

## Standard Workflow

### Step 1 — Pre-Deploy Verification
```bash
pnpm check:runtime
pnpm check:cms-api
pnpm verify:release-freeze
pnpm build
```

### Step 2 — Deploy
```bash
pnpm run deploy:pm2
```

### Step 3 — Verify Rolling Reload
```bash
pm2 list
# Verify 4/4 online status
```

### Step 4 — Health Check
```bash
# Run health check against production
curl -fsS https://fermatmind.com/api/healthz | jq -e '.ok==true'
```

### Step 5 — Post-Deploy SEO Smoke
```bash
pnpm seo:assert-live-sitemap
pnpm seo:assert-live-llms
pnpm seo:assert-live-llms-full
```

### Step 6 — Content Release Smoke (if CMS content changed)
```bash
pnpm cms:content-release:smoke
```

## Acceptance Commands
```bash
pnpm build
pnpm run deploy:pm2
pm2 list
curl -fsS https://fermatmind.com/api/healthz | jq -e '.ok==true'
pnpm seo:assert-live-sitemap
pnpm seo:assert-live-llms
pnpm seo:assert-live-llms-full
```

## Output Contract
- PM2 status: 4/4 online
- Health check: `ok=true`
- Sitemap: `bad_count=0`
- llms.txt: `bad_count=0`
- llms-full.txt: `bad_count=0`

## Stop Conditions
- Build fails
- PM2 rolling reload fails (processes don't come back online)
- Health check returns non-200 or `ok=false`
- SEO surfaces have `bad_count > 0`
- CMS content release smoke fails

## Rollback
If any post-deploy check fails:
```bash
pm2 deploy ecosystem.config.cjs production revert 1
```
