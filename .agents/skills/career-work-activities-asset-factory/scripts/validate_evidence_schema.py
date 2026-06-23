#!/usr/bin/env python3
"""Validate career-work-activities evidence ledger shape."""

from __future__ import annotations

import argparse

from work_activities_common import read_jsonl, validate_common_rows, write_json


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--evidence", required=True)
    parser.add_argument("--output", required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rows = read_jsonl(args.evidence)
    findings = validate_common_rows(rows, "evidence")
    for index, row in enumerate(rows, start=1):
        if not row.get("evidence_id"):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_evidence_id"})
        if not isinstance(row.get("facts"), dict):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_facts"})
    payload = {"rows": len(rows), "finding_count": len(findings), "findings": findings, "final_conclusion": "PASS" if not findings else "REPAIR_REQUIRED"}
    write_json(args.output, payload)
    return 0 if not findings else 1


if __name__ == "__main__":
    raise SystemExit(main())
