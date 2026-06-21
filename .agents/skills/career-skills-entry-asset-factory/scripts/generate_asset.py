#!/usr/bin/env python3
"""Generate reader-safe career-skills-entry assets from PASS synthesis rows."""

from __future__ import annotations

import argparse
import datetime
import json

from skills_entry_common import VERSION, read_jsonl, row_hash, write_jsonl


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--synthesis", required=True, help="PASS synthesis JSONL path.")
    parser.add_argument("--output", required=True, help="Asset JSONL output path.")
    return parser.parse_args()


def item_label(locale: str, index: int) -> str:
    if locale == "zh-CN":
        labels = ["任务材料练习", "工具与记录练习", "案例复盘", "可展示交付物", "现场或协作记录", "边界核对"]
    else:
        labels = ["work-material practice", "tool and record practice", "case review", "reviewable deliverable", "field or collaboration log", "boundary check"]
    return labels[(index - 1) % len(labels)]


def main() -> int:
    args = parse_args()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    rows = []
    for synthesis in read_jsonl(args.synthesis):
        locale = synthesis["locale"]
        occupation = synthesis["occupation"]
        prep_items = []
        for idx, item in enumerate((synthesis.get("items") or [])[:6], start=1):
            workflow = item.get("workflow_fact")
            if not workflow:
                continue
            if locale == "zh-CN":
                body = f"围绕“{workflow}”，准备一份能被复核的{item_label(locale, idx)}：说明输入材料、操作步骤、判断边界和最终交付物。"
            else:
                body = f"Use “{workflow}” to build a {item_label(locale, idx)}: show the inputs, steps, judgment boundary, and final deliverable."
            prep_items.append({"title": item_label(locale, idx), "body": body})
        facts = synthesis.get("facts") or {}
        if locale == "zh-CN":
            credential = "证书、执照、学历或实习门槛必须按国家、地区和具体项目核对；这里不把雇主偏好写成正式资格要求。"
        else:
            credential = "Credentials, licenses, education, and internships must be checked by country, jurisdiction, and program; employer preferences are not presented as formal requirements."
        row = {
            "ledger_type": "career-skills-entry_asset",
            "asset_version": VERSION,
            "block_type": "career-skills-entry",
            "slug": synthesis["slug"],
            "locale": locale,
            "occupation": occupation,
            "seed_ordinal": synthesis["seed_ordinal"],
            "batch_role": synthesis["batch_role"],
            "summary": synthesis.get("summary"),
            "facts": {
                "credential_or_license_boundary": credential,
                "preparation_boundary": facts.get("preparation_boundary"),
                "search_projection_generated": False,
            },
            "items": [
                {
                    "section": "verifiable_preparation",
                    "items": prep_items,
                },
                {
                    "section": "credential_boundary",
                    "items": [{"title": "credential boundary" if locale == "en" else "证书边界", "body": credential}],
                },
            ],
            "sources": [
                {"name": source.get("source_name") or source.get("name"), "url": source.get("url") or source.get("final_url"), "boundary": source.get("boundary")}
                for source in synthesis.get("sources", [])
            ],
            "evidence_used": synthesis.get("evidence_used") or [],
            "derived_from_synthesis": {
                "synthesis_row_hash": synthesis.get("audit_fields", {}).get("row_hash"),
                "evidence_row_hash": (synthesis.get("derived_from_evidence") or {}).get("evidence_row_hash"),
            },
            "limitations": synthesis.get("limitations") or [],
            "audit_fields": {"generator": "career-skills-entry generate_asset.py", "generated_at": now},
        }
        row["audit_fields"]["row_hash"] = row_hash(row)
        rows.append(row)
    write_jsonl(args.output, rows)
    print(json.dumps({"row_count": len(rows), "output": args.output}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
