#!/usr/bin/env python3
"""Audit estimate ledger gate status."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import read_jsonl, write_basic_md, write_csv, write_json


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--evidence-audit", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    args = parser.parse_args()
    rows, errors = read_jsonl(args.input)
    verdict = "PASS" if rows and not errors else "REJECT"
    reports = args.output_dir / "reports"
    write_json(reports / "audit.json", {"final_verdict": verdict, "metrics": {"total_lines": len(rows), "parse_error_count": len(errors)}})
    write_csv(reports / "ready.csv", [{"slug": row.get("identity", {}).get("slug") or row.get("slug")} for row in rows] if verdict == "PASS" else [])
    write_csv(reports / "blocked.csv", [{"reason": "; ".join(errors)}] if errors else [])
    write_csv(reports / "repair_required.csv", [])
    write_basic_md(reports / "audit.md", "Estimate Audit", [f"- final_verdict: `{verdict}`"])
    return 0 if verdict == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
