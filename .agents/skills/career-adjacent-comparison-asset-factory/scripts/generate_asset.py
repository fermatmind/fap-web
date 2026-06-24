#!/usr/bin/env python3
"""Generate reader-facing adjacent-comparison assets."""
from __future__ import annotations
import argparse
from adjacent_common import BLOCK_TYPE, VERSION, now, read_jsonl, row_hash, write_jsonl

def zh_workflow_label(text: str) -> str:
    lower = text.lower()
    if any(k in lower for k in ("patient", "clinical", "treat", "therapy", "surgery", "diagnos")):
        return "患者场景、检查记录和安全边界"
    if any(k in lower for k in ("equipment", "instrument", "camera", "machine", "tool")):
        return "专用设备操作、参数记录和结果复核"
    if any(k in lower for k in ("test", "study", "sample", "specimen", "laboratory")):
        return "检测流程、样本/材料记录和质量复核"
    if any(k in lower for k in ("design", "drawing", "blueprint", "model", "plan")):
        return "设计图纸、方案约束和技术交付物"
    if any(k in lower for k in ("inspect", "monitor", "evaluate", "assess", "review")):
        return "检查监测、异常判断和可复核记录"
    if any(k in lower for k in ("repair", "maintain", "install", "operate")):
        return "安装维护、排障步骤和现场交付记录"
    if any(k in lower for k in ("data", "analy", "report", "record", "document")):
        return "数据记录、报告整理和结论复核"
    if any(k in lower for k in ("student", "teach", "training", "instruction")):
        return "教学支持、反馈记录和学习差异判断"
    if any(k in lower for k in ("customer", "client", "public", "service")):
        return "服务对象沟通、需求记录和责任交接"
    return "工作材料、操作步骤和结果复核"

def zh_workflow_body(occupation: str, text: str) -> str:
    label = zh_workflow_label(text)
    return f"与{occupation}相邻的岗位需要比较“{label}”是否真的相同：看输入材料、工具步骤、责任人、复核方式和最终交付物，而不是只看职业名称接近。"

def zh_skill_body(occupation: str, text: str) -> str:
    label = zh_workflow_label(text)
    return f"如果想把{occupation}的经验迁移到相邻岗位，准备材料应围绕“{label}”展开：用项目记录、案例复盘或工具链练习证明自己能处理同类任务，并标出仍需补的训练或证书边界。"

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
            similar_workflows = [{"title": shared_title, "body": zh_workflow_body(occ, x)} for x in facts.get("shared_work_activity_patterns", [])[:3]]
            transferable_skills = [{"title": shared_title, "body": zh_skill_body(occ, x)} for x in facts.get("shared_skill_patterns", [])[:3]]
            major_differences = [{"title": diff_title, "body": "比较相邻岗位时，要单独核对工作场景、责任级别、工具系统、训练/证书要求和交付标准；这些差异决定它是否只是相似岗位，还是需要重新准备。"}]
        else:
            summary = f"Adjacent-career comparison for {occ} focuses on transferable workflows and skills, plus the responsibility, tool, and training gaps that cannot be skipped."
            transition = "These roles are not presented as direct-switch promises; compare missing skills, credentials/training, work setting, and responsibility boundaries first."
            compare_title = "compare before switching"
            shared_title = "transferable basis"
            diff_title = "key differences"
            similar_workflows = [{"title": shared_title, "body": x} for x in facts.get("shared_work_activity_patterns", [])[:3]]
            transferable_skills = [{"title": shared_title, "body": x} for x in facts.get("shared_skill_patterns", [])[:3]]
            major_differences = [{"title": diff_title, "body": x} for x in facts.get("major_differences", [])[:3]]
        adjacent_roles = [{
            "slug": r["candidate_slug"],
            "title": r["candidate_title"],
            "relationship_type": r["relationship_type"],
            "shared_work_basis": r.get("shared_work_basis", [])[:5],
            "shared_skill_basis": r.get("shared_skill_basis", [])[:5],
            "key_difference": r.get("key_difference"),
            "transfer_boundary": r.get("transfer_boundary"),
            "evidence_confidence": r.get("evidence_confidence"),
        } for r in roles[:5]]
        items = [
            {"section": "adjacent_roles", "items": adjacent_roles},
            {"section": "similar_workflows", "items": similar_workflows},
            {"section": "transferable_skills", "items": transferable_skills},
            {"section": "major_differences", "items": major_differences},
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
            "facts": {
                "adjacent_role_count": len(adjacent_roles),
                "relationship_types": [r.get("relationship_type") for r in adjacent_roles],
                "reader_boundary": facts.get("reader_boundary"),
            },
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
