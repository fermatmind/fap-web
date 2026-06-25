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
- `package_sha256`
- `restorable`
- `final_conclusion`
- `created_at`
- `source_run_id`
- `created_by_run_id`

The registry may point to a local path, object storage path, release asset, GitHub Actions artifact, or server artifact. A local checkout path is not enough unless it is backed by a durable artifact URI or the baseline directory is present and its SHA manifest verifies.

## Server Artifact Backend

The default durable backend is a server or local artifact root named by:

`CAREER_CONTENT_ARTIFACT_ROOT`

Artifact URIs use this form:

`career-artifact://career-content-baselines/<block>/<sha>/baseline.tar.gz`

Where `<sha>` is the SHA-256 of `baseline.tar.gz`. The local file location is:

`$CAREER_CONTENT_ARTIFACT_ROOT/career-content-baselines/<block>/<sha>/baseline.tar.gz`

Each artifact directory must contain:

- `baseline.tar.gz`
- `artifact_manifest.json`
- `artifact_sha256.txt`

Baseline packages are not committed to git. Only registry reports and state metadata may be committed when explicitly authorized.

## Export / Upload / Restore Tools

Use these scripts for the artifact lifecycle:

1. `export_baseline_artifact.py`
   - Validates an existing frozen baseline directory and SHA manifest.
   - Creates `baseline.tar.gz`, `artifact_manifest.json`, and `artifact_sha256.txt`.
   - Does not generate content or upload anything.
2. `upload_baseline_artifact.py`
   - Copies an exported package into `CAREER_CONTENT_ARTIFACT_ROOT`.
   - May update `latest_pass_baselines.json` with `artifact_uri`, `package_sha256`, `sha256_manifest_sha256`, `restorable=true`, and `created_by_run_id`.
   - May update `baseline_artifact_registry.json`.
3. `restore_baseline.py`
   - Resolves `--block` plus optional `--sha` from registry, state, or artifact root.
   - Defaults to verify-only when requested; execute mode extracts into `generated/`.
   - Verifies rows/slugs/locale profile and SHA manifest after extraction.

Operator behavior is restore-first: when state records a PASS baseline but the local directory or SHA manifest is missing, use `restore_baseline.py --verify-only` if an artifact URI exists; otherwise run registry/preflight and stop before regeneration.

## Restore Preflight

Before a downstream block consumes a baseline:

1. Read `generated/fermatmind-content-agent-state/latest_pass_baselines.json`.
2. Verify that `baseline_directory` exists.
3. Verify `sha256_manifest` exists.
4. Verify the SHA manifest hash when available.
5. If local files are missing, look up `artifact_uri` in the registry.
6. If a restorable artifact exists, run `restore_baseline.py --verify-only` and report `RESTORE_READY`.
7. If no artifact exists, report `MISSING_LOCAL_NO_RESTORABLE_ARTIFACT` and stop.

Do not regenerate a 1046 baseline just because a local directory is missing. Regeneration is a separate operator action after restore/export fails.

## Hard Boundaries

- Restore preflight does not generate evidence, synthesis, reader assets, or search projection.
- Restore preflight does not mutate runtime, SEO, CMS, staging, or production.
- Restore may copy an already-frozen package only when explicitly invoked without `--verify-only`.
- The server/local artifact backend is supported through `CAREER_CONTENT_ARTIFACT_ROOT`; object-store and release-asset backends require a separate adapter task.

## Downstream Rule

Any script that consumes a PASS baseline should treat these states as hard stops:

- local directory missing and no restorable artifact
- SHA manifest missing
- SHA manifest mismatch
- slug count mismatch
- baseline final conclusion is not PASS/frozen/final repaired
