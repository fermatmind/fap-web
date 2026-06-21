#!/usr/bin/env python3
"""Audit career-identity synthesis traceability and boundary safety."""

from __future__ import annotations

import argparse
import re

from identity_common import fail_report, read_jsonl


DISALLOWED = re.compile(
    r"\b(salary|wage|income|AI Impact|RIASEC|MBTI|Big Five|search_projection|sitemap|noindex|JSON-LD)\b"
    r"|rel=['\"]?canonical|canonical\s+(?:url|tag|link|meta)",
    re.I,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--synthesis", required=True, help="Synthesis JSONL path.")
    parser.add_argument("--evidence", help="Optional evidence JSONL for traceability checks.")
    parser.add_argument("--output", required=True, help="Audit JSON output path.")
    return parser.parse_args()


def text_values(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from text_values(item)
    elif isinstance(value, dict):
        for key, item in value.items():
            if key == "audit_fields":
                continue
            yield from text_values(item)


def main() -> int:
    args = parse_args()
    synthesis = read_jsonl(args.synthesis)
    evidence_by_key = {}
    if args.evidence:
        evidence_by_key = {(row.get("slug"), row.get("locale")): row for row in read_jsonl(args.evidence)}
    findings = []
    for row in synthesis:
        slug = row.get("slug")
        locale = row.get("locale")
        text = "\\n".join(text_values(row))
        if DISALLOWED.search(text):
            findings.append({"slug": slug, "locale": locale, "issue": "non_identity_or_runtime_claim_leakage"})
        facts = row.get("facts") or {}
        if facts.get("canonical_seed_mutated") is True:
            findings.append({"slug": slug, "locale": locale, "issue": "canonical_seed_mutation"})
        if not facts.get("official_title"):
            findings.append({"slug": slug, "locale": locale, "issue": "missing_official_title"})
        evidence = evidence_by_key.get((slug, locale))
        if evidence:
            expected = evidence.get("audit_fields", {}).get("row_hash")
            got = (row.get("derived_from_evidence") or {}).get("evidence_row_hash")
            if expected and got != expected:
                findings.append({"slug": slug, "locale": locale, "issue": "evidence_hash_mismatch"})
    return fail_report(args.output, findings, {"row_count": len(synthesis)})


if __name__ == "__main__":
    raise SystemExit(main())
