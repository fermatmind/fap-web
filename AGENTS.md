# AGENTS.md — fap-web Repository + Codex Working Contract (MUST FOLLOW)

> This file is binding for any agent or Codex work in this repository and implements the Solo-Owner Engineering Operating Model.

## Trunk-based zero-touch delivery

- Start ordinary work in a clean isolated worktree created from the latest `origin/main`; never edit, clean, switch, or reuse the operator's existing workspace or uncommitted files.
- Deliver one small, demonstrable, reversible loop at a time. Run focused validation, commit intentionally, and publish with `git push origin HEAD:main`.
- Do not create an ordinary branch, pull request, approval phrase, operation-specific workflow, or sidecar. Do not wait for review, merge, or a chat authorization during ordinary delivery.
- If a concurrent main update rejects the push, fetch and rebase onto the new `origin/main`, rerun the affected checks, and push again. Force-push and non-fast-forward updates are forbidden.
- Follow the pushed exact SHA through `ci.yml` and `deploy.yml`. A commit is complete only when its applicable exact-SHA CI receipt and deployment outcome are known.
- A failed SHA stays out of production. Diagnose it and publish a new corrective commit; do not rerun or mutate the failed SHA in place.
- The repository has four permanent workflow entrypoints: `ci.yml`, `deploy.yml`, `nightly.yml`, and `recovery.yml`. `recovery.yml` is the only manual entrypoint.
- New delivery behavior must extend the path classifier and the existing four-workflow control plane. Task-specific or manual delivery workflows are prohibited.
- Main protection must continue to prohibit deletion and non-fast-forward updates. Ordinary push admission is not a deployment verdict; exact-SHA CI, staging, production activation, and smoke evidence decide production eligibility.
- Record push, CI, staging, production, and smoke timing when those phases apply so solo-owner lead time remains observable.
- Historical branch, PR-train, required-check, approval, and retired workflow records are ignored for ordinary work unless the task explicitly asks for historical audit.

## Solo-owner maximum efficiency

- FermatMind is developed and operated by one person. Choose the shortest safe end-to-end path and minimize branches, approvals, handoffs, duplicate artifacts, repeated validation, waiting, and operator interruptions.
- Combine steps that form one coherent, reversible, in-scope loop. Do not expand a small task into platform work, broad architecture, a general control plane, or adjacent cleanup.
- Preserve security, production data, secrets, permissions, destructive-operation, content-authority, discoverability, ingress, and recovery boundaries. These boundaries constrain only the risky action.
- Begin by reading applicable rules, real callers, existing implementation, and the minimum acceptance condition, then execute. Prefer focused tests, lint, typecheck, build or contract checks, classifier checks, and `git diff --check`; complete heavy suites belong to `nightly.yml` unless a genuinely affected high-risk boundary requires them.

### Validated-tree fast delivery

- Create the isolated worktree on a named `codex/` task branch from the latest `origin/main`; do not perform implementation work on a detached HEAD. Ordinary publication still uses `git push origin HEAD:main`.
- After focused validation and path-limited staging, record `git write-tree` and the successful commands in the active task context. Do not create a repository receipt, ledger, manifest, or other persistent validation artifact.
- Reuse successful checks when the staged tree SHA is unchanged. Before commit, verify the scoped worktree has no unstaged delta; after commit, verify `HEAD^{tree}` equals the validated tree SHA.
- Fetch and rebase before final validation and commit. If `origin/main` advances afterward, compare its changed paths with the declared task paths and rerun only affected checks; dependency locks, TypeScript or Next.js configuration, and other repository-wide build inputs count as intersecting changes. Always repeat status, scope, and `git diff --check` gates.
- Use the pull-request fast path only when the user explicitly asks for a pull request; otherwise keep the direct-push trunk flow. Targets are 1–2 minutes from an unchanged validated tree to PR creation and 30–60 seconds from confirmed merge to local cleanup; these are operating targets, not safety-gate timeouts.

## Delivery risk lanes

- **Fast lane:** documentation, rules, tests-only, dependency updates, and small low-risk fixes. Run focused CI. Documentation/rules/tests-only commits must produce a deploy-skip receipt and must not enter staging or production.
- **Product lane:** application/UI behavior and non-controlled public surfaces. Deliver one end-to-end loop; require classifier-selected focused tests, lint/typecheck, build, and contract checks before automatic staging and production.
- **Controlled lane:** content adapter/contract, ingress/runtime configuration, deployment infrastructure, security, permissions, and discoverability. Add the classifier-selected fail-closed checks and receipts to the same commit flow. Do not spread those controls to unrelated paths.

