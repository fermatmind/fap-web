#!/usr/bin/env python3
"""Run the trust audit for career-work-activities evidence."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--evidence", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--ready-csv")
    parser.add_argument("--repair-required-csv")
    parser.add_argument("--blocked-csv")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    script = Path(__file__).with_name("audit_evidence.py")
    cmd = [sys.executable, str(script), "--evidence", args.evidence, "--output", args.output]
    if args.ready_csv:
        cmd += ["--ready-csv", args.ready_csv]
    if args.repair_required_csv:
        cmd += ["--repair-required-csv", args.repair_required_csv]
    if args.blocked_csv:
        cmd += ["--blocked-csv", args.blocked_csv]
    return subprocess.call(cmd)


if __name__ == "__main__":
    raise SystemExit(main())
