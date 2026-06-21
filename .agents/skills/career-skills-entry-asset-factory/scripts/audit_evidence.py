#!/usr/bin/env python3
"""Audit career-skills-entry evidence for traceability and overclaim safety."""

from __future__ import annotations

import argparse

from skills_entry_common import RUNTIME_OR_SEO, fail_report, has_unsafe_outcome_claim, read_jsonl, text_values


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, help="Evidence JSONL path.")
    parser.add_argument("--output", required=True, help="Audit JSON output path.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rows = read_jsonl(args.input)
    findings = []
    for row in rows:
        slug = row.get("slug")
        locale = row.get("locale")
        text = "\n".join(text_values(row))
        facts = row.get("facts") or {}
        source_ids = {source.get("source_id") for source in row.get("sources") or [] if source.get("source_id")}
        if RUNTIME_OR_SEO.search(text):
            findings.append({"slug": slug, "locale": locale, "issue": "runtime_or_search_instruction_leakage"})
        if has_unsafe_outcome_claim(text):
            findings.append({"slug": slug, "locale": locale, "issue": "outcome_or_compensation_claim"})
        if facts.get("job_board_preference_promoted_to_requirement") is True:
            findings.append({"slug": slug, "locale": locale, "issue": "job_board_preference_promoted_to_requirement"})
        if facts.get("frontend_fallback_used") is True:
            findings.append({"slug": slug, "locale": locale, "issue": "frontend_fallback_used_as_evidence"})
        if not facts.get("identity_ref", {}).get("row_hash"):
            findings.append({"slug": slug, "locale": locale, "issue": "missing_identity_dependency_hash"})
        if not facts.get("work_activities_ref", {}).get("row_hash"):
            findings.append({"slug": slug, "locale": locale, "issue": "missing_work_activities_dependency_hash"})
        for item in row.get("items") or []:
            if item.get("source_id") and item.get("source_id") not in source_ids:
                findings.append({"slug": slug, "locale": locale, "issue": "item_source_id_not_in_sources", "source_id": item.get("source_id")})
    return fail_report(args.output, findings, {"row_count": len(rows)})


if __name__ == "__main__":
    raise SystemExit(main())
