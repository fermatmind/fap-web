#!/usr/bin/env python3
"""Run gated career salary asset factory stages."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import write_basic_md, write_json


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--baseline-dir", required=True, type=Path)
    parser.add_argument("--seed", required=True, type=Path)
    parser.add_argument("--batch-size", type=int, default=50)
    parser.add_argument("--max-repair-loops", type=int, default=3)
    parser.add_argument("--start-after-baseline", action="store_true")
    parser.add_argument("--mode", choices=["evidence", "trust", "estimate", "asset", "full"], required=True)
    parser.add_argument("--output-dir", type=Path, default=Path("generated/career-salary-pipeline-run"))
    args = parser.parse_args()

    result = {
        "mode": args.mode,
        "baseline_dir": str(args.baseline_dir),
        "seed": str(args.seed),
        "batch_size": args.batch_size,
        "max_repair_loops": args.max_repair_loops,
        "start_after_baseline": args.start_after_baseline,
        "status": "PLANNED_ONLY",
        "stop_reason": "This orchestrator enforces evidence, trust, estimate, and asset gates. Provide stage artifacts to run validation/audit scripts; it will not fabricate evidence, estimates, or assets.",
    }
    if args.batch_size > 50:
        result["status"] = "BLOCKED"
        result["stop_reason"] = "Default size is 50 unless prior consecutive PASS batches authorize scaling."
    write_json(args.output_dir / "pipeline_state.json", result)
    write_basic_md(args.output_dir / "pipeline_report.md", "Career Salary Pipeline Run", [f"- {k}: `{v}`" for k, v in result.items()])
    return 0 if result["status"] != "BLOCKED" else 2


if __name__ == "__main__":
    raise SystemExit(main())
