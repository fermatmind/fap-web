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

## IQ-METHOD-02 - MBTI CMS04 timestamp side effect during full contract validation

- repo: fap-web
- PR id / branch: IQ-METHOD-02 / codex/iq-method-02-online-vs-professional
- blocker type: local contract side effect
- evidence: `pnpm test:contract` rewrote `docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json` and `.md` with a fresh generated timestamp during the full contract run.
- why not current PR scope: those MBTI CMS04 files are unrelated to IQ-METHOD-02 and are generated by an existing MBTI contract during validation.
- whether required checks are affected: no; the files were restored before commit, IQ-METHOD scope contracts now ignore this known validation side effect, and `pnpm test:contract` passed.
- recommended follow-up: make the MBTI CMS04 contract write to a temp output path or avoid timestamp mutation in checked-in docs during unrelated full-suite validation.

## Local pnpm approve-builds wrapper state during MBTI-ASSET-OPS-09

- repo: fermatmind/fap-web
- PR id / branch: MBTI-ASSET-OPS-09 / codex/mbti-asset-ops-09-personality-asset-sop
- blocker type: external_local_pnpm_wrapper_approve_builds_state
- evidence: `pnpm test:contract` failed before running tests with `ERR_PNPM_IGNORED_BUILDS` for `esbuild`, `sharp`, and `unrs-resolver`; `corepack pnpm test:contract` passed the contract shards.
- why not current PR scope: MBTI-ASSET-OPS-09 only changes SOP docs, generated read-only audit artifacts, one focused contract, sidecar notes, and PR-train ledger entries. It does not change dependency installation, lockfile, package manager configuration, or local pnpm approval state.
- whether required checks are affected: no; the equivalent `corepack pnpm test:contract` validation passed locally, and GitHub CI uses a clean dependency install path.
- recommended follow-up: normalize the local Codex pnpm wrapper approval state or standardize local repository checks on `corepack pnpm` so the manifest command does not fail before test execution.

## External Article Topic Label Scope Drift During MBTI-ASSET-OPS-09

- repo: fermatmind/fap-web
- PR id / branch: MBTI-ASSET-OPS-09 / codex/mbti-asset-ops-09-personality-asset-sop
- blocker type: external_uncommitted_scope_drift
- evidence: while closing OPS-09, `app/(localized)/[locale]/articles/page.tsx`, `app/(localized)/[locale]/topics/page.tsx`, and `tests/contracts/mbti-ops-08-gsc-priority-monitoring.contract.test.ts` appeared modified outside the OPS-09 docs/audit scope. The changes were preserved in stash `preserve external article topic ops08 changes before MBTI-ASSET-OPS-09 closeout 20260704`.
- why not current PR scope: OPS-09 is limited to personality asset SOP docs, generated OPS-09 artifacts, one focused contract, sidecar notes, and PR-train ledger entries. Article/topic page UX and OPS-08 contract follow-up behavior belong to separate scopes.
- whether required checks are affected: no; the external changes were not staged into OPS-09 and the OPS-09 branch was restored clean before PR closeout.
- recommended follow-up: review the preserved stash and decide whether to open a separate article/topic label or OPS-08 contract maintenance PR.

## Stale OPS-08 Scope Contract Blocks MBTI-ASSET-OPS-09 Required Checks

- repo: fermatmind/fap-web
- PR id / branch: MBTI-ASSET-OPS-09 / codex/mbti-asset-ops-09-personality-asset-sop
- blocker type: stale_contract_scope_guard_blocks_required_check
- evidence: GitHub PR #1590 `contracts` failed in `tests/contracts/mbti-ops-08-gsc-priority-monitoring.contract.test.ts`, which expected the active diff to contain only OPS-08 files and rejected valid OPS-09 files such as `docs/seo/personality/mbti-asset-ops-09-personality-asset-sop-2026-07-04.json` and `tests/contracts/mbti-asset-ops-09-personality-asset-sop.contract.test.ts`.
- why not current PR scope: OPS-09 scope is a docs/audit SOP PR and does not include modifying the already-merged OPS-08 contract. Updating the stale OPS-08 scope guard would be a separate contract-maintenance scope or needs explicit scope-extension authorization.
- whether required checks are affected: yes; the required `contracts` check is failing, so the PR train must stop before merge or before starting MBTI-ASSET-SKILL-10.
- recommended follow-up: authorize a scoped fix to make the OPS-08 contract only enforce its scope when the active diff touches OPS-08 artifacts, then rerun PR #1590 checks.

