#!/usr/bin/env python3
"""Normalize source_name labels without changing evidence facts."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import read_jsonl, write_csv, write_jsonl


MAPPING = {
    "BLS OEWS / Employment Projections seed context": "BLS OEWS",
    "BLS Employment Projections": "BLS OOH",
    "O*NET / BLS": "O*NET",
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--report", required=True, type=Path)
    args = parser.parse_args()
    rows, errors = read_jsonl(args.input)
    changes = []
    if errors:
        raise SystemExit("; ".join(errors))
    for row in rows:
        for source in row.get("us_official_evidence", {}).get("wage_sources", []) or []:
            old = source.get("source_name")
            if old in MAPPING:
                source["source_name"] = MAPPING[old]
                changes.append({"slug": row.get("slug"), "old_source_name": old, "new_source_name": source["source_name"]})
    write_jsonl(args.output, rows)
    write_csv(args.report, changes)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
