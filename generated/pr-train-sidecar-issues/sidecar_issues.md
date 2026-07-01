# PR Train Sidecar Issues

## 2026-06-28 - MBTI64 artifact-only scope test blocked unrelated EQ contract run

- repo: fap-web
- PR id / branch: PR-EQ-V20-05 / codex/pr-eq-v20-05-frontend-v23-consumption
- blocker type: unrelated contract scope guard
- evidence: `pnpm test:contract` failed in `tests/contracts/mbti64-remaining-58-competitor-gap-qa-v2-01.contract.test.ts` because the test read the current EQ diff and required every changed file to be inside the MBTI64 QA artifact-only allowlist.
- why not current PR scope: the failing test belongs to a prior MBTI64 artifact QA task and was not validating EQ result rendering, EQ fixtures, or EQ v2.3 payload consumption.
- required checks affected: yes, because `pnpm test:contract` is a required local check for PR-EQ-V20-05.
- handling: added a narrow branch guard so the MBTI64 artifact-only changed-file assertion runs only on its own `codex/mbti64-remaining-58-competitor-gap-qa-v2-01` branch.
- recommended follow-up: consider centralizing changed-file scope guards in `tests/contracts/helpers/currentPrScope.ts` so artifact-only tests do not block unrelated PR trains.

## 2026-06-30 - SECURITY-103-WEB-01 full contract run hit unrelated career shortlist async flake

- repo: fap-web
- PR id / branch: SECURITY-103-WEB-01 / codex/security-103-web-01
- blocker type: unrelated flaky contract timing
- evidence: `pnpm test:contract` failed once in `tests/contracts/career-shortlist-consent.contract.test.tsx` because `loads shortlist state and tracks the persisted action after analytics consent` found the button still rendered as disabled `Loading...` instead of `Add to shortlist`. A scoped rerun with `pnpm exec vitest run tests/contracts/career-shortlist-consent.contract.test.tsx` passed all 4 tests immediately afterward.
- why not current PR scope: SECURITY-103-WEB-01 changes only deploy workflows, train metadata, scope validation helpers, and deploy workflow contracts; it does not touch career shortlist components, analytics consent, or the failing contract file.
- required checks affected: transiently yes for the local `pnpm test:contract` run; the focused rerun passed, and this issue is outside the WEB-01 changed-file scope.
- handling: recorded as sidecar and rerunning the full contract suite before commit so the current PR still has a passing required local contract result.
- recommended follow-up: stabilize `tests/contracts/career-shortlist-consent.contract.test.tsx` by waiting for the loaded button state after analytics consent instead of synchronously querying immediately after render.
