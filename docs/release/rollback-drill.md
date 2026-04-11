# Rollback Drill Runbook

## Goal
Validate that frontend rollback can recover core path (`questions -> submit -> report`) within 10 minutes.

For Career first-wave launch surfaces, pair this drill with:
- `docs/release/career-first-wave-smoke-and-rollback.md`

## Prerequisites
1. Previous stable web tag available.
2. Staging or production-like API endpoint available.
3. Operator has deploy access and monitoring dashboard access.

## Drill Steps
1. Record current release:
   - `git rev-parse --short HEAD`
   - deployed tag
2. Trigger rollback deploy to previous stable tag.
3. Run smoke checks:
   - `bash scripts/rollback_smoke.sh`
4. Validate:
   - questions endpoint returns 200
   - submit endpoint accepts valid payload
   - report endpoint returns renderable payload
5. Restore latest release (optional post-drill).

## Process Startup Failure Branch (PM2)
Use this branch when upstream returns `502` and `fap-web` is missing/offline in PM2.

1. Confirm process state:
   - `pm2 status`
   - `ss -ltnp | grep ':3000'`
2. Redeploy using single entrypoint only:
   - `pnpm run deploy:pm2`
   - or `bash scripts/deploy_web_pm2.sh`
3. Validate runtime:
   - `pm2 logs fap-web --lines 80 --nostream`
   - `curl -fsSI http://127.0.0.1:3000/en`
   - `curl -fsSIL https://fermatmind.com/en`
4. If still failing, capture first startup error from PM2 logs and stop rollout.
5. Keep rollback decision independent from command-format errors:
   - command-format issues must be fixed operationally first
   - only rollback when app code/config regression is confirmed

## Success Criteria
1. End-to-end smoke succeeds within 10 minutes.
2. No sustained increase in `report_load_failure` or `submit_failure`.
3. Crisis report pages still hide upsell.

## Execution Log
- Date:
- Operator:
- From tag:
- To tag:
- Smoke result:
- Total elapsed:
- Follow-up actions:
