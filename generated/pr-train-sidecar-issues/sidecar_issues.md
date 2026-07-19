# PR Train Sidecar Issues

## MBTI FULL AUDIT 30: llms-full Degraded Runtime

- repo: fap-web
- PR id / branch: MBTI-FULL-AUDIT-30 / codex/mbti-full-audit-30-inventory-runtime-baseline
- blocker type: external_llms_full_runtime_degraded
- evidence: Read-only production fetch at 2026-07-13T03:26:39Z returned `llms-full.txt` with `Mode: degraded` and an empty Personality section. AUDIT-30 records `llms_full=false` for the fixed 52-URL Chinese MBTI inventory while canonical, robots, sitemap, `llms.txt`, and JSON-LD remain observable.
- why not current PR scope: AUDIT-30 is limited to read-only inventory evidence and cannot alter LLMS runtime generation, caches, deployment, or backend authority.
- whether required checks are affected: no
- whether merge is affected: no
- recommended follow-up: Open a dedicated fap-web llms-full authority/cache runtime repair PR, then re-run AUDIT-30 evidence before any MBTI-INDEX-43 release gate.
- observed at: 2026-07-13T03:26:39Z

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

## Branch-Agnostic MBTI-CMS-16 Scope Guard During SECURITY-123-WEB-06

- repo: fermatmind/fap-web
- PR id / branch: SECURITY-123-WEB-06 / codex/security-123-web-06
- blocker type: external branch-agnostic legacy scope guard
- evidence: GitHub contracts failed only because `tests/contracts/mbti-cms-16-profile-dry-run-approval-package.contract.test.ts` compared the complete `origin/main...HEAD` diff on WEB-06 and rejected the WEB-06 runtime and contract files. The focused WEB-06 contracts and all other contract tests passed.
- why not current PR scope: WEB-06 does not change CMS-16 runtime artifacts; the historical contract was incorrectly enforcing its own allowlist on every branch.
- whether required checks are affected: yes, the required contracts check failed on the historical guard.
- recommended follow-up: make the CMS-16 scope assertion branch-aware so it validates only `codex/mbti-cms-16-profile-dry-run-approval-package`; WEB-06 includes that governance-only fix and will rerun required contracts.
- detected at: 2026-07-10T19:05:00+08:00
- disposition: fixed in the current PR as governance scope hardening; rerun GitHub contracts before merge.

## External Contract Runner Timeout During SECURITY-123-WEB-06

- repo: fermatmind/fap-web
- PR id / branch: SECURITY-123-WEB-06 / codex/security-123-web-06
- blocker type: external local contract timeout
- evidence: the timeout-adjusted local runner with `--testTimeout=60000` passed the CMS-16 contract, WEB-06 focused contract, and all other relevant tests, but three pre-existing CMS-backed sitemap/personality cleanup tests exceeded 60 seconds on Node 20. The failure is unrelated to WEB-06 behavior.
- why not current PR scope: WEB-06 changes only personality CMS array normalization and governance contracts; changing sitemap cleanup implementations or the local runner timeout would expand beyond the declared security scope.
- whether required checks are affected: no; GitHub required checks run in Node24 and must be rerun after the CMS-16 branch-aware fix.
- recommended follow-up: use the repository Node 24 runtime or configure the local contract runner timeout consistently with CI for CMS-backed sitemap/personality cleanup contracts.
- detected at: 2026-07-10T19:07:00+08:00
- disposition: recorded as non-blocking local runtime debt; GitHub contracts rerun is required after the CMS-16 branch-aware fix.
## External Contract Runner Issues During SECURITY-123-WEB-07

- repo: fermatmind/fap-web
- PR id / branch: SECURITY-123-WEB-07 / codex/security-123-web-07
- blocker type: external branch-agnostic MBTI-CMS-23 scope guard and Node20 local timeout
- evidence: timeout-adjusted local contracts passed the WEB-07 focused asset-cache and Big Five noindex contracts. The local run was blocked only by the historical CMS-23 scope assertion and pre-existing CMS-backed career-guide, sitemap-indexability, personality-cleanup, and topics-cleanup tests exceeding 60 seconds.
- why not current PR scope: WEB-07 changes only the Big Five CMS asset cache policy and contracts.
- whether required checks are affected: no; GitHub contracts remains the merge gate.
- recommended follow-up: make CMS-23 scope branch-aware and use Node24 or a consistent contract timeout for local cleanup tests.
- detected at: 2026-07-10T19:28:00+08:00
- disposition: recorded as non-blocking external debt.

## GitHub Contracts Job Timeout During PERF-BASELINE-01

