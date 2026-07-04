# PR Train Sidecar Issues

## BIG5 Result Page Recovery Banner Renderer Copy

- repo: fap-web
- PR id / branch: BIG5-RESULT-PAGE-RENDERER-HYGIENE-FOLLOWUP-01 / codex/big5-result-page-renderer-hygiene-followup-01
- blocker type: out_of_scope_renderer_shell_copy
- evidence: live zh Big Five result page showed the result recovery banner eyebrow `结果找回` and helper text `这不会阻塞当前免费结果预览。保存后，我们会把访问链接发送到你的邮箱，方便换设备或稍后继续查看。`; local search maps this to `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx`.
- why not current PR scope: PR14 scope is limited to `lib/big5/**`, `components/big5/**`, `components/result/big5/**`, and Big Five contracts; changing the generic result client recovery banner would affect non-Big-Five result pages and requires a separate result-shell UX scope.
- whether required checks are affected: no; current Big Five renderer hygiene checks can pass without changing the generic recovery banner.
- recommended follow-up: open a scoped fap-web PR for result recovery banner UX, with assertions covering Big Five and non-Big-Five result pages.

## Stale PR-WEB-HOTFIX-761A Ledger Status

- repo: fap-web
- PR id / branch: MBTI-SEO-01 / codex/mbti-seo-01-hub-seo-geo-refresh
- blocker type: stale_ledger_status
- evidence: `gh pr view 762` reports PR #762 as `MERGED` with merge commit `3a08d486a3645292bbb3f9ac5b072ba8458a47dd`, while `docs/codex/pr-train-state.json` still has the old PR-WEB-HOTFIX-761A array entry as `open`.
- why not current PR scope: this stale state predates the MBTI SEO/GEO train and belongs to an unrelated career hotfix PR; MBTI-SEO-01 does not depend on it.
- whether required checks are affected: no; GitHub currently has no open PRs and this stale ledger entry does not affect MBTI-SEO-01 local checks, required GitHub checks, or scope validation.
- recommended follow-up: reconcile PR-WEB-HOTFIX-761A ledger facts in a future housekeeping PR if needed.

## External CSP Local Development Scope Drift

- Repo: fermatmind/fap-web
- PR id / branch: MBTI-SEO-01 / codex/mbti-seo-01-hub-seo-geo-refresh
- Blocker type: external_uncommitted_scope_drift
- Evidence: During MBTI-SEO-01 validation, next.config.mjs and tests/contracts/security-headers.contract.test.ts appeared modified with a loopback HTTP API CSP development allowance. These files are outside the MBTI Hub SEO scope and were not touched by the MBTI-SEO-01 implementation.
- Why not current PR scope: MBTI-SEO-01 only changes /zh/personality hub SEO/rendering, hub FAQ/schema tests, PR-train metadata, and sidecar files. CSP/security-header behavior belongs to a separate security/local-development PR.
- Required checks affected: false
- Recommended follow-up: Review the preserved stash named preserve external CSP local dev change before deciding whether to open a separate scoped PR for local API CSP support.

## External Result Processing Gate Scope Drift

- repo: fermatmind/fap-web
- PR id / branch: MBTI-CMS-06 / codex/mbti-cms-06-comparison-content-assets
- blocker type: external_uncommitted_scope_drift
- evidence: After MBTI-CMS-06 local checks passed, `app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx` appeared modified with a result processing wait gate and message changes. This file is outside the MBTI-CMS-06 content asset package scope and was preserved in stash `preserve external result processing gate change before MBTI-CMS-06 push 20260704`.
- why not current PR scope: MBTI-CMS-06 only packages CMS handoff assets for A/T and hot comparison pages under `docs/seo/personality/**`, plus its generator and contract test. Generic result-page runtime UX belongs to a separate result-shell PR.
- whether required checks are affected: no; PR6 local checks, scope validation, and merge policy do not require this result-page runtime change.
- recommended follow-up: Review the preserved stash and open a separate scoped result-page UX PR if the minimum processing wait gate should ship.

## Local pnpm approve-builds wrapper state

- repo: fermatmind/fap-web
- PR id / branch: MBTI-OPS-08 / codex/mbti-ops-08-gsc-priority-monitoring
- blocker type: external_local_pnpm_wrapper_approve_builds_state
- evidence: `pnpm test:contract` failed before running tests with `ERR_PNPM_IGNORED_BUILDS` for `esbuild`, `sharp`, and `unrs-resolver`; `corepack pnpm test:contract` passed all contract shards.
- why not current PR scope: OPS-08 is a read-only monitoring artifact PR and does not change dependency installation, lockfile, or local pnpm approval state.
- whether required checks are affected: no; GitHub CI and `corepack pnpm` local validation are not blocked by this local wrapper state.
- recommended follow-up: normalize local Codex pnpm wrapper approval state or standardize local checks on `corepack pnpm` for this repository.
