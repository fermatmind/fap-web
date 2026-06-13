#!/usr/bin/env python3
"""Create UK evidence collection plan from a batch manifest."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import load_manifest, write_csv


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    rows = []
    for job in load_manifest(args.input):
        rows.append({
            "slug": job["slug"],
            "title_en": job["title_en"],
            "direct_first": f"UK National Careers search for {job['title_en']}",
            "adjacent_second": "Use adjacent profile only with explicit boundary",
            "required_capture": "starter salary, experienced salary, typical hours, working pattern, or variable-pay limitation",
            "type_rule": "typical_hours must be string|null",
        })
    write_csv(args.output, rows)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