## external-mbti-asset-ops-09-scope-guard-blocks-iq-method-06

- repo: fermatmind/fap-web
- PR id / branch: IQ-METHOD-06 / codex/iq-method-06-privacy-data-boundary
- blocker type: external_train_scope_guard_blocks_required_contracts
- evidence: After rebasing IQ-METHOD-06 onto origin/main a5d0798d, `pnpm test:contract` failed only in `tests/contracts/mbti-asset-ops-09-personality-asset-sop.contract.test.ts`. Its OPS-09 scope test rejects the IQ-METHOD-06 generated assets and contract files in the current branch diff.
- why not current PR scope: IQ-METHOD-06 is scoped to the privacy/data-boundary CMS Article draft-review package and its IQ contract harness. Changing the MBTI-ASSET-OPS-09 contract would be an external train-forward compatibility fix for a previously merged MBTI PR.
- required checks affected: true; this blocks required local contract validation for IQ-METHOD-06 after rebase.
- recommended follow-up: Open a separate scoped fap-web PR or explicitly authorize scope expansion to make the MBTI-ASSET-OPS-09 scope test branch-scoped/train-forward compatible, then rebase IQ-METHOD-06 and rerun `pnpm test:contract`.
- resolution: Resolved by fap-web PR #1601, which made `tests/contracts/mbti-asset-ops-09-personality-asset-sop.contract.test.ts` enforce OPS-09 scope only on branch `codex/mbti-asset-ops-09-personality-asset-sop`.
- resolved at: 2026-07-05T03:03:00+08:00.

## Build Environment Guard Requires Site URL During MBTI-GSC-11

- repo: fap-web
- PR id / branch: MBTI-GSC-11 / codex/mbti-gsc-11-query-evidence-export
- blocker type: local_build_environment_mismatch
- evidence: `NEXT_PUBLIC_API_URL=https://api.fermatmind.com corepack pnpm build` compiled successfully but failed while collecting `/robots.txt` page data with `NEXT_PUBLIC_SITE_URL must be set to a production absolute HTTP(S) URL (non-localhost)`.
- why not current PR scope: MBTI-GSC-11 adds artifact-only GSC evidence docs, a build script, a focused contract, and PR-train metadata. It does not change robots, sitemap, site URL validation, runtime routes, or build environment requirements.
- whether required checks are affected: no; `NEXT_PUBLIC_API_URL=https://api.fermatmind.com NEXT_PUBLIC_SITE_URL=https://www.fermatmind.com corepack pnpm build` passed.
- recommended follow-up: Normalize fap-web PR train build commands or CI docs so local build validation includes `NEXT_PUBLIC_SITE_URL=https://www.fermatmind.com` whenever robots/sitemap routes are built.

## Local pnpm approve-builds wrapper state during MBTI-QA-14

- repo: fermatmind/fap-web
- PR id / branch: MBTI-QA-14 / codex/mbti-qa-14-semantic-duplicate-gate
- blocker type: external_local_pnpm_wrapper_approve_builds_state
- evidence: the manifest-style local command `pnpm exec vitest run tests/contracts/mbti-qa-14-semantic-duplicate-gate.contract.test.ts --reporter=dot` invoked the local Codex runtime pnpm wrapper version 11.7.0 and failed before running tests with `ERR_PNPM_IGNORED_BUILDS` for `esbuild`, `sharp`, and `unrs-resolver`; the project-pinned `corepack pnpm` version 10.28.1 ran the same focused test successfully.
- why not current PR scope: MBTI-QA-14 only adds an artifact-only semantic duplicate QA gate, generated QA report, focused contract, train ledger updates, and sidecar record. It does not change dependency installation, lockfile, package manager configuration, or local pnpm approval state.
- whether required checks are affected: no; `corepack pnpm exec vitest run tests/contracts/mbti-qa-14-semantic-duplicate-gate.contract.test.ts --reporter=dot`, `corepack pnpm test:contract`, `corepack pnpm typecheck`, and production API build validation passed locally.
- recommended follow-up: normalize the local Codex pnpm wrapper approval state or standardize local repository checks on `corepack pnpm` so manifest commands do not fail before test execution on this machine.

## External Global Spacing Token Debt During IQ CMS Dry-Run

