# Incident and rollback

## Read-only incident sequence

1. Freeze the workflow run ID, approved SHA, artifact digest, and last known active revision.
2. Inspect GitHub job checkpoints and receipt availability.
3. Check public `/revision`, origin-local revision, immutable release identity, PM2 status, and local port health.
4. Determine the last committed boundary: `before_transfer`, `transfer_partial`, `archive_verified`, `promotion_started`, `promotion_committed`, or `smoke_failed`.
5. Report whether a new corrective commit, rollback assessment, or no action is safe; do not rerun a failed SHA.

Do not infer failure from an SSH disconnect alone. Do not replay promotion after an ambiguous boundary. Distinguish installer phase=verify with install_complete=0 from later outer receipt/revision checks after install_complete=1; the installer restore handler does not cover every later check.

## Rollback assessment

After automatic LKG restoration has failed in a real incident, assess recovery.yml using:

- the exact current and target release SHAs;
- the target immutable release and manifest still exist;
- runtime configuration and Node/package compatibility;
- whether the release depends on an incompatible backend or data change;
- the post-rollback smoke set.

Use only recovery.yml under its current incident authority and protected Environment. Do not add a chat approval phrase to the already authorized same-attempt automatic LKG restore; do not edit current or invoke PM2 directly. A diagnostic or ordinary deployment request does not authorize manual recovery outside that boundary.

## Recovery boundaries

- Transfer-only failure: retain verified partial evidence; fix with a new commit and follow its exact-SHA automatic run, preserving production.
- Promotion ambiguity: investigate read-only; never auto-retry.
- PM2 process failure: restart is a separate production action.
- OpenResty candidate failure: verify the ingress job's same-attempt atomic rollback; use incident recovery only when that restoration fails. Do not revive a separate ingress workflow or edit Nginx over SSH.
- DNS failure: rollback DNS separately; application rollback is not implied.
- Backend dependency failure: stop frontend actions and assess API independently.
