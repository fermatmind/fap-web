#!/usr/bin/env python3
"""Audit career-identity reader assets for public-surface safety and traceability."""

from __future__ import annotations

import argparse
import re

from identity_common import fail_report, read_jsonl


LEAKAGE = re.compile(r"\\b(search_projection|sitemap|canonical|noindex|json-ld|jsonld|robots\\.txt|llms\\.txt|cms import|production import|staging_preview)\\b", re.I)
RAW = re.compile(r"\\b(evidence_id|source_id|row_hash|audit_fields|internal lineage|repair note|gate label)\\b", re.I)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--assets", required=True, help="Asset JSONL path.")
    parser.add_argument("--synthesis", help="Optional synthesis JSONL for hash traceability checks.")
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
            if key in {"audit_fields", "evidence_used", "derived_from_synthesis"}:
                continue
            yield from text_values(item)


def main() -> int:
    args = parse_args()
    assets = read_jsonl(args.assets)
    synthesis_by_key = {}
    if args.synthesis:
        synthesis_by_key = {(row.get("slug"), row.get("locale")): row for row in read_jsonl(args.synthesis)}
    findings = []
    for row in assets:
        slug = row.get("slug")
        locale = row.get("locale")
        text = "\\n".join(text_values(row))
        if LEAKAGE.search(text):
            findings.append({"slug": slug, "locale": locale, "issue": "runtime_or_search_instruction_leakage"})
        if RAW.search(text):
            findings.append({"slug": slug, "locale": locale, "issue": "raw_internal_metadata_leakage"})
        if row.get("facts", {}).get("display_title") in (None, ""):
            findings.append({"slug": slug, "locale": locale, "issue": "missing_display_title"})
        if row.get("facts", {}).get("mapping_quality") in (None, ""):
            findings.append({"slug": slug, "locale": locale, "issue": "missing_mapping_quality"})
        for source in row.get("sources") or []:
            if "source_id" in source:
                findings.append({"slug": slug, "locale": locale, "issue": "source_id_leaked_to_reader_asset"})
        syn = synthesis_by_key.get((slug, locale))
        if syn:
            expected = syn.get("audit_fields", {}).get("row_hash")
            got = (row.get("derived_from_synthesis") or {}).get("synthesis_row_hash")
            if expected and got != expected:
                findings.append({"slug": slug, "locale": locale, "issue": "synthesis_hash_mismatch"})
    return fail_report(args.output, findings, {"row_count": len(assets)})


if __name__ == "__main__":
    raise SystemExit(main())
