#!/usr/bin/env python3
"""Generate salary assets only after evidence and estimate audits PASS."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import read_audit_verdict, write_json


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--evidence", required=True, type=Path)
    parser.add_argument("--evidence-audit", required=True, type=Path)
    parser.add_argument("--estimates", required=True, type=Path)
    parser.add_argument("--estimate-audit", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    evidence_verdict = read_audit_verdict(args.evidence_audit)
    estimate_verdict = read_audit_verdict(args.estimate_audit)
    if evidence_verdict != "PASS" or estimate_verdict != "PASS":
        write_json(args.output.with_suffix(".blocked.json"), {"status": "BLOCKED", "evidence_verdict": evidence_verdict, "estimate_verdict": estimate_verdict})
        return 2
    write_json(args.output.with_suffix(".todo.json"), {"status": "NOT_IMPLEMENTED", "reason": "Asset writing must be wired to approved templates and PASS ledgers."})
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
