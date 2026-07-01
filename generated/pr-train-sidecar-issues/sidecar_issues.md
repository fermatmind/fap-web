# PR Train Sidecar Issues

## MBTI-PDF-SNAPSHOT-SYNC-GUARD-H1

### fap-web local pnpm approve-builds blocker
- repo: fap-web
- PR id / branch: MBTI-PDF-SNAPSHOT-SYNC-GUARD-H1 / codex/mbti-pdf-snapshot-sync-guard-h1
- blocker type: local_pnpm_approve_builds
- evidence: `pnpm ops:mbti-pdf-print-asset-hash && pnpm exec vitest ...` failed before running the scoped payload with `[ERR_PNPM_IGNORED_BUILDS] Ignored build scripts: esbuild@0.27.3, sharp@0.34.5, unrs-resolver@1.11.1`.
- why not current PR scope: H1 only adds a print-impact hash guard script, a focused contract test, package script, and PR-train metadata. It does not change dependencies, install policy, or pnpm approval state.
- required checks affected: Local pnpm wrapper command is affected on this machine. Direct `node` and `./node_modules/.bin/vitest` scoped payloads pass. GitHub CI is expected to run in its own clean install context.
- recommended follow-up: Resolve local pnpm approve-builds state separately, then rerun the pnpm wrapper commands.

### fap-web existing untracked pnpm-workspace.yaml
- repo: fap-web
- PR id / branch: MBTI-PDF-SNAPSHOT-SYNC-GUARD-H1 / codex/mbti-pdf-snapshot-sync-guard-h1
- blocker type: unrelated_untracked_file
- evidence: `git status --short --branch` shows `?? pnpm-workspace.yaml`.
- why not current PR scope: H1 scope does not include workspace package-manager configuration, and the file existed outside the scoped H1 changes.
- required checks affected: Not affected if H1 files are staged path-explicitly. It can block a fully clean worktree closeout until handled separately.
- recommended follow-up: Confirm whether `pnpm-workspace.yaml` should be committed in its own repository-maintenance PR or removed by the owner.
