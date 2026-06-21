#!/usr/bin/env python3
"""Validate career-skills-entry synthesis JSONL shape."""

from __future__ import annotations

import argparse

from skills_entry_common import fail_report, read_jsonl, validate_common_rows


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, help="Synthesis JSONL path.")
    parser.add_argument("--output", required=True, help="Validation JSON output path.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rows = read_jsonl(args.input)
    findings = validate_common_rows(rows, "career-skills-entry_synthesis")
    for index, row in enumerate(rows, start=1):
        if not (row.get("derived_from_evidence") or {}).get("evidence_row_hash"):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_evidence_hash"})
    return fail_report(args.output, findings, {"row_count": len(rows), "unique_slug_locale_count": len({(r.get('slug'), r.get('locale')) for r in rows})})


if __name__ == "__main__":
    raise SystemExit(main())
