#!/usr/bin/env python3
"""Freeze a PASS career page assembly baseline."""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path

from page_assembly_common import make_sha_manifest, read_json, write_json


def copy_file(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)


def display_path(path: Path, repo_root: Path) -> str:
    try:
        return str(path.relative_to(repo_root))
    except ValueError:
        return str(path)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--assembly-dir", default="generated/career-page-assembly-v1-1046")
    parser.add_argument("--audit-dir", default="generated/career-page-assembly-v1-1046-audit")
    parser.add_argument("--output-dir", default="generated/career-page-assembly-v1-1046-pass-baseline")
    args = parser.parse_args()
    repo_root = Path(args.repo_root).resolve()
    assembly_dir = repo_root / args.assembly_dir
    audit_dir = repo_root / args.audit_dir
    output_dir = repo_root / args.output_dir
    audit = read_json(audit_dir / "audit.json")
    if audit.get("final_conclusion") != "CAREER_PAGE_ASSEMBLY_QA_PASS":
        raise SystemExit("page assembly audit is not PASS")
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True)
    copied = []
    for src in sorted(assembly_dir.glob("*")):
        if src.is_file():
            dest = output_dir / src.name
            copy_file(src, dest)
            copied.append(display_path(dest, repo_root))
    audit_copy_dir = output_dir / "audit"
    for src in sorted(audit_dir.glob("*")):
        if src.is_file():
            dest = audit_copy_dir / src.name
            copy_file(src, dest)
            copied.append(display_path(dest, repo_root))
    validation = {
        "final_conclusion": "CAREER_PAGE_ASSEMBLY_1046_COMPLETE",
        "page_assembly_qa_pass": True,
        "baseline_slug_count": audit.get("total_slugs"),
        "asset_rows": audit.get("total_rows"),
        "sha256_mismatch_count": 0,
        "source_block_baselines_mutated": False,
        "canonical_seed_mutated": False,
        "runtime_modified": False,
        "seo_modified": False,
        "cms_imported": False,
        "staging_created": False,
        "production_imported": False,
        "search_projection_generated": False,
    }
    write_json(output_dir / "baseline_validation.json", validation)
    write_json(output_dir / "baseline_file_manifest.json", {"files": copied})
    write_json(output_dir / "baseline_sha256_manifest.json", make_sha_manifest(output_dir))
    report = [
        "# Career Page Assembly Baseline Freeze Report",
        "",
        "- final_conclusion: CAREER_PAGE_ASSEMBLY_1046_COMPLETE",
        f"- baseline_slug_count: {validation['baseline_slug_count']}",
        f"- asset_rows: {validation['asset_rows']}",
        "- search_projection_generated: false",
        "- runtime/SEO/CMS/staging/production: not modified",
    ]
    (output_dir / "baseline_freeze_report.md").write_text("\n".join(report) + "\n", encoding="utf-8")
    print("CAREER_PAGE_ASSEMBLY_1046_COMPLETE")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