## Working contract

### Scope discipline

- Advance exactly one demonstrable loop per commit and keep unrelated files out of the diff.
- Reuse the existing design system, route conventions, API adapters, and contract fixtures. Do not pre-build future scope or add process-only artifacts.
- Rules-only, documentation-only, generated-contract-only, and read-only work must not fabricate runtime steps.

### Goal execution authorization

- FermatMind is a solo-developed project. At all times, treat a concrete end-to-end execution goal as continuous authorization for safe, reversible, in-scope work. This authorization does not depend on time of day or unattended execution.
- Continue through isolated worktree creation, scoped edits, focused checks, commit, direct push, exact-SHA CI/deploy tracking, same-scope corrective commits, and cleanup without returning ordinary coordination to the operator.
- Stop only when scope or authority is materially ambiguous, user changes cannot be isolated, external permission is unavailable, or the task requires a separately controlled destructive action, secret/permission change, production data mutation, discoverability write outside the automatic lane, or manual recovery.
- Infrastructure or product failures proven unrelated to the current scope are evidence to report, not authorization to create an adjacent repair.

### Verification and reporting

- Run focused unit or contract tests for changed behavior, lint/typecheck for touched sources, a production build when application/UI or runtime configuration changes, classifier/workflow contract checks when delivery rules change, and `git diff --check`.
- Validate API adapters and public contract fixtures when their boundary changes. Validate ingress configuration through the classifier-selected dry check and `deploy.yml` staging path, never through an ad-hoc command lane.
- Before commit and push, verify the diff contains only the declared scope. After push, bind all status checks and receipts to the exact commit SHA.
- When files change, report Added and Modified paths separately and list only checks actually run. State when runtime commands are not applicable.

## Exact-SHA CI and deployment contract

- `ci.yml` handles only `main` pushes. It classifies the exact `github.event.before` to `github.sha` range, refuses an indeterminate or non-forward baseline, runs the union of checks for mixed scopes, and emits an immutable exact-SHA receipt.
- `deploy.yml` consumes only a successful CI result for the same SHA. It serializes staging, staging smoke, production activation, and production smoke without allowing a newer commit to overtake an activating release.
- Documentation/rules/tests-only commits stop after a successful deploy-skip receipt. They do not deploy application code.
- Staging failure leaves production unchanged. Pre-activation failure leaves the current release active. Post-activation smoke failure atomically restores the previous healthy release and process state.
- Production always follows the latest successfully verified and accepted SHA, not necessarily the newest commit on `main`.
- Content adapter/contract changes must prove backend compatibility, locale behavior, identifier stability, and public rendering semantics before deployment.
- Ingress/runtime configuration and deployment infrastructure changes require workflow contracts, action/static validation, deployment dry validation, and same-SHA staging acceptance.
- `nightly.yml` owns complete heavy tests, security scans, full content consistency, dependency, and performance checks. Its failure provides diagnostics but does not roll back or block a healthy production release.

## Production ingress authority

- Public ingress mutation is part of `deploy.yml`, after classifier selection and successful same-SHA staging validation. There is no independent ingress workflow or ordinary manual dispatch.
- The ingress job may apply only the repository-defined candidate for the exact deployed SHA, verify syntax and bounded public behavior, and retain atomic rollback to the previous healthy configuration.
- It must fail closed on candidate drift, private-routing leakage, ambiguous active state, or a public smoke mismatch. A failed ingress activation restores the previous healthy ingress before the release can be accepted.
- Ingress credentials and routing values remain Environment-scoped, masked, least-privilege, and absent from receipts and logs.

## Recovery only

- `recovery.yml` is reserved for a real production incident after automatic LKG restoration has failed. It may switch to LKG, restore an exact known SHA, or run the minimum necessary diagnosis.
- Recovery credentials live only in the recovery Environment. Ordinary CI and deployment must not use them.
- Recovery is not a daily release, ingress update, content, SEO, cache-refresh, verification, or retry path. Never use it to bypass an exact-SHA failure.

## Repository context

