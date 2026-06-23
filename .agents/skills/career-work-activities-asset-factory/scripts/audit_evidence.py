#!/usr/bin/env python3
"""Audit work-activities evidence for source-backed, occupation-specific workflow detail."""

from __future__ import annotations

import argparse

from work_activities_common import (
    GENERIC_WORKFLOW,
    has_salary_or_outcome_claim,
    read_jsonl,
    validate_common_rows,
    write_gate_outputs,
)


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
    rows = read_jsonl(args.evidence)
    findings = validate_common_rows(rows, "evidence")
    for index, row in enumerate(rows, start=1):
        facts = row.get("facts") if isinstance(row.get("facts"), dict) else {}
        tasks = facts.get("task_clusters") if isinstance(facts.get("task_clusters"), list) else []
        source = (row.get("sources") or [{}])[0]
        is_military = str(row.get("onet_code_seed") or "").startswith("55-")
        required_items = 6 if is_military else 4
        if row.get("evidence_collection_status") != "collected":
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "source_required_for_evidence"})
        if not source.get("url"):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_source_url"})
        if len(tasks) < required_items:
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "insufficient_workflow_items", "required": required_items, "actual": len(tasks)})
        for item in tasks:
            if GENERIC_WORKFLOW.search(str(item)):
                findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "generic_workflow_evidence", "text": item})
            if has_salary_or_outcome_claim(str(item)):
                findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "salary_or_outcome_claim_in_evidence", "text": item})
        if is_military and not facts.get("military_boundary"):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "military_boundary_missing"})
    return write_gate_outputs(
        args.output,
        args.ready_csv,
        args.repair_required_csv,
        args.blocked_csv,
        rows,
        findings,
        {"audit_type": "career_work_activities_evidence_audit", "rows": len(rows)},
    )


if __name__ == "__main__":
    raise SystemExit(main())