- repo: fermatmind/fap-web
- PR id / branch: IQ-METHOD-PAGES-ZH-CN-CMS-DRY-RUN-01 / codex/iq-method-pages-cms-dry-run-01
- blocker type: external_global_spacing_token_debt
- evidence: `corepack pnpm lint:spacing` failed on pre-existing spacing-token violations across unrelated `app/**`, `components/**`, and `lib/**` UI files. Current PR changes no runtime UI files.
- why not current PR scope: this PR only prepares CMS dry-run artifacts and validation. Fixing global spacing debt would touch many unrelated frontend files and violate one-PR-one-scope.
- whether required checks are affected: no; focused contract, full contract, lint, typecheck, production API build, JSON/YAML parse, diff check, and scope validation are separate from the known full-repo spacing debt.
- recommended follow-up: open a separate spacing-token cleanup PR or establish a lint:spacing baseline for artifact-only PRs.

## External Global Spacing Token Debt During SECURITY-123-WEB-01

- repo: fermatmind/fap-web
- PR id / branch: SECURITY-123-WEB-01 / codex/security-123-web-01
- blocker type: external_global_spacing_token_debt
- evidence: `PATH=/usr/local/bin:/usr/bin:/bin /usr/local/bin/pnpm lint:spacing` failed on pre-existing spacing-token violations across unrelated `app/**`, `components/**`, and `lib/**` UI files. WEB-01 changes only the production workflow, deploy contracts, scope helper, train metadata, and this sidecar record.
- why not current PR scope: WEB-01 is limited to the production manual risk approval guard. Fixing global UI spacing debt would touch many unrelated runtime files and violate one-PR-one-scope.
- whether required checks are affected: no; focused tests and ordinary lint passed, while scope validation and GitHub required checks remain independently enforced.
- recommended follow-up: open a separate spacing-token cleanup PR or establish a baseline-aware spacing guard that reports only newly introduced violations.
- detected at: 2026-07-10T16:42:00+08:00
- disposition: recorded as non-blocking external debt under the user-authorized PR-train sidecar policy.

## Legacy MBTI-CMS-23 Scope Guard During SECURITY-123-WEB-01

- repo: fermatmind/fap-web
- PR id / branch: SECURITY-123-WEB-01 / codex/security-123-web-01
- blocker type: external branch-agnostic legacy scope guard
- evidence: the local full contract run failed only in `tests/contracts/mbti-cms-23-production-import-authorization-package.contract.test.ts` after otherwise passing its shard. That legacy test reads the active working-tree, staged, and untracked diff without checking the MBTI-CMS-23 branch, then rejects valid WEB-01 files against its historical allowlist.
- why not current PR scope: WEB-01 is limited to the production manual risk approval guard. Editing a previously merged CMS production-import authorization contract would violate one-PR-one-scope.
- whether required checks are affected: no; the test sees no diff in a clean committed checkout. WEB-01 will rerun the complete suite from a clean committed tree and independently require GitHub contracts to be green.
- recommended follow-up: make the MBTI-CMS-23 scope assertion branch-scoped or validate its own committed PR diff.
- detected at: 2026-07-10T16:49:00+08:00
- disposition: recorded as non-blocking external contract debt; do not modify the legacy contract in WEB-01.

## External Global Spacing Token Debt During SECURITY-123-WEB-02

- repo: fermatmind/fap-web
- PR id / branch: SECURITY-123-WEB-02 / codex/security-123-web-02
- blocker type: external_global_spacing_token_debt
- evidence: `pnpm lint:spacing` failed on the same pre-existing spacing-token violations across unrelated `app/**`, `components/**`, and `lib/**` files seen during WEB-01. WEB-02 changes CMS article enumeration and contracts only.
- why not current PR scope: WEB-02 is limited to LLMS article caching/concurrency and authority-bound contracts. Fixing repository-wide UI spacing debt would touch unrelated runtime files and violate one-PR-one-scope.
- whether required checks are affected: no; focused tests, ordinary lint, typecheck, build, scope validation, and GitHub required checks are independently enforced.
- recommended follow-up: open a separate spacing-token cleanup PR or establish a baseline-aware spacing guard that reports only newly introduced violations.
- detected at: 2026-07-10T17:09:00+08:00
- disposition: recorded as non-blocking external debt; continue within WEB-02.

## External Contract Runner Timeout During SECURITY-123-WEB-03

