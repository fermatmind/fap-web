# RIASEC Frontend Launch Hardening Runbook

This checklist verifies the frontend launch surface for RIASEC as one flagship scale with two public forms: `riasec_60` and `riasec_140`. It is limited to launch readiness and must not add product scope, local scoring, or frontend fallback content.

## Preconditions

- `main` contains the backend RIASEC contract/read-surface parity and baseline cleanup PRs.
- `main` contains the canonical RIASEC public IA and legacy local product surface removal PRs.
- The target API exposes `RIASEC` through `/api/v0.3/scales/lookup` and serves both public form question sets.
- Frontend content surfaces resolve through CMS/API authority; do not add frontend editorial fallback copy to satisfy this checklist.

## Local Verification

Run from the frontend repository:

```bash
git checkout main
git pull --ff-only origin main
git status --short

pnpm check:cms-api
pnpm verify:riasec-launch
pnpm vitest run \
  tests/contracts/riasec-public-ia.contract.test.ts \
  tests/contracts/test-detail-landing.contract.test.ts \
  tests/contracts/career-tests-single-entry.contract.test.tsx \
  tests/contracts/mbti-entry-wiring.contract.test.tsx \
  tests/contracts/mbti-share-consumer.contract.test.tsx
pnpm typecheck -- --pretty false
pnpm build
```

Use these environment variables when verifying a staging or canary host:

```bash
RIASEC_WEB_BASE_URL=https://staging.example.com \
RIASEC_API_BASE_URL=https://api-staging.example.com \
pnpm verify:riasec-launch
```

## Staging Smoke Matrix

- Catalog and detail: `/en/tests/holland-career-interest-test-riasec` and `/zh/tests/holland-career-interest-test-riasec` return 200 and expose both `riasec_60` and `riasec_140`.
- Take flow: `/en/tests/holland-career-interest-test-riasec/take?form=riasec_60` and `/en/tests/holland-career-interest-test-riasec/take?form=riasec_140` render without 5xx.
- Result/report: submit one staging attempt for each form and open the shared result/report route; confirm the RIASEC shell shows the form summary, top code, six dimension scores, retake, history, and share actions.
- History: `/en/history/riasec` renders from backend attempts for an authenticated test account and stays noindex.
- Share: create one share link from each form result and verify the public share page uses the RIASEC public projection with the canonical continue-test target.
- Discovery: `/sitemap.xml`, `/llms.txt`, and `/llms-full.txt` include the canonical RIASEC test path and do not expose the removed legacy career RIASEC route or local storage source.
- Regression: MBTI, Big Five, and Enneagram detail/take/result surfaces still pass the targeted contract checks listed above.

## Release Steps

1. Run `pnpm check:cms-api` against the production API before building the frontend release.
2. Run `pnpm verify:riasec-launch` against the target frontend/API pair after deploy.
3. Run the existing public web health check:

   ```bash
   bash scripts/healthcheck_web.sh
   ```

4. Confirm the production sitemap and llms artifacts expose the canonical RIASEC path after cache/CDN propagation.

## Rollback Notes

- Prefer rolling back to the previous frontend release artifact or PM2 release if the canonical detail/take/result/history/share path returns 5xx.
- Do not restore the removed legacy career RIASEC route or local storage source as a rollback workaround.
- If backend RIASEC contracts are unavailable, roll back or repair the backend authority first; frontend consumers must not infer forms or report data locally.
- After rollback, rerun `pnpm verify:riasec-launch` against the active frontend/API pair and record the failing check before retrying the release.
