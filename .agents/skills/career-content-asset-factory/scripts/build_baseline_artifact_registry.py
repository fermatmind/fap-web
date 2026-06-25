#!/usr/bin/env python3
"""Build a restore-aware registry from career content latest PASS baseline state.

This script does not generate career content and does not upload artifacts. It
records whether each state baseline is present locally, restorable from an
artifact URI, or blocked because neither local files nor artifact metadata exist.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from baseline_artifact_common import build_registry_entry, load_state_baselines, now_iso, registry_summary, write_json, write_markdown


def render_markdown(report: dict) -> str:
    summary = report["summary"]
    lines = [
        "# Career Content Baseline Artifact Registry",
        "",
        f"Final conclusion: `{summary['final_conclusion']}`",
        "",
        "## Summary",
        "",
        f"- Artifact entries: {summary['artifact_count']}",
        f"- Local ready: {summary['local_ready_count']}",
        f"- Restorable from artifact: {summary['restorable_count']}",
        f"- Blocked: {summary['blocked_count']}",
        "",
        "## Entries",
        "",
        "| Block | Status | Local | Restorable | Artifact URI |",
        "| --- | --- | --- | --- | --- |",
    ]
    for entry in report["artifacts"]:
        artifact_uri = entry.get("artifact_uri") or ""
        lines.append(
            f"| {entry['block_name']} | `{entry['status']}` | {entry['local_baseline_exists']} | {entry['restorable']} | {artifact_uri} |"
        )
    lines.extend([
        "",
        "## Boundaries",
        "",
        "- No evidence, synthesis, reader asset, or search projection was generated.",
        "- No runtime, SEO, CMS, staging, or production surface was modified.",
        "- Missing local baselines without artifact URIs must be restored/exported before downstream graph or page-assembly work.",
    ])
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state-file", default="generated/fermatmind-content-agent-state/latest_pass_baselines.json")
    parser.add_argument("--artifact-root", default=None, help="Optional local root to discover restorable baseline directories.")
    parser.add_argument("--output", default="generated/career-content-baseline-artifact-registry/baseline_artifact_registry.json")
    parser.add_argument("--markdown-output", default="generated/career-content-baseline-artifact-registry/baseline_artifact_registry.md")
    args = parser.parse_args()

    entries = [build_registry_entry(row, args.artifact_root) for row in load_state_baselines(args.state_file)]
    report = {
        "schema_version": "1.0",
        "generated_at": now_iso(),
        "registry_type": "career_content_baseline_artifact_registry",
        "artifacts": entries,
        "summary": registry_summary(entries),
        "runtime_modified": False,
        "seo_modified": False,
        "cms_imported": False,
        "staging_created": False,
        "production_imported": False,
        "content_generated": False,
    }
    write_json(args.output, report)
    write_markdown(args.markdown_output, render_markdown(report))
    print(json.dumps(report["summary"], ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
