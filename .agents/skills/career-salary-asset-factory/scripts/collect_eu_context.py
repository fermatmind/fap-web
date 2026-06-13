#!/usr/bin/env python3
"""Create EU macro context evidence plan from a batch manifest."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import load_manifest, write_csv


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    rows = [{
        "slug": job["slug"],
        "eu_status_default": "macro_context_only",
        "source_target": "Eurostat labour-market earnings macro context",
        "forbidden": "EU-wide occupation median salary without occupation-specific source",
    } for job in load_manifest(args.input)]
    write_csv(args.output, rows)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
