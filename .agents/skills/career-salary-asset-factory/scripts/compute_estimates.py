#!/usr/bin/env python3
"""Compute estimates only after evidence audit PASS."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import read_audit_verdict, write_json


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path, help="PASS evidence JSONL")
    parser.add_argument("--evidence-audit", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    verdict = read_audit_verdict(args.evidence_audit)
    if verdict != "PASS":
        write_json(args.output.with_suffix(".blocked.json"), {"status": "BLOCKED", "reason": f"evidence audit is {verdict}"})
        return 2
    write_json(args.output.with_suffix(".todo.json"), {"status": "NOT_IMPLEMENTED", "reason": "Estimate computation must be implemented with project-approved formulas before production use."})
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
