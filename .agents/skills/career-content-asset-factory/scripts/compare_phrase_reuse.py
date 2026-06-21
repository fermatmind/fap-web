#!/usr/bin/env python3
"""Detect repeated phrase skeletons in a reader-facing JSONL file."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from editorial_quality_common import iter_jsonl, phrase_reuse, write_json


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default="generated/career-page-assembly-v1-1046-pass-baseline/career_page_assembly_1046_v1.jsonl")
    parser.add_argument("--output", default="generated/career-content-editorial-quality-gate/phrase_reuse_report.json")
    args = parser.parse_args()

    rows = list(iter_jsonl(Path(args.input)))
    groups = phrase_reuse(rows)
    report = {
        "input": args.input,
        "row_count": len(rows),
        "repeated_phrase_group_count": len(groups),
        "groups": [{"skeleton": key, "count": value} for key, value in sorted(groups.items(), key=lambda item: (-item[1], item[0]))],
        "content_rewritten": False,
        "baseline_mutated": False,
    }
    write_json(Path(args.output), report)
    print(json.dumps({"repeated_phrase_group_count": len(groups), "output": args.output}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
