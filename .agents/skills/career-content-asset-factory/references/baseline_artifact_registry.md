# Baseline Artifact Registry

Frozen career content baselines are durable artifacts, not disposable local `generated/` folders.

## Problem This Solves

The orchestrator state can record a block as COMPLETE while the physical baseline directory is absent from the current worktree. Downstream blocks such as page assembly and adjacent graph generation must not continue from state metadata alone.

## Registry Contract

Every frozen PASS baseline should have a registry entry containing:

- `registry_entry_id`
- `block_name`
- `block_version`
- `slug_count`
- `baseline_directory`
- `sha256_manifest`
- `sha256_manifest_sha256`
- `artifact_uri`
- `artifact_type`
- `restorable`
- `final_conclusion`
- `created_at`
- `source_run_id`

The registry may point to a local path, object storage path, release asset, GitHub Actions artifact, or server artifact. A local checkout path is not enough unless it is backed by a durable artifact URI or the baseline directory is present and its SHA manifest verifies.

## Restore Preflight

Before a downstream block consumes a baseline:

1. Read `generated/fermatmind-content-agent-state/latest_pass_baselines.json`.
2. Verify that `baseline_directory` exists.
3. Verify `sha256_manifest` exists.
4. Verify the SHA manifest hash when available.
5. If local files are missing, look up `artifact_uri` in the registry.
6. If a restorable artifact exists, report `RESTORE_READY`.
7. If no artifact exists, report `MISSING_LOCAL_NO_RESTORABLE_ARTIFACT` and stop.

Do not regenerate a 1046 baseline just because a local directory is missing. Regeneration is a separate operator action after restore/export fails.

## Hard Boundaries

- Restore preflight does not generate evidence, synthesis, reader assets, or search projection.
- Restore preflight does not mutate runtime, SEO, CMS, staging, or production.
- Restore preflight may copy an already-frozen local artifact only when explicitly invoked with a restore flag.
- Object-store, release-asset, or server download implementations require a separate connector/credential-aware task.

## Downstream Rule

Any script that consumes a PASS baseline should treat these states as hard stops:

- local directory missing and no restorable artifact
- SHA manifest missing
- SHA manifest mismatch
- slug count mismatch
- baseline final conclusion is not PASS/frozen/final repaired
