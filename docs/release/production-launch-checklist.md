# Production Launch Checklist

## 1) Release Evidence Chain
1. Confirm merge target and PR closure:
   - `PR-WEB-UAT-01`
   - `PR-WEB-OPS-02`
2. Build reproducibility evidence:
   - `pnpm install --frozen-lockfile`
   - `pnpm build`
   - `bash scripts/release_evidence.sh`
3. Create release notes from template:
   - `docs/release/release-note-template.md`
4. Tag format:
   - `web@YYYY-MM-DD+<scope>`
   - example: `web@2026-02-23+cc68_sds_launch_gate`

## 2) Launch Gate (Blockers)
1. Contract:
   - `pnpm test:contract`
2. UAT mock matrix:
   - `bash scripts/run_uat_matrix.sh mock`
3. Critical E2E:
   - `pnpm test:e2e tests/e2e/clinical-combo-flow.spec.ts tests/e2e/sds-flow.spec.ts tests/e2e/big5-flow.spec.ts tests/e2e/mbti-regression.spec.ts`
4. Release source gate:
   - `pnpm release:gate`

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
3. Report load failure rate (`report_load_failure`).
4. Crisis alert view rate (`clinical_crisis_view`).
5. Unlock success / paid order ratio (`unlock_success`, `pay_success`).
6. Sentry error rate tagged by `route`, `scale`, `release`.

## 5) Rollback Drill (Mandatory)
1. Run:
   - `bash scripts/rollback_smoke.sh`
2. Complete within 10 minutes:
   - rollback web to previous tag
   - validate `questions -> submit -> report`
3. Save drill record:
   - `docs/release/rollback-drill.md` execution log section

