#!/usr/bin/env python3
"""Audit career-skills-entry synthesis for traceability and safe boundaries."""

from __future__ import annotations

import argparse

from skills_entry_common import RUNTIME_OR_SEO, fail_report, has_unsafe_outcome_claim, read_jsonl, text_values


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--synthesis", required=True, help="Synthesis JSONL path.")
    parser.add_argument("--evidence", help="Optional evidence JSONL for hash traceability checks.")
    parser.add_argument("--output", required=True, help="Audit JSON output path.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rows = read_jsonl(args.synthesis)
    evidence_by_key = {}
    if args.evidence:
        evidence_by_key = {(row.get("slug"), row.get("locale")): row for row in read_jsonl(args.evidence)}
    findings = []
    for row in rows:
        slug = row.get("slug")
        locale = row.get("locale")
        text = "\n".join(text_values(row))
        if RUNTIME_OR_SEO.search(text):
            findings.append({"slug": slug, "locale": locale, "issue": "runtime_or_search_instruction_leakage"})
        if has_unsafe_outcome_claim(text):
            findings.append({"slug": slug, "locale": locale, "issue": "outcome_or_compensation_claim"})
        evidence = evidence_by_key.get((slug, locale))
        if evidence:
            expected = evidence.get("audit_fields", {}).get("row_hash")
            got = (row.get("derived_from_evidence") or {}).get("evidence_row_hash")
            if expected and got != expected:
                findings.append({"slug": slug, "locale": locale, "issue": "evidence_hash_mismatch"})
    return fail_report(args.output, findings, {"row_count": len(rows)})


if __name__ == "__main__":
    raise SystemExit(main())
