#!/usr/bin/env python3
"""Audit adjacent-comparison reader assets."""
from __future__ import annotations
import argparse
from adjacent_common import assert_no_runtime_or_search, gate_report, read_jsonl

def main() -> int:
    p = argparse.ArgumentParser(description=__doc__); p.add_argument("--input", required=True); p.add_argument("--output", required=True); a = p.parse_args()
    rows = read_jsonl(a.input); findings = assert_no_runtime_or_search(rows)
    for row in rows:
        facts = row.get("facts") or {}
        if facts.get("adjacent_role_count", 0) < 3:
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "too_few_adjacent_roles"})
        if not (row.get("derived_from_synthesis") or {}).get("synthesis_row_hash"):
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_synthesis_derivation_hash"})
        sections = {i.get("section") for i in row.get("items", []) if isinstance(i, dict)}
        for required in ("adjacent_roles", "similar_workflows", "transferable_skills", "major_differences", "how_to_compare_before_switching"):
            if required not in sections:
                findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": f"missing_{required}"})
        adjacent_section = next((i for i in row.get("items", []) if isinstance(i, dict) and i.get("section") == "adjacent_roles"), {})
        for item in adjacent_section.get("items", []) or []:
            for field in ("relationship_type", "shared_work_basis", "shared_skill_basis", "key_difference", "transfer_boundary", "evidence_confidence"):
                if item.get(field) in (None, "", []):
                    findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "candidate": item.get("slug"), "issue": f"missing_adjacent_role_{field}"})
    return gate_report(a.output, findings, {"row_count": len(rows)})

if __name__ == "__main__":
    raise SystemExit(main())
