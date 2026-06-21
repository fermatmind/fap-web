#!/usr/bin/env python3
"""Audit career-identity evidence for authority, source traceability, and seed safety."""

from __future__ import annotations

import argparse
import re

from identity_common import fail_report, read_jsonl


OFFICIAL_HINTS = re.compile(r"(O\*NET|SOC|BLS|ESCO|ISCO|National Careers|official|onetonline)", re.I)


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
        facts = row.get("facts") or {}
        sources = row.get("sources") or []
        source_ids = {source.get("source_id") for source in sources if source.get("source_id")}
        if facts.get("canonical_seed_mutated") is True:
            findings.append({"slug": slug, "locale": locale, "issue": "canonical_seed_mutation"})
        if facts.get("title_similarity_proxy_used") is True:
            findings.append({"slug": slug, "locale": locale, "issue": "title_similarity_proxy_used"})
        if facts.get("ambiguous_alias_accepted") is True:
            findings.append({"slug": slug, "locale": locale, "issue": "ambiguous_alias_accepted"})
        source_blob = " ".join(str(source.get(key, "")) for source in sources for key in ("source_name", "url", "final_url", "boundary", "source_relation"))
        if sources and not OFFICIAL_HINTS.search(source_blob):
            findings.append({"slug": slug, "locale": locale, "issue": "official_authority_missing_without_boundary"})
        if not facts.get("onet_code_seed"):
            findings.append({"slug": slug, "locale": locale, "issue": "missing_onet_code_seed"})
        if not facts.get("soc_code_seed"):
            findings.append({"slug": slug, "locale": locale, "issue": "missing_soc_code_seed"})
        if any(source.get("source_relation") == "seed_mapping_requires_repair" for source in sources):
            findings.append({"slug": slug, "locale": locale, "issue": "official_mapping_requires_repair"})
        for item in row.get("items") or []:
            sid = item.get("source_id")
            if sid and sid not in source_ids:
                findings.append({"slug": slug, "locale": locale, "issue": "item_source_id_not_in_sources", "source_id": sid})
        if not (facts.get("official_title") or facts.get("official_occupation_title")):
            findings.append({"slug": slug, "locale": locale, "issue": "missing_official_title_fact"})
        if not (facts.get("mapping_quality") or facts.get("source_authority_status")):
            findings.append({"slug": slug, "locale": locale, "issue": "missing_mapping_quality"})
    return fail_report(args.output, findings, {"row_count": len(rows)})


if __name__ == "__main__":
    raise SystemExit(main())
