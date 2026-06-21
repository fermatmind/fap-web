#!/usr/bin/env python3
"""Generate career-skills-entry synthesis rows from PASS evidence rows."""

from __future__ import annotations

import argparse
import datetime
import json

from skills_entry_common import VERSION, read_jsonl, row_hash, write_jsonl


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
        locale = evidence["locale"]
        occupation = evidence["occupation"]
        workflow_items = evidence.get("items") or []
        samples = [item.get("captured_fact") for item in workflow_items[:4] if item.get("captured_fact")]
        if locale == "zh-CN":
            summary = f"{occupation}的入门准备应围绕已核验的工作活动来组织：先理解任务材料，再练习工具、记录、案例复盘和可展示交付物。"
            prep_boundary = "如涉及证书、执照或学历门槛，必须按具体国家或地区来源核对；本行不把雇主偏好写成正式要求。"
        else:
            summary = f"Entry preparation for {occupation} should follow verified work activities: understand the work materials, then build tool practice, case reviews, logs, and reviewable deliverables."
            prep_boundary = "Credentials, licenses, or education requirements must be checked by country or jurisdiction; this row does not convert employer preferences into formal requirements."
        row = {
            "ledger_type": "career-skills-entry_synthesis",
            "asset_version": VERSION,
            "block_type": "career-skills-entry",
            "slug": evidence["slug"],
            "locale": locale,
            "occupation": occupation,
            "seed_ordinal": evidence["seed_ordinal"],
            "batch_role": evidence["batch_role"],
            "summary": summary,
            "facts": {
                "knowledge_summary": samples[:2],
                "skill_practice_summary": samples[2:4],
                "credential_boundary": (evidence.get("facts") or {}).get("credential_boundary"),
                "preparation_boundary": prep_boundary,
                "search_projection_generated": False,
            },
            "items": [
                {
                    "item_type": "verifiable_preparation_signal",
                    "source_evidence_id": item.get("evidence_id"),
                    "workflow_fact": item.get("captured_fact"),
                    "preparation_use": item.get("skill_entry_use"),
                }
                for item in workflow_items
            ],
            "sources": evidence.get("sources") or [],
            "evidence_used": evidence.get("evidence_used") or [],
            "limitations": evidence.get("limitations") or [],
            "derived_from_synthesis": None,
            "derived_from_evidence": {"evidence_row_hash": evidence.get("audit_fields", {}).get("row_hash")},
            "audit_fields": {"generator": "career-skills-entry generate_synthesis.py", "generated_at": now},
        }
        row["audit_fields"]["row_hash"] = row_hash(row)
        rows.append(row)
    write_jsonl(args.output, rows)
    print(json.dumps({"row_count": len(rows), "output": args.output}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
