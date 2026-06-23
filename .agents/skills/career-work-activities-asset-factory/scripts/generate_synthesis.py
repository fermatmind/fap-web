#!/usr/bin/env python3
"""Generate career-work-activities synthesis from PASS evidence."""

from __future__ import annotations

import argparse
from datetime import UTC, datetime
from pathlib import Path

from work_activities_common import BLOCK_TYPE, VERSION, localized_summary, read_jsonl, row_hash, write_jsonl


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--evidence", required=True)
    parser.add_argument("--output", required=True)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    out = []
    for evidence in read_jsonl(args.evidence):
        facts = evidence.get("facts") if isinstance(evidence.get("facts"), dict) else {}
        tasks = facts.get("task_clusters") if isinstance(facts.get("task_clusters"), list) else []
        tools = facts.get("tools_and_systems") if isinstance(facts.get("tools_and_systems"), list) else []
        stakeholders = facts.get("stakeholders") if isinstance(facts.get("stakeholders"), list) else []
        settings = facts.get("settings") if isinstance(facts.get("settings"), list) else []
        rhythm = facts.get("rhythm_and_environment") if isinstance(facts.get("rhythm_and_environment"), list) else []
        row = {
            "ledger_type": "synthesis",
            "asset_version": VERSION,
            "block_type": BLOCK_TYPE,
            "slug": evidence.get("slug"),
            "locale": evidence.get("locale"),
            "occupation": evidence.get("occupation"),
            "seed_ordinal": evidence.get("seed_ordinal"),
            "batch_role": evidence.get("batch_role"),
            "summary": localized_summary(str(evidence.get("locale")), str(evidence.get("occupation")), tasks, settings),
            "task_clusters": tasks[:8],
            "tools_and_systems": tools[:8],
            "stakeholders": stakeholders[:8],
            "settings": settings[:8],
            "rhythm_and_environment": rhythm[:8],
            "evidence_used": [evidence.get("evidence_id")],
            "sources": evidence.get("sources", []),
            "audit_fields": {
                "created_at": datetime.now(UTC).isoformat(),
                "derived_from_evidence_hash": evidence.get("audit_fields", {}).get("row_hash"),
                "row_hash": None,
            },
        }
        row["audit_fields"]["row_hash"] = row_hash(row)
        out.append(row)
    write_jsonl(args.output, out)
    print(f"WROTE_SYNTHESIS {Path(args.output)} rows={len(out)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