- The application is the FermatMind web frontend. Keep routes, application/UI components, content adapters, runtime configuration, tests, and deployment assets within their existing module boundaries.
- Preserve repository formatting, TypeScript strictness, locale conventions, accessible interaction, and responsive behavior in touched code.
- Commit messages use `type(scope): summary`.

## Product and content authority boundaries

### Backend and frontend truth

- The backend API/database is authoritative for runtime product data. Frontend fixtures, adapters, static assets, and caches are projections or compatibility evidence, not an independent publication authority.
- Never invent fallback product truth when the authoritative response is unavailable. Explicit loading, empty, unavailable, and error states must remain distinguishable.
- Public identifiers, slugs, locale keys, canonical URLs, analytics identities, and backend contract fields must remain stable unless the task explicitly changes that authority and its compatibility path.

### Content adapter and locale contracts

- Content adapters must normalize only documented backend variants, preserve unknown-state safety, and fail visibly or closed when required identity is missing.
- zh-CN and en public surfaces must preserve canonical/hreflang/robots/sitemap consistency. Body-only copy changes do not authorize URL inventory or Search submission changes.
- Historical aliases are redirect-only. They must never become canonical identifiers, sitemap entries, alternate-link targets, or newly emitted application links.
- Static fallback content, if explicitly retained for resilience, must expose its provenance and must not outrank a valid authoritative response.

### English parity and content packages

- English parity work must be bound to an exact content/package identity and exact backend contract evidence. Validate locale completeness, stable identifiers, cross-locale links, canonical/hreflang pairs, robots, sitemap membership, and public rendering for the changed pages.
- Mixed content changes run the union of applicable contract checks. Missing or stale evidence fails the candidate SHA; it does not create a reviewer or manual authorization step.
- Keep content-generation sources, reviewed packages, runtime adapters, and derived public output distinct. Deployment may consume an accepted package but must not silently author or broaden it.

### Product-model surfaces

- MBTI, Big Five, Enneagram, RIASEC, V4, Career, and related result/report surfaces must preserve their documented scale identity, scoring topology, route behavior, locale support, and analytics contracts.
- Description-only edits must not change assignment, score, relation, identity, or URL topology. Structural changes require their affected contract and public-page coverage.
- Public report and share surfaces must avoid exposing private answers, tenant data, raw entitlement state, or unstable internal identifiers.

### SEO, analytics, and discoverability

- Validate canonical, hreflang, robots, sitemap, llms, structured data, and URL diffs only when their surface is affected. Search/IndexNow/GSC actions occur only after successful exact-SHA production acceptance and only for the allowed changed URLs.
- Analytics events must preserve consent, stable event names, bounded payloads, and the documented public identifiers. Do not log secrets, private API bodies, or sensitive user answers.

## Security and runtime safety

- Treat authentication, entitlement, checkout/payment handoff, admin operations, tenant boundaries, redirects, CSP/security headers, and production runtime configuration as controlled boundaries.
- Do not expose secrets, private topology, raw production payloads, internal release paths, or credentials in code, logs, receipts, screenshots, or reports.
- External navigation and redirect targets must be allowlisted or strictly validated. User-controlled HTML and structured data must remain escaped or sanitized at the correct boundary.
- Caches and service-worker state are derived behavior. Candidate publication, validation, and activation must not make stale or partial content authoritative; failure retains the last known good version.

## Rule maintenance

- Change active rules in the same scoped commit that requires them. Keep rules short, enforceable, and tied to a current classifier, test, or product boundary.
- Do not add task-specific workflows, standing exceptions, shadow ledgers, speculative approval gates, or a second delivery platform.
- Repository contract tests may assert the trunk discipline and the separation between active, historical, and recovery rules.

## Historical only — not ordinary delivery

- PR-train manifest/state and ledger rules apply only when the task explicitly identifies PR-train work for historical investigation or reconciliation.
- A second manifest/state or PR authorization prompt is prohibited. This sentence preserves the historical contract test; it does not create an active manifest, branch, or PR workflow.
- Old branch/PR/audit/merge procedures, reviewer records, required-status receipts, approval phrases, exact content-package credentials, one-off SHA exceptions, and retired workflow names are audit history only and are ignored for ordinary work.
- They apply only when a task explicitly asks to investigate or preserve that historical event. They never authorize an ordinary branch, PR, manual dispatch, production mutation, retry, rollback, or new exception.
- Historical details remain available in Git history and repository evidence. Do not copy them into active delivery rules or revive them as a control plane.
