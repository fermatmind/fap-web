#!/usr/bin/env python3
"""Create Browser/Chrome fallback capture checklist for a batch manifest."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import load_manifest, write_basic_md


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path, help="batch manifest JSON")
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    jobs = load_manifest(args.input)
    lines = ["Use Browser/Chrome only when static source capture fails or login/dynamic rendering is required.", ""]
    for job in jobs:
        lines.append(f"- `{job['slug']}`: capture source URL, visible salary/sample text, and screenshot note if dynamic.")
    write_basic_md(args.output, "Browser Collection Plan", lines)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
