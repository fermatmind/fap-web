#!/usr/bin/env python3
"""Audit salary asset JSONL at a high-level gate."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import read_jsonl, write_basic_md, write_csv, write_json


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    args = parser.parse_args()
    rows, errors = read_jsonl(args.input)
    bad = [row for row in rows if row.get("locale") == "en" and any("\u4e00" <= ch <= "\u9fff" for ch in str(row))]
    verdict = "PASS" if rows and not errors and not bad else "REJECT"
    reports = args.output_dir / "reports"
    write_json(reports / "audit.json", {"final_verdict": verdict, "metrics": {"total_lines": len(rows), "english_contains_chinese_count": len(bad)}})
    write_csv(reports / "ready.csv", [{"slug": row.get("slug"), "locale": row.get("locale")} for row in rows] if verdict == "PASS" else [])
    write_csv(reports / "blocked.csv", [{"reason": "; ".join(errors), "bad_en_rows": len(bad)}] if verdict != "PASS" else [])
    write_csv(reports / "repair_required.csv", [])
    write_basic_md(reports / "audit.md", "Salary Asset Audit", [f"- final_verdict: `{verdict}`"])
    return 0 if verdict == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
