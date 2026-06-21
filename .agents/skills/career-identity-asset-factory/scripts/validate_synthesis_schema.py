#!/usr/bin/env python3
"""Validate career-identity synthesis JSONL shape."""

from __future__ import annotations

import argparse

from identity_common import fail_report, read_jsonl


REQUIRED = {"ledger_type", "asset_version", "block_type", "slug", "locale", "occupation", "seed_ordinal", "batch_role", "sources", "audit_fields"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, help="Synthesis JSONL path.")
    parser.add_argument("--output", required=True, help="Validation JSON output path.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    rows = read_jsonl(args.input)
    findings = []
    seen = set()
    for index, row in enumerate(rows, start=1):
        missing = sorted(REQUIRED - row.keys())
        if missing:
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_required_fields", "fields": missing})
        if row.get("ledger_type") != "career-identity_synthesis":
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "bad_ledger_type"})
        key = (row.get("slug"), row.get("locale"))
        if key in seen:
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "duplicate_slug_locale"})
        seen.add(key)
        if not row.get("sources"):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_sources"})
    return fail_report(args.output, findings, {"row_count": len(rows), "unique_slug_locale_count": len(seen)})


if __name__ == "__main__":
    raise SystemExit(main())
