# PR Train Sidecar Issues

Generated at: 2026-06-24T11:27:18.512Z

## ENNEAGRAM-PUBLIC-PROFILE-AGENT-PILOT-01

- Repo: fap-web
- Branch: codex/enneagram-public-profile-agent-pilot-01
- Blocker type: non-current PR scope sentinel failures in full contract suite
- Evidence: pnpm test:contract failed 51 historical contract tests whose final assertions compare the active git diff against their own legacy PR scopes. Focused Enneagram runner contracts passed; pnpm typecheck passed; git diff --check passed.
- Why not current PR scope: the failures are old scope-sentinel assertions in unrelated contracts. They fail because this branch intentionally changes Enneagram agent artifact files and the shared personality runner, not because those unrelated contracts regressed.
- Required checks affected: local aggregate pnpm test:contract is affected; current scoped checks are not. GitHub may fail if it runs the same aggregate without current-scope filtering.
- Recommended follow-up: create a separate contract-scope harness cleanup PR so historical scope-sentinel tests use the active PR id/scope helper or are excluded from unrelated full-suite validation.
