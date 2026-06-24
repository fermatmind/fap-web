#!/usr/bin/env python3
"""Generate adjacent-comparison synthesis from PASS evidence."""
from __future__ import annotations
import argparse
from adjacent_common import BLOCK_TYPE, VERSION, now, read_jsonl, row_hash, write_jsonl

def main() -> int:
    p = argparse.ArgumentParser(description=__doc__); p.add_argument("--evidence", required=True); p.add_argument("--output", required=True); a = p.parse_args()
    out = []
    for ev in read_jsonl(a.evidence):
        loc = ev["locale"]; occ = ev["occupation"]; facts = ev.get("facts") or {}
        adjacent = facts.get("official_related_occupation_evidence") or []
        if loc == "zh-CN":
            summary = f"{occ}的相邻职业应按工作活动和技能重叠来比较，而不是只看名称相似。"
            boundary = "这不是直接转行保证；证书、训练、工具、责任范围和地区要求需要另行核对。"
        else:
            summary = f"Adjacent roles for {occ} should be compared through work-activity and skill overlap, not title similarity."
            boundary = "This is not a direct-switch guarantee; credentials, training, tools, responsibility scope, and jurisdiction must be checked separately."
        row = {
            "ledger_type": "career-adjacent-comparison_synthesis",
            "asset_version": VERSION,
            "block_type": BLOCK_TYPE,
            "slug": ev["slug"],
            "locale": loc,
            "occupation": occ,
            "seed_ordinal": ev["seed_ordinal"],
            "batch_role": ev["batch_role"],
            "summary": summary,
            "facts": {
                "identity_ref": facts.get("identity_ref"),
                "work_activities_ref": facts.get("work_activities_ref"),
                "skills_entry_ref": facts.get("skills_entry_ref"),
                "strongest_adjacent_roles": adjacent[:5],
                "shared_work_activity_patterns": facts.get("work_activity_overlap_evidence", [])[:4],
                "shared_skill_patterns": facts.get("skill_overlap_evidence", [])[:4],
                "relationship_types": facts.get("relationship_types", []),
                "candidate_shared_work_basis": facts.get("shared_work_basis", []),
                "candidate_shared_skill_basis": facts.get("shared_skill_basis", []),
                "candidate_evidence_confidence": facts.get("evidence_confidence", []),
                "major_differences": facts.get("difference_evidence", []),
                "preparation_or_retraining_boundary": facts.get("credential_or_training_boundary"),
                "not_a_direct_switch_boundary": facts.get("transferability_boundary"),
                "reader_boundary": boundary,
            },
            "items": adjacent[:5],
            "sources": ev.get("sources", []),
            "evidence_used": ev.get("evidence_used", []),
            "derived_from_synthesis": None,
            "limitations": ev.get("limitations", []),
            "audit_fields": {"generated_at": now(), "generator": "career-adjacent-comparison generate_synthesis.py", "evidence_row_hash": ev.get("audit_fields", {}).get("row_hash")},
        }
        row["audit_fields"]["row_hash"] = row_hash(row)
        out.append(row)
    write_jsonl(a.output, out)
    print(a.output)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
