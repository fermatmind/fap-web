#!/usr/bin/env python3
"""Score locale naturalness heuristics for reader-facing JSONL rows."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path

from editorial_quality_common import contains_chinese, contains_long_english, flatten_text, iter_jsonl, write_json


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default="generated/career-page-assembly-v1-1046-pass-baseline/career_page_assembly_1046_v1.jsonl")
    parser.add_argument("--output-json", default="generated/career-content-editorial-quality-gate/locale_naturalness_report.json")
    parser.add_argument("--output-csv", default="generated/career-content-editorial-quality-gate/locale_naturalness_report.csv")
    args = parser.parse_args()

    rows = []
    for row in iter_jsonl(Path(args.input)):
        locale = str(row.get("locale") or "")
        text = "\n".join(value for _, value in flatten_text(row))
        findings = []
        if locale == "en" and contains_chinese(text):
            findings.append("en_contains_chinese")
        if locale == "zh-CN" and contains_long_english(text):
            findings.append("zh_contains_long_english_prose")
        rows.append({
            "slug": row.get("slug"),
            "locale": locale,
            "finding_count": len(findings),
            "findings": ";".join(findings),
            "status": "repair_required" if findings else "ready",
        })
    summary = {
        "input": args.input,
        "row_count": len(rows),
        "finding_rows": sum(1 for row in rows if row["finding_count"]),
        "content_rewritten": False,
        "baseline_mutated": False,
    }
    write_json(Path(args.output_json), {**summary, "rows": rows})
    Path(args.output_csv).parent.mkdir(parents=True, exist_ok=True)
    with Path(args.output_csv).open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["slug", "locale", "finding_count", "findings", "status"], lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
