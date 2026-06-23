#!/usr/bin/env python3
"""Generate reader-facing career-work-activities assets from synthesis."""

from __future__ import annotations

import argparse
from datetime import UTC, datetime
from pathlib import Path

from work_activities_common import BLOCK_TYPE, VERSION, read_jsonl, row_hash, short_item, write_jsonl


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--synthesis", required=True)
    parser.add_argument("--output", required=True)
    return parser.parse_args()


def labels(locale: str) -> dict[str, str]:
    if locale == "zh-CN":
        return {
            "tasks": "核心职责",
            "tools": "工具与系统",
            "stakeholders": "协作对象",
            "settings": "工作场景",
            "rhythm": "节奏与环境",
        }
    return {
        "tasks": "Core responsibilities",
        "tools": "Tools and systems",
        "stakeholders": "Collaborators and stakeholders",
        "settings": "Work settings",
        "rhythm": "Rhythm and environment",
    }


def main() -> int:
    args = parse_args()
    rows = []
    for synthesis in read_jsonl(args.synthesis):
        locale = str(synthesis.get("locale"))
        label = labels(locale)
        row = {
            "ledger_type": "asset",
            "asset_version": VERSION,
            "block_type": BLOCK_TYPE,
            "slug": synthesis.get("slug"),
            "locale": locale,
            "occupation": synthesis.get("occupation"),
            "seed_ordinal": synthesis.get("seed_ordinal"),
            "batch_role": synthesis.get("batch_role"),
            "summary": synthesis.get("summary"),
            "items": {
                "core_responsibilities": short_item(locale, label["tasks"], synthesis.get("task_clusters") or []),
                "tools_and_systems": short_item(locale, label["tools"], synthesis.get("tools_and_systems") or []),
                "stakeholders": short_item(locale, label["stakeholders"], synthesis.get("stakeholders") or []),
                "settings": short_item(locale, label["settings"], synthesis.get("settings") or []),
                "rhythm_and_environment": short_item(locale, label["rhythm"], synthesis.get("rhythm_and_environment") or []),
            },
            "evidence_used": synthesis.get("evidence_used", []),
            "derived_from_synthesis": [synthesis.get("audit_fields", {}).get("row_hash")],
            "sources": [{"name": source.get("name"), "url": source.get("url")} for source in synthesis.get("sources", [])],
            "audit_fields": {
                "created_at": datetime.now(UTC).isoformat(),
                "derived_from_synthesis_hash": synthesis.get("audit_fields", {}).get("row_hash"),
                "row_hash": None,
            },
        }
        row["audit_fields"]["row_hash"] = row_hash(row)
        rows.append(row)
    write_jsonl(args.output, rows)
    print(f"WROTE_ASSETS {Path(args.output)} rows={len(rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
