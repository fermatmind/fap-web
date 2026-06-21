#!/usr/bin/env python3
"""Generate reader-facing adjacent-comparison assets."""
from __future__ import annotations
import argparse
from adjacent_common import BLOCK_TYPE, VERSION, now, read_jsonl, row_hash, write_jsonl

def main() -> int:
    p = argparse.ArgumentParser(description=__doc__); p.add_argument("--synthesis", required=True); p.add_argument("--output", required=True); a = p.parse_args()
    out = []
    for syn in read_jsonl(a.synthesis):
        loc = syn["locale"]; occ = syn["occupation"]; facts = syn.get("facts") or {}
        roles = facts.get("strongest_adjacent_roles") or []
        if loc == "zh-CN":
            summary = f"{occ}的相邻职业比较重点是：哪些工作流程和技能可以迁移，哪些责任、工具或训练边界不能跳过。"
            transition = "这些职业不是“直接可转”的承诺；请先核对缺失技能、证书/训练、工作场景和责任边界。"
            compare_title = "转换前先比较"
            shared_title = "可迁移基础"
            diff_title = "关键差异"
        else:
            summary = f"Adjacent-career comparison for {occ} focuses on transferable workflows and skills, plus the responsibility, tool, and training gaps that cannot be skipped."
            transition = "These roles are not presented as direct-switch promises; compare missing skills, credentials/training, work setting, and responsibility boundaries first."
            compare_title = "compare before switching"
            shared_title = "transferable basis"
            diff_title = "key differences"
        adjacent_roles = [{"slug": r["candidate_slug"], "title": r["candidate_title"], "relation_type": r["relation_type"], "shared_terms": r["shared_terms"][:5]} for r in roles[:5]]
        items = [
            {"section": "adjacent_roles", "items": adjacent_roles},
            {"section": "similar_workflows", "items": [{"title": shared_title, "body": x} for x in facts.get("shared_work_activity_patterns", [])[:3]]},
            {"section": "transferable_skills", "items": [{"title": shared_title, "body": x} for x in facts.get("shared_skill_patterns", [])[:3]]},
            {"section": "major_differences", "items": [{"title": diff_title, "body": x} for x in facts.get("major_differences", [])[:3]]},
            {"section": "how_to_compare_before_switching", "items": [{"title": compare_title, "body": transition}]},
        ]
        row = {
            "ledger_type": "career-adjacent-comparison_asset",
            "asset_version": VERSION,
            "block_type": BLOCK_TYPE,
            "slug": syn["slug"],
            "locale": loc,
            "occupation": occ,
            "seed_ordinal": syn["seed_ordinal"],
            "batch_role": syn["batch_role"],
            "summary": summary,
            "facts": {"adjacent_role_count": len(adjacent_roles), "reader_boundary": facts.get("reader_boundary"), "search_projection_generated": False},
            "items": items,
            "sources": syn.get("sources", []),
            "evidence_used": syn.get("evidence_used", []),
            "derived_from_synthesis": {"synthesis_row_hash": syn.get("audit_fields", {}).get("row_hash")},
            "limitations": [transition],
            "audit_fields": {"generated_at": now(), "generator": "career-adjacent-comparison generate_asset.py"},
        }
        row["audit_fields"]["row_hash"] = row_hash(row)
        out.append(row)
    write_jsonl(a.output, out)
    print(a.output)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
