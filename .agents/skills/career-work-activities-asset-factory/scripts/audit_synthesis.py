#!/usr/bin/env python3
"""Audit career-work-activities synthesis rows."""

from __future__ import annotations

import argparse

from work_activities_common import has_runtime_or_internal_leakage, read_jsonl, validate_common_rows, write_gate_outputs


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--synthesis", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--ready-csv")
    parser.add_argument("--repair-required-csv")
    parser.add_argument("--blocked-csv")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rows = read_jsonl(args.synthesis)
    findings = validate_common_rows(rows, "synthesis")
    for index, row in enumerate(rows, start=1):
        if not row.get("summary"):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_summary"})
        if len(row.get("task_clusters") or []) < 4:
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "insufficient_task_clusters"})
        if not row.get("evidence_used"):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_evidence_trace"})
        for issue in has_runtime_or_internal_leakage(row):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": issue})
    return write_gate_outputs(
        args.output,
        args.ready_csv,
        args.repair_required_csv,
        args.blocked_csv,
        rows,
        findings,
        {"audit_type": "career_work_activities_synthesis_audit", "rows": len(rows)},
    )


if __name__ == "__main__":
    raise SystemExit(main())
