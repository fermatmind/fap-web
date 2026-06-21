#!/usr/bin/env python3
"""Audit adjacent-comparison evidence trust boundaries."""
from __future__ import annotations
import argparse
from adjacent_common import gate_report, read_jsonl

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
        if len(facts.get("work_activity_overlap_evidence") or []) < 2:
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "insufficient_work_activity_overlap"})
        if len(facts.get("skill_overlap_evidence") or []) < 2:
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "insufficient_skill_overlap"})
        rejected = " ".join(facts.get("rejected_proxy_notes") or [])
        if "title similarity" not in rejected or "salary similarity" not in rejected or "AI-impact similarity" not in rejected:
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_rejected_proxy_notes"})
        if not facts.get("transferability_boundary"):
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_transfer_boundary"})
    return gate_report(a.output, findings, {"row_count": len(rows)})

if __name__ == "__main__":
    raise SystemExit(main())
