#!/usr/bin/env python3
"""Generate reader-facing career-identity asset rows from PASS synthesis rows."""

from __future__ import annotations

import argparse
import datetime
import json

from identity_common import row_hash, read_jsonl, write_jsonl


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--synthesis", required=True, help="PASS synthesis JSONL path.")
    parser.add_argument("--output", required=True, help="Asset JSONL output path.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    rows = []
    for synthesis in read_jsonl(args.synthesis):
        facts = synthesis.get("facts") or {}
        row = {
            "ledger_type": "career-identity_asset",
            "asset_version": "career_identity_v1",
            "block_type": "career-identity",
            "slug": synthesis["slug"],
            "locale": synthesis["locale"],
            "occupation": synthesis["occupation"],
            "seed_ordinal": synthesis["seed_ordinal"],
            "batch_role": synthesis["batch_role"],
            "summary": synthesis.get("summary"),
            "facts": {
                "display_title": facts.get("cleaned_title_candidate") or facts.get("official_title") or synthesis["occupation"],
                "official_title": facts.get("official_title"),
                "mapping_quality": facts.get("mapping_quality"),
                "boundary_type": facts.get("boundary_type"),
            },
            "items": synthesis.get("items") or [],
            "sources": [
                {"name": source.get("source_name") or source.get("name"), "url": source.get("url") or source.get("final_url"), "boundary": source.get("boundary")}
                for source in synthesis.get("sources", [])
            ],
            "evidence_used": synthesis.get("evidence_used") or [],
            "limitations": synthesis.get("limitations") or [],
            "derived_from_synthesis": {
                "synthesis_row_hash": synthesis.get("audit_fields", {}).get("row_hash"),
                "evidence_row_hash": (synthesis.get("derived_from_evidence") or {}).get("evidence_row_hash"),
            },
            "audit_fields": {"generator": "career-identity generate_asset.py", "generated_at": now},
        }
        row["audit_fields"]["row_hash"] = row_hash(row)
        rows.append(row)
    write_jsonl(args.output, rows)
    print(json.dumps({"row_count": len(rows), "output": args.output}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
