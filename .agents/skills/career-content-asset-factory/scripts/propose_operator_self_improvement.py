#!/usr/bin/env python3
"""Propose operator improvements from reports without applying them."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Propose operator self-improvements without modifying pipeline behavior.")
    parser.add_argument("--operator-report")
    parser.add_argument("--output")
    args = parser.parse_args()

    report = {}
    if args.operator_report and Path(args.operator_report).exists():
        report = json.loads(Path(args.operator_report).read_text(encoding="utf-8"))

    proposals = [
        {
            "area": "state completeness",
            "proposal": "Add explicit current_phase and current_batch fields to career_block_status once multiple blocks are active.",
            "requires_human_approval": True,
        },
        {
            "area": "operator reports",
            "proposal": "Persist repair-loop counters per block/batch/phase to avoid relying on report filenames.",
            "requires_human_approval": True,
        },
        {
            "area": "safety",
            "proposal": "Keep runtime, SEO, CMS, staging, approved transition, and production import actions outside autonomous execution.",
            "requires_human_approval": False,
        },
    ]
    output = {
        "source_report": args.operator_report,
        "observed_next_action": report.get("next_action"),
        "proposal_count": len(proposals),
        "proposals": proposals,
        "changes_applied": False,
    }
    if args.output:
        out = Path(args.output)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(output, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
