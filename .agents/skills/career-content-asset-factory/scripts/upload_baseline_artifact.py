#!/usr/bin/env python3
"""Copy an exported baseline package to CAREER_CONTENT_ARTIFACT_ROOT.

The upload backend is intentionally simple: a durable server/local root. Object
storage adapters can be added later without changing the registry contract.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
from pathlib import Path

from baseline_artifact_common import (
    ARTIFACT_ROOT_ENV,
    CAREER_ARTIFACT_NAMESPACE,
    build_registry_entry,
    career_artifact_uri,
    load_state_baselines,
    now_iso,
    read_json,
    sha256_file,
    write_json,
    write_markdown,
)


def update_latest_pass_state(state_file: str | Path, block: str, updates: dict) -> dict:
    state_path = Path(state_file)
    payload = read_json(state_path)
    changed = False
    rows = payload.get("baselines") or []
    for row in rows:
        if row.get("block_name") == block:
            row.update(updates)
            changed = True
            break
    if not changed:
        raise ValueError(f"No baseline state row found for block={block}")
    write_json(state_path, payload)
    return payload


def load_registry(path: str | Path) -> dict:
    registry_path = Path(path)
    if registry_path.is_file():
        return read_json(registry_path)
    return {
        "schema_version": "1.0",
        "generated_at": now_iso(),
        "registry_type": "career_content_baseline_artifact_registry",
        "artifacts": [],
        "summary": {},
        "runtime_modified": False,
        "seo_modified": False,
        "cms_imported": False,
        "staging_created": False,
        "production_imported": False,
        "content_generated": False,
    }


def upsert_registry_entry(registry_file: str | Path, state_row: dict, artifact_root: str | Path) -> dict:
    registry = load_registry(registry_file)
    entry = build_registry_entry(state_row, artifact_root)
    artifacts = [row for row in registry.get("artifacts", []) if row.get("block_name") != entry["block_name"]]
    artifacts.append(entry)
    artifacts.sort(key=lambda row: row.get("block_name", ""))
    registry["generated_at"] = now_iso()
    registry["artifacts"] = artifacts
    write_json(registry_file, registry)
    return entry


def render_markdown(report: dict) -> str:
    return "\n".join(
        [
            "# Career Content Baseline Artifact Upload",
            "",
            f"Final conclusion: `{report['final_conclusion']}`",
            "",
            "## Artifact",
            "",
            f"- Block: `{report['block_name']}`",
            f"- Artifact URI: `{report['artifact_uri']}`",
            f"- Destination: `{report['destination_dir']}`",
            f"- Package SHA-256: `{report['package_sha256']}`",
            "",
            "## Boundaries",
            "",
            "- Upload copies an already-exported package only.",
            "- No career content, runtime, SEO, CMS, staging, or production surface was modified.",
        ]
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--export-dir", required=True, help="Directory containing baseline.tar.gz and artifact_manifest.json.")
    parser.add_argument("--artifact-root", default=None, help=f"Defaults to ${ARTIFACT_ROOT_ENV}.")
    parser.add_argument("--state-file", default="generated/fermatmind-content-agent-state/latest_pass_baselines.json")
    parser.add_argument("--registry", default="generated/career-content-baseline-artifact-registry/baseline_artifact_registry.json")
    parser.add_argument("--update-state", action="store_true", default=False)
    parser.add_argument("--update-registry", action="store_true", default=False)
    parser.add_argument("--overwrite", action="store_true", default=False)
    parser.add_argument("--output", default=None)
    args = parser.parse_args()

    root = Path(args.artifact_root or os.environ.get(ARTIFACT_ROOT_ENV, ""))
    if not str(root):
        raise SystemExit(f"Missing artifact root. Set {ARTIFACT_ROOT_ENV} or pass --artifact-root.")

    export_dir = Path(args.export_dir)
    manifest_path = export_dir / "artifact_manifest.json"
    tar_path = export_dir / "baseline.tar.gz"
    if not manifest_path.is_file() or not tar_path.is_file():
        raise SystemExit("--export-dir must contain artifact_manifest.json and baseline.tar.gz")
    manifest = read_json(manifest_path)
    block = manifest["block_name"]
    package_sha = manifest["package_sha256"]
    actual_sha = sha256_file(tar_path)
    if actual_sha != package_sha:
        raise SystemExit(f"Package SHA mismatch: expected {package_sha}, actual {actual_sha}")

    destination = root / CAREER_ARTIFACT_NAMESPACE / block / package_sha
    if destination.exists():
        if not args.overwrite:
            raise SystemExit(f"Destination exists: {destination}")
        shutil.rmtree(destination)
    destination.mkdir(parents=True, exist_ok=True)
    for name in ("baseline.tar.gz", "artifact_manifest.json", "artifact_sha256.txt", "export_report.json", "export_report.md"):
        source = export_dir / name
        if source.exists():
            shutil.copy2(source, destination / name)

    artifact_uri = career_artifact_uri(block, package_sha)
    uploaded_manifest = {**manifest, "artifact_uri": artifact_uri, "uploaded_at": now_iso(), "artifact_root": str(root)}
    write_json(destination / "artifact_manifest.json", uploaded_manifest)

    state_updated = False
    registry_entry = None
    updates = {
        "artifact_uri": artifact_uri,
        "artifact_registry_entry_id": f"{block}-{manifest['block_version']}",
        "package_sha256": package_sha,
        "sha256_manifest_sha256": manifest.get("sha256_manifest_sha256"),
        "restorable": True,
        "created_by_run_id": manifest.get("created_by_run_id"),
    }
    if args.update_state:
        payload = update_latest_pass_state(args.state_file, block, updates)
        state_updated = True
        state_row = next(row for row in payload["baselines"] if row.get("block_name") == block)
    else:
        state_row = {**manifest, **updates, "baseline_directory": manifest["baseline_directory"], "sha256_manifest": manifest["sha256_manifest"]}

    if args.update_registry:
        registry_entry = upsert_registry_entry(args.registry, state_row, root)

    report = {
        "schema_version": "1.0",
        "generated_at": now_iso(),
        "final_conclusion": "BASELINE_ARTIFACT_UPLOADED",
        "block_name": block,
        "block_version": manifest["block_version"],
        "artifact_uri": artifact_uri,
        "artifact_root": str(root),
        "destination_dir": str(destination),
        "package_sha256": package_sha,
        "sha256_manifest_sha256": manifest.get("sha256_manifest_sha256"),
        "state_updated": state_updated,
        "registry_updated": bool(registry_entry),
        "registry_entry": registry_entry,
        "runtime_modified": False,
        "seo_modified": False,
        "cms_imported": False,
        "staging_created": False,
        "production_imported": False,
        "content_generated": False,
    }
    output = Path(args.output or destination / "upload_report.json")
    write_json(output, report)
    write_markdown(output.with_suffix(".md"), render_markdown(report))
    print(json.dumps({"final_conclusion": report["final_conclusion"], "artifact_uri": artifact_uri}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