- repo: fermatmind/fap-web
- PR id / branch: PERF-BASELINE-01 / codex/perf-baseline-01
- blocker type: external_required_check_workflow_timeout
- evidence: PR #1703 required `contracts` reached the existing `.github/workflows/ci.yml` five-minute job timeout twice. Inspection of the first final log showed 177/177 test files and 922/922 tests passed before GitHub cancelled the job while `pnpm test:contract` wrote `generated/test-diagnostics/contract-shards.json`. Build, Big Five freeze, Enneagram freeze, and CodeQL passed.
- why not current PR scope: PERF-BASELINE-01 changes only performance governance documentation and PR-train metadata. It does not modify CI workflows, contract tests, the contract runner, runtime code, or generated diagnostics. Raising or restructuring the CI timeout requires a separate CI reliability PR.
- whether required checks are affected: yes; `contracts` is required and is not green, so PR #1703 cannot merge and the performance train cannot proceed.
- recommended follow-up: open a separate scoped CI reliability PR that gives the full contract runner sufficient headroom or shards it below the job limit, then rerun PR #1703 required checks.
- detected at: 2026-07-12T13:01:20+08:00
- disposition: blocking external required-check debt; stop the train without merging or starting CAREER-NEXTSTEP-01.
- resolution: CI budget repair #1704 and deterministic MBTI release-gate network isolation #1705 merged on 2026-07-12. PR #1703 was rebased onto both fixes; required checks must pass on the new head before merge.

## External Contract Runner Issues During SECURITY-123-WEB-09

- repo: fermatmind/fap-web
- PR id / branch: SECURITY-123-WEB-09 / codex/security-123-web-09
- blocker type: external branch-agnostic MBTI-CMS-23 scope guard and Node20 local timeout
- evidence: timeout-adjusted local contracts passed the WEB-09 focused facet-hub JSON-LD contracts. The local run was blocked only by the historical CMS-23 scope assertion, pre-existing career-guides, sitemap-indexability, topics-cleanup, and personality-cleanup timeouts, and an unrelated timing-sensitive MBTI checkout assertion.
- why not current PR scope: WEB-09 changes only the Big Five facet-hub JSON-LD boundary and contracts.
- whether required checks are affected: no; GitHub contracts remains the merge gate.
- recommended follow-up: make CMS-23 scope branch-aware and use Node24 or a consistent contract timeout locally; investigate the checkout timing test separately.
- detected at: 2026-07-10T20:24:00+08:00
- disposition: recorded as non-blocking external debt.
## External Contract Runner Issues During SECURITY-123-WEB-08

- repo: fermatmind/fap-web
- PR id / branch: SECURITY-123-WEB-08 / codex/security-123-web-08
- blocker type: external branch-agnostic MBTI-CMS-23 scope guard and Node20 local timeout
- evidence: timeout-adjusted local contracts passed the WEB-08 focused robots contracts and 1,006 tests. The local run was blocked only by the historical CMS-23 scope assertion, one pre-existing personality-cleanup sitemap timeout, and an unrelated timing-sensitive MBTI checkout assertion.
- why not current PR scope: WEB-08 changes only the Enneagram metadata boundary and contracts.
- whether required checks are affected: no; GitHub contracts remains the merge gate.
- recommended follow-up: make CMS-23 scope branch-aware and use Node24 or a consistent contract timeout locally; investigate the checkout timing test separately.
- detected at: 2026-07-10T19:53:00+08:00
- disposition: recorded as non-blocking external debt.

## MBTI-GSC-25 Production llms.txt Cohort Regression

- repo: fermatmind/fap-web
- PR id / branch: MBTI-GSC-25 / codex/mbti-gsc-25-submit-monitoring-execution
- blocker type: external production discoverability gate regression
- evidence: the required full contract and a direct read-only recheck returned `HOLD_NO_URL_EXPANSION`; CMS/API, canonical, robots, JSON-LD, FAQ parity, sitemap and llms-full were 9/9, but llms.txt was 0/9. The fetched llms.txt response was 158594 bytes and contained none of the exact cohort URLs.
- why not current PR scope: GSC-25 is restricted to submission evidence and monitoring artifacts. Repairing llms.txt runtime enumeration is explicitly out of scope.
- whether required checks are affected: yes; the complete contract suite fails on the live INDEX-24R contract, so the current PR cannot be created or merged.
- recommended follow-up: diagnose the production llms.txt personality authority fetch/cache path, restore stable 9/9 enumeration without fallback, deploy the scoped fix with exact-SHA authorization, rerun INDEX-24R twice, then resume GSC-25 local checks and create the monitoring automations.
- detected at: 2026-07-12T12:55:00+08:00
- disposition: resolved by deployed frontend SHA `f89d27f484859eb9c6790b803dd99b3a15781ed6` and two consecutive INDEX-24R runs with all metrics 9/9 and zero private URL leaks; GSC-25 local verification resumed without repeating external GSC actions.
- resolved at: 2026-07-13T02:00:00+08:00
- resolution evidence: read-only runs at 2026-07-12T17:55:39.381Z and 2026-07-12T17:57:33.613Z both returned `ALLOW_URL_EXPANSION`, including `LLMS=9/9` and `LLMS_FULL=9/9`.

