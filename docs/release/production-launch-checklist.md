# Production Launch Checklist

## 1) Release Evidence Chain
1. Confirm the MBTI + Big5 release-freeze PRs are merged and the release SHA is fixed.
2. Build reproducibility evidence:
   - `pnpm install --frozen-lockfile`
   - `pnpm build`
   - `bash scripts/release_evidence.sh`
3. Frontend release-freeze verify:
   - `bash scripts/release_freeze_verify.sh`
4. Backend release-freeze verify:
   - `bash ../fap-api/backend/scripts/release_freeze_verify.sh`
5. Active closeout notes:
   - `docs/release/2026-03-mbti-big5-release-freeze-closeout.md`
   - `../fap-api/docs/verify/release-freeze-mbti-big5.md`
   - Big Five Web release / freeze rule: `docs/release/big5-release-freeze-rule.md`

## 2) Launch Gate (Blockers)
1. Contract:
   - `pnpm exec vitest run tests/contracts/unified-access.contract.test.ts tests/contracts/result-client-view-state.contract.test.tsx tests/contracts/mbti-history-account-center.contract.test.tsx tests/contracts/mbti-post-purchase-retention.contract.test.tsx tests/contracts/big5.contract.test.ts tests/contracts/big5-secondary-surfaces.contract.test.tsx`
2. Critical E2E / smoke:
   - `pnpm exec playwright test tests/e2e/result-loading.spec.ts tests/e2e/mbti-access-first-result.spec.ts tests/e2e/mbti-locked-unlock.spec.ts tests/e2e/mbti-post-purchase.spec.ts tests/e2e/mbti-share.spec.ts tests/e2e/big5-flow.spec.ts tests/e2e/big5-history-result-center.spec.ts tests/e2e/share-public-surfaces.spec.ts`
3. Release source gate:
   - `pnpm release:gate`
4. Backend freeze contracts:
   - `bash ../fap-api/backend/scripts/release_freeze_verify.sh`

## 3) Rollout Controls
1. Scale switches:
   - `ENABLE_MBTI`
   - `ENABLE_BIG5_OCEAN`
   - `ENABLE_SDS_20`
   - `ENABLE_CLINICAL_COMBO_68`
2. Percentage rollout:
   - `ROLLOUT_PERCENT_MBTI`
   - `ROLLOUT_PERCENT_BIG5_OCEAN`
   - `ROLLOUT_PERCENT_SDS_20`
   - `ROLLOUT_PERCENT_CLINICAL_COMBO_68`
3. Crisis-scale commerce kill switch:
   - `ENABLE_SDS_20_COMMERCE`
   - `ENABLE_CLINICAL_COMBO_68_COMMERCE`
4. Progressive release sequence:
   - `0 -> 5 -> 20 -> 50 -> 100`

## 4) Launch-Day Dashboard
1. Questions API failure rate (`questions_load_failure`).
2. Submit failure rate by status group (`submit_failure`, 422/500/timeout).
3. Report-access / report failure rate (`report_access_failure`, `report_load_failure`).
4. Unlock success / paid order ratio (`unlock_success`, `pay_success`).
5. Share click / compare invite creation (`share_click`, `compare_invite_create`).
6. Sentry error rate tagged by `route`, `scale`, `release`.

## 5) Rollback Drill (Mandatory)
1. Run:
   - `bash scripts/rollback_smoke.sh`
2. Complete within 10 minutes:
   - rollback web to previous tag
   - validate `questions -> submit -> result -> report-access -> report`
3. Save drill record:
   - `docs/release/rollback-drill.md` execution log section
4. For Career first-wave stable routes, also follow:
   - `docs/release/career-first-wave-smoke-and-rollback.md`

## 6) Deployment Command Audit (Mandatory)
1. Only deploy through:
   - `pnpm run deploy:pm2`
   - or `bash scripts/deploy_web_pm2.sh`
2. Explicitly forbidden:
   - hand-typed multi-line PM2 commands (for example `pm2 start ... -- \ -lc ...`)
3. Post-deploy verification must include:
   - `pm2 status` shows `fap-web` in `online`
   - `ss -ltnp | grep ':3000'` confirms local listener
   - no `502` from `/en`, `/zh`, `/en/result/<attemptId>`, `/en/history/big5`, and one core `/tests/.../take` route
