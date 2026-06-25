#!/usr/bin/env python3
"""Restore a frozen career content baseline from the artifact registry/root."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import tempfile
from pathlib import Path

from baseline_artifact_common import (
    ARTIFACT_ROOT_ENV,
    artifact_path_from_uri,
    load_state_baselines,
    now_iso,
    read_json,
    safe_extract_tar,
    sha256_file,
    validate_baseline_directory,
    write_json,
    write_markdown,
)


def load_registry(path: str | Path | None) -> dict | None:
    if not path:
        return None
    registry_path = Path(path)
    if not registry_path.is_file():
        return None
    return read_json(registry_path)


def state_row_for_block(state_file: str | Path, block: str) -> dict | None:
    for row in load_state_baselines(state_file):
        if row.get("block_name") == block:
            return row
    return None


def candidates_from_registry(registry: dict | None, block: str, sha: str | None) -> list[dict]:
    if not registry:
        return []
    candidates = []
    for row in registry.get("artifacts", []):
        if row.get("block_name") != block:
            continue
        if sha and sha not in {
            row.get("package_sha256"),
            row.get("artifact_sha256"),
            row.get("sha256_manifest_sha256"),
        }:
            continue
        candidates.append(row)
    return candidates


def candidates_from_state(row: dict | None, sha: str | None) -> list[dict]:
    if not row or not row.get("artifact_uri"):
        return []
    if sha and sha not in {
        row.get("package_sha256"),
        row.get("artifact_sha256"),
        row.get("sha256_manifest_sha256"),
    } and sha not in str(row.get("artifact_uri")):
        return []
    return [row]


def candidate_from_root(block: str, sha: str | None, artifact_root: str | Path | None) -> list[dict]:
    if not artifact_root or not sha:
        return []
    tar_path = Path(artifact_root) / "career-content-baselines" / block / sha / "baseline.tar.gz"
    if not tar_path.is_file():
        return []
    return [{"block_name": block, "artifact_uri": f"career-artifact://career-content-baselines/{block}/{sha}/baseline.tar.gz"}]


def materialize_artifact(candidate: dict, artifact_root: str | Path | None) -> tuple[Path, dict | None]:
    uri = candidate.get("artifact_uri")
    if not uri:
        raise FileNotFoundError("candidate does not include artifact_uri")
    source = artifact_path_from_uri(uri, artifact_root)
    if not source:
        raise FileNotFoundError(f"unsupported or unresolved artifact uri: {uri}")
    if source.is_dir():
        source = source / "baseline.tar.gz"
    if not source.is_file():
        raise FileNotFoundError(f"artifact package not found: {source}")
    sidecar = source.parent / "artifact_manifest.json"
    manifest = read_json(sidecar) if sidecar.is_file() else None
    return source, manifest


def render_markdown(report: dict) -> str:
    lines = [
        "# Career Content Baseline Restore",
        "",
        f"Final conclusion: `{report['final_conclusion']}`",
        "",
        "## Restore",
        "",
        f"- Block: `{report['block_name']}`",
        f"- Artifact URI: `{report.get('artifact_uri') or ''}`",
        f"- Verify only: `{report['verify_only']}`",
        f"- Restored path: `{report.get('restored_path') or ''}`",
        f"- Package SHA-256: `{report.get('package_sha256') or ''}`",
        "",
        "## Boundaries",
        "",
        "- Restore copies an already-frozen baseline package only.",
        "- No evidence, synthesis, reader asset, search projection, runtime, SEO, CMS, staging, or production mutation is part of this step.",
    ]
    if report.get("validation"):
        lines.extend(["", "## Validation", "", f"- Validation ok: `{report['validation'].get('ok')}`"])
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--block", required=True)
    parser.add_argument("--sha", default=None, help="Package SHA or SHA-manifest SHA. Optional when state/registry has one matching artifact.")
    parser.add_argument("--artifact-root", default=None, help=f"Defaults to ${ARTIFACT_ROOT_ENV}.")
    parser.add_argument("--registry", default="generated/career-content-baseline-artifact-registry/baseline_artifact_registry.json")
    parser.add_argument("--state-file", default="generated/fermatmind-content-agent-state/latest_pass_baselines.json")
    parser.add_argument("--destination-root", default="generated")
    parser.add_argument("--verify-only", action="store_true", default=False)
    parser.add_argument("--overwrite", action="store_true", default=False)
    parser.add_argument("--expected-slugs", type=int, default=1046)
    parser.add_argument("--allow-search-projection", action="store_true", default=False)
    parser.add_argument("--output", default="generated/career-content-baseline-artifact-registry/restore_baseline_report.json")
    parser.add_argument("--markdown-output", default="generated/career-content-baseline-artifact-registry/restore_baseline_report.md")
    args = parser.parse_args()

    artifact_root = args.artifact_root or os.environ.get(ARTIFACT_ROOT_ENV)
    registry = load_registry(args.registry)
    state_row = state_row_for_block(args.state_file, args.block)
    candidates = []
    candidates.extend(candidates_from_registry(registry, args.block, args.sha))
    candidates.extend(candidates_from_state(state_row, args.sha))
    candidates.extend(candidate_from_root(args.block, args.sha, artifact_root))

    seen = set()
    unique_candidates = []
    for candidate in candidates:
        key = candidate.get("artifact_uri")
        if key and key not in seen:
            seen.add(key)
            unique_candidates.append(candidate)

    selected = None
    package_path = None
    artifact_manifest = None
    errors = []
    for candidate in unique_candidates:
        try:
            package_path, artifact_manifest = materialize_artifact(candidate, artifact_root)
            selected = candidate
            break
        except Exception as exc:  # noqa: BLE001 - report candidate errors for operator diagnostics.
            errors.append({"artifact_uri": candidate.get("artifact_uri"), "error": str(exc)})

    if not selected or not package_path:
        report = {
            "schema_version": "1.0",
            "generated_at": now_iso(),
            "final_conclusion": "BASELINE_RESTORE_BLOCKED",
            "block_name": args.block,
            "sha": args.sha,
            "candidate_count": len(unique_candidates),
            "candidate_errors": errors,
            "verify_only": args.verify_only,
            "runtime_modified": False,
            "seo_modified": False,
            "cms_imported": False,
            "staging_created": False,
            "production_imported": False,
            "content_generated": False,
        }
        write_json(args.output, report)
        write_markdown(args.markdown_output, render_markdown(report))
        print(json.dumps({"final_conclusion": report["final_conclusion"], "candidate_errors": errors}, ensure_ascii=False, indent=2))
        return 2

    package_sha = sha256_file(package_path)
    expected_sha = (artifact_manifest or {}).get("package_sha256") or args.sha
    if expected_sha and package_sha != expected_sha:
        raise SystemExit(f"Artifact package SHA mismatch: expected {expected_sha}, actual {package_sha}")

    restored_path = None
    validation = None
    if args.verify_only:
        with tempfile.TemporaryDirectory(prefix="career-baseline-restore-") as tmp:
            restored_path = safe_extract_tar(package_path, tmp, overwrite=True)
            sha_manifest_relative = (artifact_manifest or {}).get("sha256_manifest_relative_path") or "baseline_sha256_manifest.json"
            validation = validate_baseline_directory(
                restored_path,
                restored_path / sha_manifest_relative,
                expected_slugs=args.expected_slugs,
                require_no_search_projection=not args.allow_search_projection,
            )
    else:
        restored_path = safe_extract_tar(package_path, args.destination_root, overwrite=args.overwrite)
        expected_name = (artifact_manifest or {}).get("baseline_directory_name")
        if expected_name and restored_path.name != expected_name:
            destination = Path(args.destination_root) / expected_name
            if destination.exists():
                if not args.overwrite:
                    raise FileExistsError(f"destination exists: {destination}")
                shutil.rmtree(destination)
            restored_path.rename(destination)
            restored_path = destination
        sha_manifest_relative = (artifact_manifest or {}).get("sha256_manifest_relative_path") or "baseline_sha256_manifest.json"
        validation = validate_baseline_directory(
            restored_path,
            restored_path / sha_manifest_relative,
            expected_slugs=args.expected_slugs,
            require_no_search_projection=not args.allow_search_projection,
        )

    final_conclusion = "BASELINE_RESTORE_VERIFY_PASS" if args.verify_only and validation["ok"] else "BASELINE_RESTORE_PASS" if validation["ok"] else "BASELINE_RESTORE_REPAIR_REQUIRED"
    report = {
        "schema_version": "1.0",
        "generated_at": now_iso(),
        "final_conclusion": final_conclusion,
        "block_name": args.block,
        "sha": args.sha,
        "artifact_uri": selected.get("artifact_uri"),
        "artifact_root": artifact_root,
        "package_path": str(package_path),
        "package_sha256": package_sha,
        "verify_only": args.verify_only,
        "restored_path": str(restored_path) if restored_path and not args.verify_only else None,
        "validation": validation,
        "runtime_modified": False,
        "seo_modified": False,
        "cms_imported": False,
        "staging_created": False,
        "production_imported": False,
        "content_generated": False,
    }
    write_json(args.output, report)
    write_markdown(args.markdown_output, render_markdown(report))
    print(json.dumps({"final_conclusion": final_conclusion, "package_sha256": package_sha, "validation_ok": validation["ok"]}, ensure_ascii=False, indent=2))
    return 0 if validation["ok"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