## MBTI-PROFILE-SJ-33 External Career LLMS Contract Regression

- repo: fap-web
- PR id / branch: MBTI-PROFILE-SJ-33 / codex/mbti-profile-sj-33-content-assets
- blocker type: external_live_authority_contract_regression
- evidence: On 2026-07-13, the full contract runner failed only in `tests/contracts/career-llms-alignment.contract.test.ts`. A focused rerun reproduced a 15-second timeout for the `llms.txt` Career authority assertion and a separate `llms-full.txt` assertion where the live response had an empty Personality section and omitted the expected Big Five Openness URL.
- why not current PR scope: SJ-33 changes only a non-production SJ CMS-review content package, its generator, focused contract, and train metadata. It must not modify Career/Big Five authority enumeration, llms runtime behavior, caches, or public feeds.
- whether required checks are affected: no; the PR's GitHub required checks run independently in CI. The SJ focused contract, lint, typecheck, YAML/JSON parsing, and diff check are passing locally.
- whether merge is affected: no, unless the same failure reproduces in the required GitHub contracts check.
- recommended follow-up: Open a dedicated authority/cache runtime investigation for Career and Big Five `llms`/`llms-full` enumeration; do not change it in profile content-package PRs.
- observed at: 2026-07-13T07:03:53Z

## MBTI-INDEX-43 Draft Authority Promotion Blocker

- repo: fermatmind/fap-web
- PR id / branch: MBTI-INDEX-43 / codex/mbti-index-43-full-52-release-gate
- blocker type: separately controlled CMS public promotion and public readmodel state
- evidence: The first complete read-only 52-URL run returned `HOLD_MBTI_52_INCOMPLETE`: CMS/API authority 24/52, HTTP 200 52/52, canonical 52/52, robots 32/52, JSON-LD 32/52, FAQ parity 20/52, sitemap 52/52, llms 52/52, llms-full 52/52, API timeouts 0, and private URL leaks 0. Exactly 28 Profile APIs expose zero public FAQ blocks. Their approved repair records remain CMS draft revisions because MBTI-CMS-IMPORT-40 authorization explicitly prohibited public promotion. Twenty Profile HTML responses also remain fail-closed noindex shells.
- why not current PR scope: INDEX-43 is a read-only release gate. It cannot promote CMS drafts, mutate public revisions or indexability, clear production caches, change runtime code, deploy, or submit GSC.
- whether required checks are affected: yes; the manifest requires two complete identical 52/52 production runs, so local verification cannot pass and no INDEX-43 PR may be opened or merged.
- recommended follow-up: resolved; retain this entry as historical evidence and use the post-promotion INDEX-43 run artifacts as the release decision authority.
- detected at: 2026-07-14T16:17:52Z
- resolved at: 2026-07-15T09:07:10Z
- resolution evidence: the exact 43-record promotion completed on pinned backend SHA `65a1d3b78da70511306ebd2867a157494e4e217f` with the authorized source, promotion and authorization hashes and without GSC mutation. After frontend SWR convergence, two consecutive read-only INDEX-43 runs passed every 52/52 gate with zero API timeouts, zero private URL leaks and identical evidence signatures.
- disposition: resolved external authority promotion; INDEX-43 repository validation may continue.

## BIG5-EN52-104 Local Playwright Trace Lint Pollution

- repo: fermatmind/fap-web
- PR id / branch: BIG5-EN52-104-DISCOVERABILITY-CONVERGENCE-13 / codex/big5-en52-104-discoverability-convergence-13
- blocker type: external ignored local artifact lint pollution
- evidence: canonical Node 24 `pnpm lint` traversed pre-existing ignored `.playwright-cli/traces/resources/*.js` files and reported 1505 diagnostics, including 2 errors. Re-running the same ESLint configuration with only `.playwright-cli/**` excluded completed with 0 errors and the two known tracked generated-file warnings.
- why not current PR scope: the Playwright trace directory is local ignored browser evidence, was not created by this PR, and must not be moved, deleted, modified, ignored, or committed as part of Big Five discoverability convergence.
- whether required checks are affected: no; GitHub required checks use a clean checkout without the ignored local trace directory.
- recommended follow-up: clean or globally ignore the local trace directory only in a separately authorized workspace-maintenance task if desired; do not change repository lint policy in this PR.
- observed at: 2026-07-19T06:53:00Z
