#!/usr/bin/env python3
"""Render a next-goal markdown prompt from operator state."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Render next-goal markdown from operator state.")
    parser.add_argument("--state-dir", default="generated/fermatmind-content-agent-state")
    parser.add_argument("--block", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    script = Path(__file__).with_name("run_operator_next.py")
    result = subprocess.run(
        [
            sys.executable,
            str(script),
            "--state-dir",
            args.state_dir,
            "--block",
            args.block,
            "--dry-run",
        ],
        check=False,
        capture_output=True,
        text=True,
    )
    data = json.loads(result.stdout)
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(data.get("next_goal", "") + "\n", encoding="utf-8")
    print(json.dumps({"output": str(out), "next_action": data.get("next_action"), "execution_performed": False}, ensure_ascii=False, indent=2))
    return 0 if result.returncode in {0, 2} else result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