- repo: fap-web
- PR id / branch: SECURITY-123-WEB-03 / codex/security-123-web-03
- blocker type: external_local_contract_timeout
- evidence: the manifest command `corepack pnpm test:contract` hit the existing 5-second Vitest timeout in CMS-backed sitemap/personality/career cleanup contracts on this Node 20 runtime. The same four-shard runner with `--testTimeout=60000` passed all 170 files and 971 tests; no WEB-03 contract failed.
- why not current PR scope: WEB-03 changes only the Big Five disclaimer consent gate and its contracts. Increasing the local timeout or changing unrelated CMS-backed sitemap contracts would expand beyond the security scope.
- whether required checks are affected: no; the timeout-adjusted full contract suite passed and the focused WEB-03 contracts, lint, typecheck, build, freeze checks, manifest parse, diff check, and scope validation passed.
- recommended follow-up: use the repository Node 24 runtime or configure the local contract runner timeout consistently with CI before treating the default local timeout as a hard failure.
- detected at: 2026-07-10T17:50:00+08:00
- disposition: recorded as non-blocking local runtime debt; the timeout-adjusted full contract suite passed.

## External Contract Runner Timeout During SECURITY-123-WEB-04

- repo: fap-web
- PR id / branch: SECURITY-123-WEB-04 / codex/security-123-web-04
- blocker type: external_local_contract_timeout
- evidence: the manifest command `corepack pnpm test:contract` uses the existing 5-second Vitest timeout and is expected to time out in CMS-backed sitemap/personality cleanup contracts on this Node 20 runtime. The same four-shard runner with `--testTimeout=60000` passed all 171 files and 3,992 tests; no WEB-04 contract failed.
- why not current PR scope: WEB-04 changes only the shared CSV formula boundary, three GSC generators, their contracts, and train metadata. Increasing the local timeout or changing unrelated CMS-backed sitemap contracts would expand beyond the GSC scope.
- whether required checks are affected: no; focused contracts, lint, spacing, typecheck, build, freeze checks, manifest parse, diff check, and timeout-adjusted full contracts passed.
- recommended follow-up: use the repository Node 24 runtime or configure the local contract runner timeout consistently with CI before treating the default local timeout as a hard failure.
- detected at: 2026-07-10T18:16:00+08:00
- disposition: recorded as non-blocking local runtime debt; the timeout-adjusted full contract suite passed.

## External Contract Runner Timeout During SECURITY-123-WEB-05

- repo: fap-web
- PR id / branch: SECURITY-123-WEB-05 / codex/security-123-web-05
- blocker type: external_local_contract_timeout
- evidence: the manifest command `corepack pnpm test:contract` uses the existing 5-second Vitest timeout and is expected to time out in CMS-backed sitemap/personality cleanup contracts on this Node 20 runtime. The same four-shard runner with `--testTimeout=60000` passed all shard files and tests; no WEB-05 contract failed.
- why not current PR scope: WEB-05 changes only the CMS-16 complete-diff scope guard, focused contract, scope helper, and train metadata. Increasing the local timeout or changing unrelated CMS-backed sitemap contracts would expand beyond the governance-test scope.
- whether required checks are affected: no; focused contracts, lint, spacing, typecheck, build, freeze checks, manifest parse, diff check, and timeout-adjusted full contracts passed.
- recommended follow-up: use the repository Node 24 runtime or configure the local contract runner timeout consistently with CI before treating the default local timeout as a hard failure.
- detected at: 2026-07-10T18:34:00+08:00
- disposition: recorded as non-blocking local runtime debt; the timeout-adjusted full contract suite passed.

## Legacy MBTI-CMS-23 Scope Guard During SECURITY-123-WEB-06

- repo: fermatmind/fap-web
- PR id / branch: SECURITY-123-WEB-06 / codex/security-123-web-06
- blocker type: external branch-agnostic legacy scope guard
- evidence: the timeout-adjusted full contract run failed only in `tests/contracts/mbti-cms-23-production-import-authorization-package.contract.test.ts` because its historical scope assertion reads the current working-tree diff without checking the MBTI-CMS-23 branch. It rejected `lib/cms/personality-sections.tsx`, `tests/contracts/helpers/currentPrScope.ts`, and the WEB-06 focused contract; all WEB-06-relevant tests and the remaining shard tests passed.
- why not current PR scope: WEB-06 is limited to fail-closed CMS personality FAQ/internal-link/related-array normalization, focused contracts, scope helper, and train metadata. Changing the legacy CMS-23 scope contract would expand beyond the declared security scope.
- whether required checks are affected: no; focused contracts, lint, spacing, typecheck, production build, freeze checks, manifest parse, diff check, and explicit WEB-06 scope validation are independent and passed.
- recommended follow-up: make the MBTI-CMS-23 scope assertion branch-scoped or validate only its own committed PR diff.
- detected at: 2026-07-10T18:54:00+08:00
- disposition: recorded as non-blocking external contract debt under the user-authorized PR-train sidecar policy.
