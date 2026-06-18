#!/usr/bin/env python3
"""Shared wrapper for block-level career content asset stages.

This helper intentionally does not generate content. It standardizes CLI shape
for block skills and writes a small machine-readable status when requested.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Run a shared career block stage wrapper.")
    parser.add_argument("--block", required=True)
    parser.add_argument("--stage", required=True)
    parser.add_argument("--input")
    parser.add_argument("--manifest")
    parser.add_argument("--seed")
    parser.add_argument("--baseline")
    parser.add_argument("--output")
    parser.add_argument("--output-dir")
    args = parser.parse_args()

    payload = {
        "status": "SCAFFOLD_READY",
        "block": args.block,
        "stage": args.stage,
        "message": "Block-specific implementation must enforce this skill's references before producing assets.",
        "input": args.input,
        "manifest": args.manifest,
        "seed": args.seed,
        "baseline": args.baseline,
    }

    if args.output:
        out = Path(args.output)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    elif args.output_dir:
        out_dir = Path(args.output_dir)
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "stage_status.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    else:
        print(json.dumps(payload, ensure_ascii=False, indent=2))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

