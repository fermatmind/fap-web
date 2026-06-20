#!/usr/bin/env python3
"""Select the next career content operator phase from state."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def state_key(block: str) -> str:
    return block.replace("-", "_")


def latest_baseline(state_dir: Path, block: str) -> dict | None:
    path = state_dir / "latest_pass_baselines.json"
    if not path.exists():
        return None
    data = read_json(path)
    return data.get(block) or data.get(state_key(block))


def open_failures(state_dir: Path, block: str) -> list:
    path = state_dir / "open_failures.json"
    if not path.exists():
        return []
    data = read_json(path)
    return data.get(block) or data.get(state_key(block)) or data.get("failures") or []


def main() -> int:
    parser = argparse.ArgumentParser(description="Select the next operator phase from generated state.")
    parser.add_argument("--state-dir", default="generated/fermatmind-content-agent-state")
    parser.add_argument("--block", required=True)
    parser.add_argument("--output")
    args = parser.parse_args()

    state_dir = Path(args.state_dir)
    failures = open_failures(state_dir, args.block)
    baseline = latest_baseline(state_dir, args.block)

    if failures:
        action = "repair_failed_rows"
        phase = "repair"
        reason = "open_failures_present"
    elif baseline:
        action = "create_next_manifest"
        phase = "manifest"
        reason = "latest_pass_baseline_detected"
    else:
        action = "stop_for_human_approval"
        phase = "blocked"
        reason = "missing_latest_pass_baseline"

    report = {
        "block": args.block,
        "state_dir": str(state_dir),
        "phase": phase,
        "action": action,
        "reason": reason,
        "latest_baseline": baseline,
        "open_failure_count": len(failures),
    }
    if args.output:
        out = Path(args.output)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if action != "stop_for_human_approval" else 2


if __name__ == "__main__":
    raise SystemExit(main())
