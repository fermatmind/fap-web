# fap-web

Next.js frontend for FermatMind assessments.

## Route map (UI redesign)

- Primary content routes:
  - `/[locale]/articles`
  - `/[locale]/career`
  - `/[locale]/help`
  - `/[locale]/business`
- Legacy routes are preserved with permanent redirects:
  - `/[locale]/blog*` -> `/[locale]/articles*`
  - `/[locale]/support` -> `/[locale]/help`
  - `/[locale]/professions*` -> `410 Gone`
  - `/[locale]/types*` -> `410 Gone`

## Prerequisites

- Node.js 20.x (see `.nvmrc`)
- pnpm 10.28.1 (via `corepack`)

## Package manager policy

This repository is **pnpm-only**.

- Use: `pnpm install --frozen-lockfile`
- Do not use: `npm install` / `yarn install`

## Runtime policy

- This repository only supports Node.js 20.x and pnpm.
- `pnpm install` runs a runtime check and fails fast on the wrong Node major version or a non-pnpm installer.
- Run `nvm use` before installing dependencies if your shell is not already on Node 20.x.

## Local development

```bash
corepack enable
pnpm run check:runtime
pnpm install --frozen-lockfile
pnpm dev
```

## Quality checks

```bash
pnpm lint
pnpm lint:spacing
pnpm typecheck
pnpm test:contract
pnpm test:a11y
pnpm test:e2e tests/e2e/home-visual.spec.ts tests/e2e/tests-list.spec.ts tests/e2e/test-detail.spec.ts
pnpm test:e2e tests/e2e/sds-flow.spec.ts tests/e2e/clinical-combo-flow.spec.ts tests/e2e/big5-flow.spec.ts tests/e2e/big5-negative.spec.ts
pnpm build
# Visual snapshots are Linux-baseline only and always run full visual suite.
pnpm test:e2e:visual:ci
# Update snapshots after intentional UI changes (full suite only).
pnpm test:e2e:visual:update
# Update snapshots in Linux container (authoritative for PRs, full suite only).
pnpm test:e2e:visual:update:linux
pnpm release:gate
# Optional for local machines that keep .env.local:
RELEASE_GATE_ALLOW_LOCAL_ENV=1 pnpm release:gate
```

Recommended CI order for UI changes:

1. `pnpm lint`
2. `pnpm lint:spacing`
3. `pnpm test:e2e:visual:update` (or `pnpm test:e2e:visual:update:linux`)
4. `pnpm test:e2e:visual:ci`

Visual snapshot policy:

- Only `*-linux.png` baselines are supported under `tests/e2e/visual/*-snapshots/`.
- Do not commit `*-darwin.png` files.
- Any intentional UI change must include updated Linux visual snapshots in the same PR.
- Do not update a single visual spec in isolation; always run full `tests/e2e/visual`.
- Visual runner ignores local `.env.local` / `.env.production.local` by default to match CI. Use `VISUAL_USE_LOCAL_ENV=1` only when explicitly needed.
- Playwright now starts its own server by default (no silent port-3000 reuse). If you intentionally want to reuse an existing local server, set `PLAYWRIGHT_REUSE_SERVER=1`.

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
- `/Users/rainie/Desktop/GitHub/fap-web/ecosystem.config.cjs`

`/Users/rainie/Desktop/GitHub/fap-web/docs/deploy/*` are reference docs.
For cron autoheal setup, see:

- `/Users/rainie/Desktop/GitHub/fap-web/docs/deploy/502-recovery-runbook.md`
- `/Users/rainie/Desktop/GitHub/fap-web/docs/deploy/pm2-autoheal-cron.md`

### PM2 deploy entrypoint (single allowed command)

Use a single deploy entrypoint to avoid malformed multi-line PM2 commands.
Do not run hand-typed PM2 start commands such as `pm2 start ... -- \\ -lc ...`.

```bash
pnpm run deploy:pm2
# or:
bash scripts/deploy_web_pm2.sh
```

Environment overrides (optional): `APP_DIR`, `APP_NAME`, `APP_USER`, `APP_HOST`, `APP_PORT`, `PUBLIC_BASE_URL`, `CORE_PUBLIC_PATH`, `GIT_BRANCH`.

### PM2 bootstrap on reboot (one-time server setup)

Run once on the server to enable PM2 resurrection after reboot:

```bash
pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
```

### Runtime guardrails (healthcheck + autoheal + WeCom)

Healthcheck script:

```bash
bash scripts/healthcheck_web.sh
```

Exit codes: `0=healthy`, `1=local endpoint failure`, `2=public endpoint failure`, `3=pm2 process failure`.

Autoheal script:

```bash
WECOM_BOT_WEBHOOK="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=<your-key>" \
bash scripts/autoheal_pm2.sh
```

Supported env vars:

- `WECOM_BOT_WEBHOOK`
- `HEALTHCHECK_LOCAL_URLS` (default: `http://127.0.0.1:3000/en,http://127.0.0.1:3000/zh`)
- `HEALTHCHECK_PUBLIC_URLS` (default: `https://fermatmind.com/en,https://fermatmind.com/zh`)
- `AUTOHEAL_COOLDOWN_SEC` (default: `600`)

Cron example (every minute):

```bash
* * * * * cd /opt/apps/fap-web && WECOM_BOT_WEBHOOK="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=<your-key>" bash scripts/autoheal_pm2.sh >> /var/log/fap-web-autoheal.log 2>&1
```

### Standalone run (non-PM2 fallback)

```bash
pnpm build
node .next/standalone/server.js
```
