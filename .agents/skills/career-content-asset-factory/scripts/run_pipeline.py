#!/usr/bin/env python3
"""Career content orchestrator scaffold.

This script validates requested block/stage sequencing. Block-specific scripts
remain responsible for evidence collection, trust audits, and asset generation.
"""

from __future__ import annotations

import argparse
import json


BLOCKS = {
    "career-salary",
    "career-identity",
    "career-work-activities",
    "career-fit",
    "career-skills-entry",
    "career-risk-future",
    "career-adjacent-comparison",
    "career-page-assembly",
}

MODES = {"manifest", "evidence", "trust", "synthesis", "asset", "freeze", "full"}


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate career content pipeline invocation.")
    parser.add_argument("--block", required=True, choices=sorted(BLOCKS))
    parser.add_argument("--mode", required=True, choices=sorted(MODES))
    parser.add_argument("--baseline-dir")
    parser.add_argument("--seed")
    parser.add_argument("--batch-size", type=int, default=50)
    parser.add_argument("--max-repair-loops", type=int, default=3)
    parser.add_argument("--start-after-baseline", action="store_true")
    args = parser.parse_args()

    print(json.dumps({
        "status": "ORCHESTRATOR_READY",
        "block": args.block,
        "mode": args.mode,
        "batch_size": args.batch_size,
        "max_repair_loops": args.max_repair_loops,
        "message": "Use the block skill's scripts for actual evidence, synthesis, and asset work.",
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

