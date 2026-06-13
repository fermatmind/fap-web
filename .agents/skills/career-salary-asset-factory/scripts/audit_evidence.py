#!/usr/bin/env python3
"""Audit evidence rows and emit JSON, CSV, and Markdown reports."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import load_manifest, read_jsonl, write_basic_md, write_csv, write_json


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--seed", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    args = parser.parse_args()

    rows, errors = read_jsonl(args.input)
    manifest = load_manifest(args.manifest)
    expected = [job["slug"] for job in manifest]
    slugs = [row.get("slug") for row in rows]
    ready = []
    repair = []
    blocked = []
    for row in rows:
        slug = row.get("slug", "")
        cn = row.get("china_recruitment_evidence", {})
        us = row.get("us_official_evidence", {})
        uk = row.get("uk_evidence", {})
        reasons = []
        if cn.get("status") == "not_found" or not cn.get("evidence_items"):
            reasons.append("CN evidence is not_found or empty")
        if uk.get("mapping_quality") == "unavailable":
            reasons.append("UK evidence is unavailable")
        if not us.get("wage_sources"):
            reasons.append("US official wage_sources missing")
        out = {"slug": slug, "reasons": " | ".join(reasons)}
        if reasons:
            blocked.append(out)
        else:
            ready.append(out)
    if errors or slugs != expected:
        blocked.append({"slug": "", "reasons": "parse errors or manifest order mismatch"})
    verdict = "PASS" if not blocked and not repair else "REPAIR_REQUIRED"
    if blocked:
        verdict = "REJECT"
    metrics = {
        "total_lines": len(rows) + len(errors),
        "valid_json_lines": len(rows),
        "slug_order_matches_manifest": slugs == expected,
        "ready_count": len(ready),
        "repair_required_count": len(repair),
        "blocked_count": len(blocked),
    }
    reports = args.output_dir / "reports"
    write_json(reports / "audit.json", {"final_verdict": verdict, "metrics": metrics, "errors": errors})
    write_csv(reports / "ready.csv", ready)
    write_csv(reports / "repair_required.csv", repair)
    write_csv(reports / "blocked.csv", blocked)
    write_basic_md(reports / "audit.md", "Evidence Audit", [f"- final_verdict: `{verdict}`"] + [f"- {k}: `{v}`" for k, v in metrics.items()])
    return 0 if verdict == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
