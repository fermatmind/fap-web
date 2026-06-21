#!/usr/bin/env python3
"""Audit career-skills-entry reader assets for public-surface safety and usefulness."""

from __future__ import annotations

import argparse

from skills_entry_common import RAW_INTERNAL, RUNTIME_OR_SEO, fail_report, read_jsonl, text_values


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--assets", required=True, help="Asset JSONL path.")
    parser.add_argument("--synthesis", help="Optional synthesis JSONL for hash traceability checks.")
    parser.add_argument("--output", required=True, help="Audit JSON output path.")
    return parser.parse_args()


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
        text = "\n".join(text_values(row))
        if RUNTIME_OR_SEO.search(text):
            findings.append({"slug": slug, "locale": locale, "issue": "runtime_or_search_instruction_leakage"})
        if RAW_INTERNAL.search(text):
            findings.append({"slug": slug, "locale": locale, "issue": "raw_internal_metadata_leakage"})
        for source in row.get("sources") or []:
            if "source_id" in source:
                findings.append({"slug": slug, "locale": locale, "issue": "source_id_leaked_to_reader_asset"})
        if len((row.get("items") or [{}])[0].get("items") or []) < 4:
            findings.append({"slug": slug, "locale": locale, "issue": "too_few_verifiable_preparation_items"})
        syn = synthesis_by_key.get((slug, locale))
        if syn:
            expected = syn.get("audit_fields", {}).get("row_hash")
            got = (row.get("derived_from_synthesis") or {}).get("synthesis_row_hash")
            if expected and got != expected:
                findings.append({"slug": slug, "locale": locale, "issue": "synthesis_hash_mismatch"})
    return fail_report(args.output, findings, {"row_count": len(assets)})


if __name__ == "__main__":
    raise SystemExit(main())
