#!/usr/bin/env python3
"""Audit reader-facing career-work-activities assets."""

from __future__ import annotations

import argparse

from work_activities_common import (
    has_runtime_or_internal_leakage,
    has_salary_or_outcome_claim,
    read_jsonl,
    validate_common_rows,
    write_gate_outputs,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--assets", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--ready-csv")
    parser.add_argument("--repair-required-csv")
    parser.add_argument("--blocked-csv")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rows = read_jsonl(args.assets)
    findings = validate_common_rows(rows, "asset")
    for index, row in enumerate(rows, start=1):
        if not row.get("summary"):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_summary"})
        items = row.get("items") if isinstance(row.get("items"), dict) else {}
        required_items = {"core_responsibilities", "tools_and_systems", "stakeholders", "settings", "rhythm_and_environment"}
        missing_items = sorted(required_items - set(items.keys()))
        if missing_items:
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_reader_items", "fields": missing_items})
        if row.get("locale") == "en" and any("\u4e00" <= ch <= "\u9fff" for ch in str(row.get("summary"))):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "english_contains_chinese"})
        for issue in has_runtime_or_internal_leakage(row):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": issue})
        if has_salary_or_outcome_claim(str(row.get("summary", ""))):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "salary_or_outcome_claim_in_reader_text"})
    return write_gate_outputs(
        args.output,
        args.ready_csv,
        args.repair_required_csv,
        args.blocked_csv,
        rows,
        findings,
        {"audit_type": "career_work_activities_asset_audit", "rows": len(rows)},
    )


if __name__ == "__main__":
    raise SystemExit(main())
