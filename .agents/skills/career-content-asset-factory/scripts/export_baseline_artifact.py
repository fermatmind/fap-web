#!/usr/bin/env python3
"""Package a frozen career content baseline as a restorable artifact.

This script validates an existing PASS baseline directory, creates
``baseline.tar.gz`` plus sidecar metadata, and does not generate content facts.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from baseline_artifact_common import (
    create_deterministic_tar,
    load_state_baselines,
    now_iso,
    sha256_file,
    validate_baseline_directory,
    write_json,
    write_markdown,
)


def find_state_row(block: str, state_file: str | Path) -> dict | None:
    for row in load_state_baselines(state_file):
        if row.get("block_name") == block:
            return row
    return None


def render_markdown(report: dict) -> str:
    return "\n".join(
        [
            "# Career Content Baseline Artifact Export",
            "",
            f"Final conclusion: `{report['final_conclusion']}`",
            "",
            "## Package",
            "",
            f"- Block: `{report['block_name']}`",
            f"- Baseline directory: `{report['baseline_directory']}`",
            f"- Package: `{report['package_file']}`",
            f"- Package SHA-256: `{report['package_sha256']}`",
            f"- SHA manifest SHA-256: `{report.get('sha256_manifest_sha256') or ''}`",
            "",
            "## Boundaries",
            "",
            "- No evidence, synthesis, reader asset, or search projection was generated.",
            "- No runtime, SEO, CMS, staging, or production surface was modified.",
            "- The package is not uploaded until `upload_baseline_artifact.py` is run.",
        ]
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--block", required=True)
    parser.add_argument("--baseline-dir")
    parser.add_argument("--sha-manifest")
    parser.add_argument("--state-file", default="generated/fermatmind-content-agent-state/latest_pass_baselines.json")
    parser.add_argument("--output-dir", default="generated/career-content-baseline-artifact-registry/packages")
    parser.add_argument("--created-by-run-id", default=None)
    parser.add_argument("--expected-slugs", type=int, default=1046)
    parser.add_argument("--allow-search-projection", action="store_true", default=False)
    parser.add_argument("--strict", action="store_true", default=False)
    args = parser.parse_args()

    row = find_state_row(args.block, args.state_file)
    if not row and (not args.baseline_dir or not args.sha_manifest):
        raise SystemExit(f"No state row found for block={args.block}; pass --baseline-dir and --sha-manifest")

    baseline_dir = Path(args.baseline_dir or row["baseline_directory"])
    sha_manifest = Path(args.sha_manifest or row["sha256_manifest"])
    block_version = (row or {}).get("block_version") or args.block.replace("-", "_")
    final_conclusion = (row or {}).get("final_conclusion") or ""

    validation = validate_baseline_directory(
        baseline_dir,
        sha_manifest,
        expected_slugs=args.expected_slugs,
        require_no_search_projection=not args.allow_search_projection,
    )
    if not validation["ok"] and args.strict:
        raise SystemExit(f"Baseline validation failed: {validation['failures']}")

    out_dir = Path(args.output_dir) / args.block
    out_dir.mkdir(parents=True, exist_ok=True)
    tar_path = out_dir / "baseline.tar.gz"
    create_deterministic_tar(baseline_dir, tar_path)
    package_sha = sha256_file(tar_path)
    package_dir = Path(args.output_dir) / args.block / package_sha
    package_dir.mkdir(parents=True, exist_ok=True)
    final_tar_path = package_dir / "baseline.tar.gz"
    if final_tar_path != tar_path:
        tar_path.replace(final_tar_path)
    else:
        final_tar_path = tar_path

    sha_manifest_sha = sha256_file(sha_manifest) if sha_manifest.is_file() else None
    artifact_manifest = {
        "schema_version": "1.0",
        "artifact_type": "career_content_baseline_package",
        "created_at": now_iso(),
        "created_by_run_id": args.created_by_run_id,
        "block_name": args.block,
        "block_version": block_version,
        "slug_count": (row or {}).get("slug_count") or validation["content_profile"]["slug_count_max"],
        "baseline_directory": str(baseline_dir),
        "baseline_directory_name": baseline_dir.name,
        "sha256_manifest": str(sha_manifest),
        "sha256_manifest_relative_path": str(sha_manifest.relative_to(baseline_dir)) if sha_manifest.is_relative_to(baseline_dir) else sha_manifest.name,
        "sha256_manifest_sha256": sha_manifest_sha,
        "package_file": str(final_tar_path),
        "package_sha256": package_sha,
        "artifact_uri": None,
        "final_conclusion": final_conclusion,
        "validation": validation,
        "runtime_modified": False,
        "seo_modified": False,
        "cms_imported": False,
        "staging_created": False,
        "production_imported": False,
        "content_generated": False,
    }
    write_json(package_dir / "artifact_manifest.json", artifact_manifest)
    (package_dir / "artifact_sha256.txt").write_text(package_sha + "\n", encoding="utf-8")

    report = {
        **artifact_manifest,
        "final_conclusion": "BASELINE_ARTIFACT_EXPORTED" if validation["ok"] else "BASELINE_ARTIFACT_EXPORTED_WITH_VALIDATION_WARNINGS",
    }
    write_json(package_dir / "export_report.json", report)
    write_markdown(package_dir / "export_report.md", render_markdown(report))
    print(json.dumps({"final_conclusion": report["final_conclusion"], "package_sha256": package_sha, "package_dir": str(package_dir)}, ensure_ascii=False, indent=2))
    return 0 if validation["ok"] or not args.strict else 2


if __name__ == "__main__":
    raise SystemExit(main())
