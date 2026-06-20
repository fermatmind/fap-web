#!/usr/bin/env python3
"""Run bounded operator planning until a stop condition.

Default mode is dry run. The script never generates content by itself.
"""

from __future__ import annotations

import argparse
import json
import runpy
import sys
from pathlib import Path


def run_next(script: Path, state_dir: str, block: str, dry_run: bool, batch_size: int, max_repair_loops: int) -> dict:
    tmp = Path(".operator_next_tmp.json")
    argv = [
        str(script),
        "--state-dir",
        state_dir,
        "--block",
        block,
        "--batch-size",
        str(batch_size),
        "--max-repair-loops",
        str(max_repair_loops),
        "--output",
        str(tmp),
    ]
    if dry_run:
        argv.append("--dry-run")
    old = sys.argv
    try:
        sys.argv = argv
        try:
            runpy.run_path(str(script), run_name="__main__")
        except SystemExit:
            pass
        return json.loads(tmp.read_text(encoding="utf-8"))
    finally:
        sys.argv = old
        if tmp.exists():
            tmp.unlink()


def main() -> int:
    parser = argparse.ArgumentParser(description="Run operator next-action planning until the next hard stop.")
    parser.add_argument("--state-dir", default="generated/fermatmind-content-agent-state")
    parser.add_argument("--block", required=True)
    parser.add_argument("--dry-run", action="store_true", default=False)
    parser.add_argument("--max-steps", type=int, default=10)
    parser.add_argument("--batch-size", type=int, default=50)
    parser.add_argument("--max-repair-loops", type=int, default=2)
    parser.add_argument("--output")
    args = parser.parse_args()

    next_script = Path(__file__).with_name("run_operator_next.py")
    steps = []
    for step in range(1, args.max_steps + 1):
        report = run_next(next_script, args.state_dir, args.block, args.dry_run, args.batch_size, args.max_repair_loops)
        report["step"] = step
        steps.append(report)
        # Dry-run loop intentionally stops after the first planned action to avoid
        # simulating state changes that have not happened.
        if args.dry_run or report.get("hard_stop") or report.get("requires_human_approval"):
            break

    loop_report = {
        "dry_run": args.dry_run,
        "block": args.block,
        "step_count": len(steps),
        "steps": steps,
        "execution_performed": False,
        "content_generated": False,
        "final_next_action": steps[-1].get("next_action") if steps else None,
    }
    if args.output:
        out = Path(args.output)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(loop_report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(loop_report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
