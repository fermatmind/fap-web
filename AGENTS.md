# Night PR Train Rules

## Scope discipline
- One PR = one scope.
- Never combine adjacent PR scopes.
- Never “fix future PRs” inside the current PR.
- Stop immediately if changed files drift outside the declared scope and `stop_if_changed_files_outside_scope` is true.

## Branch discipline
- Always start from the latest `main`.
- Always pull with `git pull --ff-only origin main` before creating a PR branch.
- A dirty worktree does not automatically block a PR start if unrelated changes are clearly isolated from the current PR.
- “Clearly isolated” means at least one of:
  - the unrelated changes are in files outside the declared PR scope, and the current PR can avoid touching them
  - the current PR can be staged with an explicit path-limited file list
  - the unrelated changes are already committed on another branch and are not part of the current branch diff
- Stop if the worktree is dirty and the current PR scope cannot be isolated cleanly from those existing changes.
- If scoped changes were made on `main` before a PR branch was created, Codex may still create the correct PR branch immediately, provided:
  - the changes are fully within the declared scope
  - the worktree contains no unrelated modifications
  - the branch is created before commit, push, or PR creation
- Stop if the target branch already exists locally or remotely with unrelated commits.

## Dependency discipline
- A PR may start only when all `depends_on` items are already merged into `main`.
- If a dependency is not merged, mark the current item `blocked_dependency` in `docs/codex/pr-train-state.json` and stop.

## Manifest discipline
- If the requested PR id is missing from `docs/codex/pr-train.yaml`, stop and report the gap unless the user explicitly asks to update the train manifest.
- If the user explicitly asks to proceed with that PR, Codex may add the missing manifest/state entry first, then continue under the same scope discipline.
- Never invent a PR id or scope that is not either:
  - already present in the manifest, or
  - explicitly provided by the user.
- For scan/planning-only tasks, Codex must anticipate PR-train execution. If it proposes a future PR that is not already in `docs/codex/pr-train.yaml`, the scan output must include:
  - proposed PR train id
  - proposed PR title
  - proposed scope and files likely touched
  - required local checks
  - dependency assumptions
  - exact manifest/state entries that would need user authorization before implementation
  - a follow-up execution prompt that explicitly asks for manifest/state authorization
- Scan/planning-only tasks must not modify `docs/codex/pr-train.yaml` or `docs/codex/pr-train-state.json` unless the user explicitly authorizes manifest/state updates in that same turn.
- If the user provides a concrete `/goal` or equivalent execution request with an explicit PR id, title, and scope, Codex may treat those as user-provided manifest details. If the id is missing from the manifest, Codex may add the manifest/state entry before implementation only when the user also explicitly authorizes updating both files.

## Verification discipline
- Run all local checks listed in the PR manifest before push.
- If local checks fail, do not open a PR.
- Record failed checks in `docs/codex/pr-train-state.json`.
- Never continue to the next PR after a failed local check.
- If remote GitHub checks fail after all required local checks pass, Codex may continue to the next PR only when:
  - the current PR `merge_policy.github_checks_required` is false
  - the user explicitly instructs Codex to override the remote-check stop
  - the failure and override are recorded in `docs/codex/pr-train-state.json`
  - the failed PR is not merged until it satisfies its `merge_policy`

## PR discipline
- Open exactly one PR for the current task.
- The PR title must match the PR id and scope from the manifest.
- The PR body must include:
  - what changed
  - why
  - validation commands
  - intentionally deferred items
- If a PR for the current task is already open and checks are pending, do not start a different PR unless the manifest permits local-verify-only progression and the user explicitly overrides pending remote checks.
- Codex may continue working only on that same PR when the user explicitly asks for a scoped follow-up, review fix, or CI fix.

## Ad-hoc PR discipline
- Not every PR needs a PR-train id.
- Ordinary scoped PRs, such as repository rule updates, documentation summaries, cleanup-only changes, CI fixes, and small emergency repairs, may be opened without a train id.
- Ad-hoc PRs must not modify `docs/codex/pr-train.yaml` or `docs/codex/pr-train-state.json` unless the user explicitly asks for PR-train metadata updates.

## Local verification tiers
- Ordinary scoped PRs default to focused local verification: run the Vitest or contract files that directly cover the changed behavior, lint the touched scope, and run `git diff --check`.
- Run `pnpm typecheck` when TypeScript interfaces, adapters, components, routes, or runtime code change.
- Run `pnpm build`, the complete `pnpm test:contract`, and Big Five or Enneagram freeze suites locally only when the manifest, a security/high-risk skill, the changed runtime boundary, or the user explicitly requires them.
- Pull requests still require the complete GitHub required checks: build, contracts, verify-big5-contract-freeze, and verify-enneagram-contract-freeze. Focused local checks never permit merging with a failed or missing required check.

