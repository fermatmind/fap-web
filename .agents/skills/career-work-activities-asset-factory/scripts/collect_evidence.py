#!/usr/bin/env python3
"""Collect work-activities evidence rows from a manifest and source cache."""

from __future__ import annotations

import argparse
from datetime import UTC, datetime
from pathlib import Path

from work_activities_common import (
    BLOCK_TYPE,
    VERSION,
    evidence_id,
    load_manifest,
    make_source,
    occupation_for,
    row_hash,
    source_cache_by_slug,
    write_jsonl,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--source-cache", help="JSON source cache with occupation-specific tasks/tools/settings.")
    parser.add_argument("--new-only", action="store_true", help="Skip control rows in the manifest.")
    return parser.parse_args()


def list_field(cache: dict, key: str) -> list[str]:
    value = cache.get(key)
    return [str(item).strip() for item in value if str(item).strip()] if isinstance(value, list) else []


def main() -> int:
    args = parse_args()
    cache_by_slug = source_cache_by_slug(args.source_cache)
    rows = []
    for manifest_row in load_manifest(args.manifest):
        if args.new_only and str(manifest_row.get("batch_role", "")).startswith("control_"):
            continue
        cache = cache_by_slug.get(str(manifest_row.get("slug")), {})
        tasks = list_field(cache, "tasks") or list_field(cache, "duties") or list_field(cache, "workflow_evidence_items")
        tools = list_field(cache, "tools")
        stakeholders = list_field(cache, "stakeholders")
        settings = list_field(cache, "settings") or list_field(cache, "work_context")
        rhythm = list_field(cache, "rhythm")
        source = make_source(manifest_row, cache if cache else None)
        status = "collected" if cache and tasks else "source_required_for_evidence"
        for locale in manifest_row.get("expected_locales") or ["zh-CN", "en"]:
            row = {
                "ledger_type": "evidence",
                "asset_version": VERSION,
                "block_type": BLOCK_TYPE,
                "slug": manifest_row.get("slug"),
                "locale": locale,
                "occupation": occupation_for(manifest_row, locale),
                "seed_ordinal": manifest_row.get("seed_ordinal"),
                "batch_role": manifest_row.get("batch_role"),
                "soc_code_seed": manifest_row.get("soc_code_seed"),
                "onet_code_seed": manifest_row.get("onet_code_seed"),
                "evidence_id": evidence_id(str(manifest_row.get("slug")), locale),
                "evidence_collection_status": status,
                "facts": {
                    "task_clusters": tasks,
                    "tools_and_systems": tools,
                    "stakeholders": stakeholders,
                    "settings": settings,
                    "rhythm_and_environment": rhythm,
                    "military_boundary": cache.get("military_boundary") if cache else None,
                    "source_boundary": source.get("source_boundary"),
                },
                "sources": [source],
                "audit_fields": {
                    "created_at": datetime.now(UTC).isoformat(),
                    "source_cache_used": bool(cache),
                    "row_hash": None,
                },
            }
            row["audit_fields"]["row_hash"] = row_hash(row)
            rows.append(row)
    write_jsonl(args.output, rows)
    print(f"WROTE_EVIDENCE {Path(args.output)} rows={len(rows)} source_cache={bool(args.source_cache)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
