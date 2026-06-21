#!/usr/bin/env python3
"""Generate career-identity synthesis rows from PASS evidence rows."""

from __future__ import annotations

import argparse
import datetime
import json

from identity_common import row_hash, read_jsonl, write_jsonl


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--evidence", required=True, help="PASS evidence JSONL path.")
    parser.add_argument("--output", required=True, help="Synthesis JSONL output path.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    rows = []
    for evidence in read_jsonl(args.evidence):
        facts = evidence.get("facts") or {}
        row = {
            "ledger_type": "career-identity_synthesis",
            "asset_version": "career_identity_v1",
            "block_type": "career-identity",
            "slug": evidence["slug"],
            "locale": evidence["locale"],
            "occupation": evidence["occupation"],
            "seed_ordinal": evidence["seed_ordinal"],
            "batch_role": evidence["batch_role"],
            "summary": facts.get("official_definition_summary") or evidence.get("summary"),
            "facts": {
                "official_title": facts.get("official_title") or facts.get("official_occupation_title"),
                "cleaned_title_candidate": facts.get("cleaned_title_candidate"),
                "mapping_quality": facts.get("mapping_quality"),
                "boundary_type": facts.get("boundary_type"),
                "canonical_seed_mutated": False,
            },
            "items": evidence.get("items") or [],
            "sources": evidence.get("sources") or [],
            "evidence_used": evidence.get("evidence_used") or [item.get("evidence_id") for item in evidence.get("items", []) if item.get("evidence_id")],
            "limitations": evidence.get("limitations") or [],
            "derived_from_synthesis": None,
            "derived_from_evidence": {"evidence_row_hash": evidence.get("audit_fields", {}).get("row_hash")},
            "audit_fields": {"generator": "career-identity generate_synthesis.py", "generated_at": now},
        }
        row["audit_fields"]["row_hash"] = row_hash(row)
        rows.append(row)
    write_jsonl(args.output, rows)
    print(json.dumps({"row_count": len(rows), "output": args.output}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