## Audit PR execution workflow
- When the user asks Codex to execute the current AUDIT PR, use this order unless the task gives a stricter order:
  1. Create or switch to the scoped task branch from latest `main`.
  2. Implement only the current AUDIT PR scope.
  3. Run the required local tests.
  4. Run scope validation.
  5. Commit.
  6. Push.
  7. Create the PR.
  8. Wait for and poll GitHub checks.
  9. If checks fail, inspect first, then fix only within the current PR scope.
  10. After checks are green, revalidate the PR scope and changed files.
  11. Auto-merge only when repo policy allows and all required checks/reviews are satisfied.
  12. Sync local `main` with `origin/main`.
  13. Clean up the current task branch locally and remotely when allowed.
  14. Run post-merge revalidation.
  15. Continue to the next PR only after the current PR is merged, synced, clean, and revalidated.
- Do not start the next PR while the current AUDIT PR has failed local checks, failed required GitHub checks, unresolved review requirements, ambiguous scope drift, or incomplete cleanup.

## Merge discipline
- Merge only when the current PR satisfies its `merge_policy`.
- Use squash merge unless the manifest explicitly says otherwise.
- After merge, delete the remote branch.
- Before merging a PR-train PR, record its state as `ready_to_merge` or `pending_external_merge`; do not claim `merged` until GitHub reports the merged PR and merge commit.
- After merging a PR-train PR, run post-merge verification and cleanup, but do not create a new PR-train item solely to record `merged` / cleanup facts for that same PR.
- If running in a local clone, run `scripts/post_merge_cleanup.sh <branch> [base]`.
- If running outside a local clone, do not claim local cleanup was executed.

## State ledger discipline
- Record every state transition in `docs/codex/pr-train-state.json`.
- If the current PR id is missing from `docs/codex/pr-train-state.json` but exists in the manifest, Codex may initialize the missing state entry before continuing.
- Update at minimum:
  - status
  - commit_sha
  - pr_url
  - checks
  - failure_reason
  - merged_at
  - remote_branch_deleted
  - local_cleanup_executed
- If the merge has not happened yet, use `merged_at: null`, `remote_branch_deleted: false`, and `local_cleanup_executed: false`, plus a clear pending closeout status. Do not pre-fill final merge facts.
- Never continue after a failed local check unless the manifest explicitly allows retry.
- For remote GitHub check failures that are explicitly user-overridden, record the status as `github_checks_failed_user_overridden`, keep the failed GitHub check details, and set `failure_reason` to include the override instruction and date.

## Ledger reconciliation discipline
- If `docs/codex/pr-train-state.json` records a PR as failed, open, or pending but GitHub shows the PR is already merged, Codex may reconcile the ledger before continuing.
- Reconciliation must verify:
  - GitHub PR state is `MERGED`
  - `origin/main` contains the merge commit
  - remote branch deletion status
  - local cleanup status when operating in a local clone
- Reconciliation is bookkeeping, not a retry of the failed PR.
- If reconciliation touches only PR train metadata needed to unblock the current train item, it may be included with the current PR and called out in the PR body.
- If stale post-merge ledger state does not block the next requested task, do not open a standalone reconciliation PR. Leave the previous item as pending closeout and include the verified merge/cleanup facts in the final response.
- If stale post-merge ledger state blocks dependency resolution, prefer reconciling it inside the next same-repository PR that already modifies `docs/codex`. If no natural PR exists, request explicit user authorization before creating one ledger-only ad-hoc PR; do not create a new `*-RECONCILE-*` PR-train item unless the user explicitly asks to track reconciliation as a train item.
- Cross-repository ledger reconciliation must be done in the repository that owns that ledger.

## Failure policy
- Stop immediately on:
  - preflight failure
  - failed local checks
  - merge block
  - review requirement block
  - ambiguous repository state
- Failed GitHub checks still block merge progression unless the current PR's `merge_policy` does not require GitHub checks.
- Failed GitHub checks do not have to block starting the next manifest PR when the current PR passed all local manifest checks, the manifest allows local verification, and the user explicitly instructs Codex to override the remote-check stop.
- Do not improvise around failures.
- Prefer stopping cleanly over partial progress.
- Codex may continue only if the user explicitly asks to diagnose or fix that same PR's failing checks.
- The previous line applies to preflight failures, local check failures, merge blocks, review requirement blocks, ambiguous repository state, and GitHub failures required by `merge_policy`; it does not forbid a recorded user override for non-required remote GitHub failures.

