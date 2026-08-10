# Incident and rollback

## Read-only incident sequence

1. Freeze the workflow run ID, approved SHA, artifact digest, and last known active revision.
2. Inspect GitHub job checkpoints and receipt availability.
3. Check public `/revision`, origin-local revision, immutable release identity, PM2 status, and local port health.
4. Determine the last committed boundary: `before_transfer`, `transfer_partial`, `archive_verified`, `promotion_started`, `promotion_committed`, or `smoke_failed`.
5. Report whether retry, rollback assessment, or no action is safe.

Do not infer failure from an SSH disconnect alone. Do not replay promotion after an ambiguous boundary.

## Rollback assessment

Before requesting rollback approval, prove:

- the exact current and target release SHAs;
- the target immutable release and manifest still exist;
- runtime configuration and Node/package compatibility;
- whether the release depends on an incompatible backend or data change;
- the post-rollback smoke set.

Require:

```text
I explicitly approve rollback of frontend to <TARGET_SHA>.
```

Use only the repository-protected rollback path defined by the current workflow/runbook. Never edit the release symlink or invoke PM2 directly as a substitute.

## Recovery boundaries

- Transfer-only failure: a newly approved exact-SHA run may resume the verified partial archive.
- Promotion ambiguity: investigate read-only; never auto-retry.
- PM2 process failure: restart is a separate production action.
- OpenResty failure: use `Web Public Ingress Control`; do not edit Nginx over SSH.
- DNS failure: rollback DNS separately; application rollback is not implied.
- Backend dependency failure: stop frontend actions and assess API independently.
