#!/usr/bin/env python3
"""Produce an executive summary for editorial quality audit results."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from editorial_quality_common import markdown_table, read_json


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--report", default="generated/career-content-editorial-quality-gate/editorial_quality_report.json")
    parser.add_argument("--output", default="generated/career-content-editorial-quality-gate/editorial_quality_summary.md")
    args = parser.parse_args()

    report = read_json(Path(args.report))
    summary = report.get("summary", {})
    findings = report.get("findings", [])
    lines = ["# Editorial Quality Summary", ""]
    for key in [
        "final_conclusion",
        "sample_slug_count",
        "audited_rows",
        "finding_count",
        "blocked_count",
        "repair_required_count",
        "editorial_ready_count",
        "repeated_phrase_group_count",
    ]:
        lines.append(f"- {key}: `{summary.get(key)}`")
    lines.extend(["", "## Highest Priority Findings", ""])
    priority = sorted(findings, key=lambda row: ({"blocked": 0, "repair_required": 1, "warning": 2, "info": 3}.get(row.get("severity"), 4), row.get("slug", "")))
    lines.append(markdown_table(priority, ["severity", "finding_type", "slug", "locale", "reason"], 30))
    lines.extend([
        "",
        "## Boundaries",
        "",
        "- No content was rewritten.",
        "- No frozen baseline was mutated.",
        "- No runtime, SEO, CMS, staging, or production action was performed.",
    ])
    Path(args.output).write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"output": args.output, "finding_count": len(findings)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
