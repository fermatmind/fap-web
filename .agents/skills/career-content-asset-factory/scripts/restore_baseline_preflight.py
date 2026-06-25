#!/usr/bin/env python3
"""Run restore preflight for career content PASS baselines.

Default mode is report-only. It does not copy artifacts unless
`--execute-local-restore` is provided, and even then it only supports local
directory artifacts (`file://` or local paths).
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from baseline_artifact_common import copy_local_artifact, now_iso, read_json, registry_summary, write_json, write_markdown


def load_registry(path: str | Path) -> dict:
    payload = read_json(path)
    if payload.get("registry_type") != "career_content_baseline_artifact_registry":
        raise ValueError(f"{path} is not a career content baseline artifact registry")
    return payload


def selected_entries(registry: dict, block: str) -> list[dict]:
    entries = registry.get("artifacts") or []
    if block == "all":
        return entries
    return [entry for entry in entries if entry.get("block_name") == block]


def render_markdown(report: dict) -> str:
    lines = [
        "# Career Content Restore Preflight",
        "",
        f"Final conclusion: `{report['final_conclusion']}`",
        "",
        "## Results",
        "",
        "| Block | Status | Action | Restored |",
        "| --- | --- | --- | --- |",
    ]
    for result in report["results"]:
        lines.append(
            f"| {result['block_name']} | `{result['status']}` | {result['recommended_action']} | {result['restore_result'].get('restored', False)} |"
        )
    lines.extend([
        "",
        "## Boundaries",
        "",
        "- Report-only preflight does not copy artifacts.",
        "- Restore execution supports only already-frozen local directory artifacts.",
        "- No content, runtime, SEO, CMS, staging, or production mutation is part of this preflight.",
    ])
    return "\n".join(lines)


def classify(entry: dict) -> str:
    status = entry.get("status")
    if status == "LOCAL_READY":
        return "use_local_baseline"
    if status == "RESTORABLE_FROM_ARTIFACT":
        return "restore_artifact_before_downstream_work"
    if status == "SHA_MANIFEST_MISSING":
        return "repair_or_restore_sha_manifest"
    if status == "SHA_MANIFEST_MISMATCH":
        return "reject_contaminated_baseline"
    return "restore_or_regenerate_required"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--registry", required=True)
    parser.add_argument("--block", default="all")
    parser.add_argument("--output", default="generated/career-content-baseline-artifact-registry/restore_preflight_report.json")
    parser.add_argument("--markdown-output", default="generated/career-content-baseline-artifact-registry/restore_preflight_report.md")
    parser.add_argument("--destination-root", default="generated")
    parser.add_argument("--execute-local-restore", action="store_true", default=False)
    parser.add_argument("--overwrite", action="store_true", default=False)
    parser.add_argument("--strict", action="store_true", default=False, help="Exit non-zero when restore is blocked.")
    args = parser.parse_args()

    registry = load_registry(args.registry)
    entries = selected_entries(registry, args.block)
    if not entries:
        raise SystemExit(f"No registry entries matched block={args.block}")

    results = []
    normalized = []
    for entry in entries:
        restore_result = {"restored": False, "reason": "report_only"}
        if args.execute_local_restore and entry.get("status") == "RESTORABLE_FROM_ARTIFACT":
            restore_result = copy_local_artifact(entry, args.destination_root, overwrite=args.overwrite)
            if restore_result.get("restored"):
                entry = {**entry, "status": "LOCAL_READY", "local_baseline_exists": True}
        normalized.append(entry)
        results.append({
            "block_name": entry["block_name"],
            "baseline_directory": entry["baseline_directory"],
            "status": entry["status"],
            "recommended_action": classify(entry),
            "artifact_uri": entry.get("artifact_uri"),
            "restore_result": restore_result,
        })

    summary = registry_summary(normalized)
    report = {
        "generated_at": now_iso(),
        "report_type": "career_content_restore_preflight",
        "registry": args.registry,
        "block": args.block,
        "execute_local_restore": args.execute_local_restore,
        "results": results,
        "summary": summary,
        "final_conclusion": summary["final_conclusion"],
        "runtime_modified": False,
        "seo_modified": False,
        "cms_imported": False,
        "staging_created": False,
        "production_imported": False,
        "content_generated": False,
    }
    write_json(args.output, report)
    write_markdown(args.markdown_output, render_markdown(report))
    print(json.dumps({"final_conclusion": report["final_conclusion"], **summary}, ensure_ascii=False, indent=2, sort_keys=True))
    return 2 if args.strict and summary["blocked_count"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
