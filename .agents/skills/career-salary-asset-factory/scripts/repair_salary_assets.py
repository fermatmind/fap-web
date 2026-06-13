#!/usr/bin/env python3
"""Prepare salary asset repair prompt without editing assets."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import write_basic_md


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    write_basic_md(args.output, "Salary Asset Repair Prompt", [
        f"- audit_input: `{args.input}`",
        "- Repair only unsupported or unsafe asset fields.",
        "- Use PASS evidence and PASS estimate ledgers only.",
    ])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
