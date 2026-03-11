# Legacy URL Deprecation Runbook

## 1. Scope

- legacy paths: `/test/*`, `/quiz/*`
- canonical paths: `/tests/*`
- default mode: `FAP_LEGACY_PATH_MODE=redirect`

## 2. Rollout Modes

1. `redirect` (default)
- legacy path returns `308` and preserves query string.
- canonical behavior remains unchanged.
- root `/quiz` returns `308` to `/en/tests`.
- root `/quiz/:slug` returns `308` to `/en/quiz/:slug`, then the existing locale quiz page performs canonical slug redirect to `/en/tests/{canonicalSlug}/take`.

2. `gone`
- legacy path returns `410 Gone`.
- canonical `/tests/*` remains available.
- within the current root-quiz scope, `/quiz/:slug` returns `410` via `proxy.ts`.
- bare `/quiz` no longer redirects, but still resolves as `404` because the current legacy matcher only owns `/quiz/` descendants. This PR keeps that limitation explicit rather than expanding matcher scope.

## 3. Promotion Gate

Switch to `gone` only when all conditions hold:

1. legacy request share stays below `0.1%` for 14 consecutive days.
2. no high-value referral source still using legacy links.
3. no increase in 404/410-related user support incidents.

## 4. Rollback

If any anomaly appears after switching to `gone`:

1. set `FAP_LEGACY_PATH_MODE=redirect`.
2. redeploy web.
3. verify legacy 308 behavior with e2e smoke.

## 4.5 Observation Gate Checks for `/quiz*`

- In `redirect` mode:
  - `/quiz` should return `308` to `/en/tests`.
  - `/quiz/<slug>?utm=a` should return `308` to `/en/quiz/<slug>?utm=a`.
- In `gone` mode:
  - `/quiz/<slug>` should return `410`.
  - bare `/quiz` should be recorded as `404` under the current constrained implementation.

## 5. Acceptance Commands

```bash
cd /Users/rainie/Desktop/GitHub/fap-web
pnpm test:e2e --grep "legacy slug redirect" --workers=1
FAP_LEGACY_PATH_MODE=gone pnpm test:e2e --grep "legacy slug redirect" --workers=1
```