## Local vs cloud execution
- If operating in a cloud-only environment, remote branch deletion is allowed, but local cleanup must be reported as not executed.
- If operating in a local clone, keep the local worktree clean between PRs.

## Truth boundary
- Codex may draft, refactor, and open PRs.
- Laravel/backend or the declared authority layer remains the source of truth where the manifest says so.
- Never replace an authority layer with frontend or CMS fallback logic.

## Content authority rules
- Frontend must not add or modify public editorial content directly in `app/`, `components/`, `lib/marketing/`, `public/`, or local content folders.
- Articles, article SEO, article covers, article categories/tags, related content placement, and article publication state must be managed in backend CMS Article resources.
- Homepage, tests hub, test category pages, career center modules, CTA text, module ordering, featured items, and landing SEO must be managed through backend `landing_surfaces` / `page_blocks`.
- Help, policy, company, brand, careers, about, charter, foundation, privacy, terms, refund, support, and similar static-content pages must be managed through backend `content_pages`.
- Career guides, career jobs, career recommendations, personality profiles, topic pages, and their SEO/FAQ/sections must be managed through backend CMS/public APIs.
- Mutable images used by editorial, marketing, social, article, landing page, and SEO surfaces must be uploaded to Media Library and referenced by CMS metadata or generated variants.
- Frontend may keep product code only: rendering components, interaction flows, scoring logic, payment/order flows, API adapters, icons, fonts, fixed brand assets, and non-operational game/product assets.
- Do not introduce new MDX/content JSON/static public image assets for publishable content unless the change is explicitly a backend baseline importer fixture.
- Do not add frontend fallback content for CMS-backed surfaces. Empty CMS responses should render an empty/error state, not local editorial copy.
- Sitemap, `llms.txt`, SEO metadata, article enumeration, help pages, topics, personality, and career content must enumerate from CMS/public APIs, not local files.
- DailyGiving proof media is backend-authoritative. The frontend may render the operator-approved original charity donation proof image only through the public `proof_public_url`/evidence URL returned by the backend public API; it must not store proof files, hardcode proof URLs, infer proof status, expose private proof paths, or override backend proof decisions.
- DailyGiving pages must stay `noindex` and out of sitemap/llms until the backend indexability gate explicitly allows inclusion. Frontend changes must not introduce trust badges, official partnership/endorsement implications, guaranteed-impact claims, or social/search amplification for DailyGiving.

## Final V4 upgrade protocols
- Baseline content may exist only for new environment initialization, DB recovery, baseline imports, disaster recovery, and dry-run validation. Baseline content must not become runtime page-rendering authority.
- Local development must support local API, test/staging API, or mock API workflows. CMS migration must not require frontend UI development against production CMS.
- Large content imports must include schema validation and dry-run support before import, especially for career DOCX conversion, slugs, sections, SEO fields, and publication state.
- Experimental surfaces and heavily interactive product experiences may remain product-code-side unless explicitly converted into operational content.
- High-traffic CMS-backed entry pages must prefer CMS/API content, then stale last-known-good cache, then a minimal shell. They must not fall back to a full frontend editorial copy set.
- Business priority is fixed as L1 MBTI, L2 Big Five, and L3 articles/topics/career recommendations/non-core tests. Caching, throttling, degradation, and resource isolation must preserve this order.

## RIASEC launch rules
- Treat RIASEC as one flagship scale with two public forms: `riasec_60` and `riasec_140`.
- Do not create a parallel frontend stack, backend stack, CMS stack, or share/report stack for RIASEC.
- Reuse shared flagship patterns from MBTI, Big Five, and Enneagram first.
- Prefer shared contract and shared service changes over consumer-side inference.
- Delete the legacy 36Q local product surface; do not keep a localStorage fallback as the formal source.
- Keep canonical public IA under `/tests/holland-career-interest-test-riasec`.
- Do not break MBTI, Big Five, or Enneagram existing behavior.
- Always validate targeted contracts/tests after changes.

## Rule maintenance
- Repository rules are part of the architecture contract.
- Every architecture upgrade, CMS migration, content authority change, API contract change, or publishing workflow change must update these rules in the same PR or in a clearly linked follow-up PR.
- A PR that changes content ownership, publishing SOP, backend CMS models, public content APIs, media asset handling, SEO generation, sitemap/llms enumeration, or frontend fallback behavior must include a short "Repository rule impact" note.
- If the change introduces a new content surface, the PR must explicitly state whether that surface is:
  - CMS/backend-authoritative
  - frontend product-code-only
  - temporary migration fallback
  - deprecated
- Temporary migration fallback must include an owner, removal condition, and target removal PR/issue.
- Rules must not lag behind architecture. If implementation and rules conflict, the PR is incomplete until the rules are updated or the conflict is explicitly resolved.
