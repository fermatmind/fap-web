#!/usr/bin/env python3
"""Validate adjacent-comparison synthesis schema."""
from __future__ import annotations
import argparse
from adjacent_common import common_required_findings, gate_report, read_jsonl

def main() -> int:
    p = argparse.ArgumentParser(description=__doc__); p.add_argument("--input", required=True); p.add_argument("--output", required=True); a = p.parse_args()
    rows = read_jsonl(a.input)
    return gate_report(a.output, common_required_findings(rows, "career-adjacent-comparison_synthesis"), {"row_count": len(rows)})

if __name__ == "__main__":
    raise SystemExit(main())
