# fap-web

Next.js frontend for FermatMind assessments.

## Prerequisites

- Node.js 20.x (see `.nvmrc`)
- pnpm 10.28.1 (via `corepack`)

## Package manager policy

This repository is **pnpm-only**.

- Use: `pnpm install --frozen-lockfile`
- Do not use: `npm install` / `yarn install`

## Local development

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test:contract
pnpm test:a11y
pnpm test:e2e tests/e2e/home-visual.spec.ts tests/e2e/tests-list.spec.ts tests/e2e/test-detail.spec.ts
pnpm test:e2e tests/e2e/sds-flow.spec.ts tests/e2e/clinical-combo-flow.spec.ts tests/e2e/big5-flow.spec.ts tests/e2e/big5-negative.spec.ts
# Visual snapshots run serially to avoid Next.js first-compile flakiness in parallel workers.
pnpm test:e2e:visual
pnpm release:gate
# Optional for local machines that keep .env.local:
RELEASE_GATE_ALLOW_LOCAL_ENV=1 pnpm release:gate
```

Release operation details and rollback thresholds are documented in:

- `/Users/rainie/Desktop/GitHub/fap-web/docs/ui-unification-release-runbook.md`

## Manual verification for anonId and order flow

1. New visitor bootstrap:
   - Clear browser `localStorage` and cookies for the site.
   - Open a `/tests/[slug]/take` page.
   - Confirm `fap_anonymous_id_v1` exists in both cookie and `localStorage`, and outbound API requests include `X-Anon-Id`.
2. Legacy identity migration:
   - Set `localStorage.fap_anonymous_id_v1` to an existing value.
   - Set cookie `fap_anonymous_id_v1` to a different value.
   - Reload and confirm cookie is overwritten by the `localStorage` value.
3. Order polling backoff:
   - Open `/orders/{orderNo}` while backend status remains `pending`.
   - Confirm polling interval follows `2s -> 3s -> 5s -> 8s -> 10s` and manual refresh triggers immediate poll.
4. Paid auto redirect:
   - Return `paid` plus `attempt_id` from order status.
   - Confirm page auto navigates to `/result/{attemptId}`.
5. Paid but report not ready:
   - Return `paid` without `attempt_id` on order status, or `generating=true` on report API.
   - Confirm UI shows generating state and retries using `retry_after` (fallback 3s, capped at 10s).
6. Sensitive route caching:
   - Visit `/orders/{orderNo}` and `/result/{attemptId}` with different values.
   - Confirm responses are dynamic and do not leak stale/cross-user content.

## Build and run

```bash
pnpm build
pnpm start
```

## Production deployment

Production deployment assets are in:

- `/Users/rainie/Desktop/GitHub/fap-web/deploy/systemd/fap-web.service`
- `/Users/rainie/Desktop/GitHub/fap-web/deploy/nginx/fap-web.conf`

`/Users/rainie/Desktop/GitHub/fap-web/docs/deploy/*` are reference docs.

### Standalone run

```bash
pnpm build
node .next/standalone/server.js
```
