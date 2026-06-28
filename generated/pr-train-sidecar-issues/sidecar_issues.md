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
