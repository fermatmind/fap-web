#!/usr/bin/env python3
"""Prepare evidence repair prompts and stop before content generation."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import write_basic_md


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path, help="audit directory or blocked.csv")
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    write_basic_md(args.output, "Evidence Repair Prompt", [
        f"- audit_input: `{args.input}`",
        "- Repair evidence only; do not generate estimates or assets.",
        "- Preserve frozen controls.",
        "- Use templates/evidence_repair_prompt.md and references/*.md.",
    ])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
