#!/usr/bin/env python3
"""Audit adjacent-comparison evidence trust boundaries."""
from __future__ import annotations
import argparse
from adjacent_common import gate_report, read_jsonl

REQUIRED_ADJACENT_FIELDS = (
    "candidate_slug",
    "candidate_title",
    "relationship_type",
    "shared_work_basis",
    "shared_skill_basis",
    "key_difference",
    "transfer_boundary",
    "evidence_confidence",
    "source_basis",
    "rejected_proxy_notes",
)

DISALLOWED_RELATION_TYPES = {
    "title_similarity_only",
    "salary_similarity_only",
    "broad_family_only",
    "slug_similarity_only",
}

REGULATED_TERMS = (
    "clinical", "patient", "nurse", "physician", "surgeon", "therapy", "pilot", "aircraft",
    "aviation", "legal", "judge", "lawyer", "attorney", "police", "fire", "military",
    "teacher", "education", "licensed", "license", "regulatory", "safety",
    "临床", "患者", "护士", "医生", "治疗", "飞行", "航空", "法律", "法官", "律师",
    "警察", "消防", "军", "教师", "教育", "持证", "执照", "监管", "安全",
)


def contains_any(text: str, needles: tuple[str, ...]) -> bool:
    lower = text.lower()
    return any(n.lower() in lower for n in needles)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__); p.add_argument("--input", required=True); p.add_argument("--output", required=True); a = p.parse_args()
    rows = read_jsonl(a.input); findings = []
    for row in rows:
        facts = row.get("facts") or {}
        for field in ("identity_ref", "work_activities_ref", "skills_entry_ref"):
            if not facts.get(field):
                findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": f"missing_{field}"})
        if len(facts.get("official_related_occupation_evidence") or []) < 3:
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "insufficient_adjacent_candidates"})
        for i, item in enumerate(facts.get("official_related_occupation_evidence") or [], 1):
            missing = [f for f in REQUIRED_ADJACENT_FIELDS if item.get(f) in (None, "", [])]
            if missing:
                findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "candidate": item.get("candidate_slug"), "issue": "missing_adjacent_authority_fields", "fields": missing})
            if item.get("relationship_type") in DISALLOWED_RELATION_TYPES:
                findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "candidate": item.get("candidate_slug"), "issue": "disallowed_relationship_type"})
            if len(item.get("shared_work_basis") or []) < 2:
                findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "candidate": item.get("candidate_slug"), "issue": "insufficient_candidate_shared_work_basis"})
            if len(item.get("shared_skill_basis") or []) < 2:
                findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "candidate": item.get("candidate_slug"), "issue": "insufficient_candidate_shared_skill_basis"})
            source_basis = str(item.get("source_basis") or "").lower()
            if "work" not in source_basis or "skill" not in source_basis:
                findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "candidate": item.get("candidate_slug"), "issue": "source_basis_not_work_skill_grounded"})
            rejected = " ".join(item.get("rejected_proxy_notes") or []).lower()
            for proxy in ("title", "salary", "broad"):
                if proxy not in rejected:
                    findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "candidate": item.get("candidate_slug"), "issue": f"missing_{proxy}_proxy_rejection"})
            boundary = str(item.get("transfer_boundary") or "")
            if not contains_any(boundary, ("tool", "training", "credential", "responsibility", "setting", "license", "supervision", "jurisdiction", "工具", "训练", "证书", "责任", "场景", "执照", "监管")):
                findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "candidate": item.get("candidate_slug"), "issue": "missing_transfer_cost_boundary"})
            regulated_text = " ".join(str(v or "") for v in [row.get("occupation"), item.get("candidate_title"), item.get("key_difference"), boundary])
            if contains_any(regulated_text, REGULATED_TERMS) and not contains_any(boundary, ("license", "supervision", "jurisdiction", "accountability", "safety", "training", "执照", "监管", "责任", "安全", "训练")):
                findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "candidate": item.get("candidate_slug"), "issue": "regulated_role_boundary_missing"})
        if len(facts.get("work_activity_overlap_evidence") or []) < 2:
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "insufficient_work_activity_overlap"})
        if len(facts.get("skill_overlap_evidence") or []) < 2:
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "insufficient_skill_overlap"})
        rejected = " ".join(facts.get("rejected_proxy_notes") or [])
        if "title similarity" not in rejected or "salary similarity" not in rejected or "broad-family-only" not in rejected or "AI-impact similarity" not in rejected:
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_rejected_proxy_notes"})
        if not facts.get("transferability_boundary"):
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_transfer_boundary"})
    return gate_report(a.output, findings, {"row_count": len(rows)})

if __name__ == "__main__":
    raise SystemExit(main())
