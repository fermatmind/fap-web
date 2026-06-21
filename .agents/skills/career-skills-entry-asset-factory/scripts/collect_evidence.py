#!/usr/bin/env python3
"""Generate career-skills-entry evidence rows from PASS identity/work-activities baselines."""

from __future__ import annotations

import argparse
import datetime
import json

from skills_entry_common import (
    VERSION,
    first_jsonl_in,
    read_json,
    row_hash,
    rows_by_slug_locale,
    write_jsonl,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True, help="Career skills-entry batch manifest JSON.")
    parser.add_argument("--identity-baseline", required=True, help="Frozen PASS career-identity baseline directory.")
    parser.add_argument("--work-activities-baseline", required=True, help="Frozen PASS career-work-activities baseline directory.")
    parser.add_argument("--output", required=True, help="Evidence JSONL output path.")
    return parser.parse_args()


def select_work_items(work_row: dict, limit: int = 6) -> list[dict]:
    preferred = []
    fallback = []
    for item in work_row.get("items") or []:
        captured = item.get("captured_fact")
        if not captured:
            continue
        target = preferred if item.get("item_type") in {"task", "detailed_work_activity", "software_or_tool"} else fallback
        target.append(item)
    return (preferred + fallback)[:limit]


def source_list_for_selected_items(work_row: dict, selected: list[dict], fallback: dict) -> list[dict]:
    referenced = {item.get("source_id") for item in selected if item.get("source_id")}
    sources = []
    for source in work_row.get("sources") or []:
        if source.get("source_id") in referenced:
            sources.append(source)
    if not sources:
        sources.append(fallback)
    by_id = {}
    for source in sources:
        sid = source.get("source_id") or fallback.get("source_id")
        by_id[sid] = {
            "source_id": sid,
            "source_name": source.get("source_name") or source.get("name") or fallback.get("source_name"),
            "url": source.get("url") or source.get("final_url") or fallback.get("url"),
            "source_relation": source.get("source_relation") or fallback.get("source_relation"),
            "source_type": source.get("source_type") or fallback.get("source_type"),
            "boundary": source.get("boundary") or fallback.get("boundary"),
        }
    return list(by_id.values())


def main() -> int:
    args = parse_args()
    manifest = read_json(args.manifest)
    identity_path = first_jsonl_in(args.identity_baseline, "assets")
    work_path = first_jsonl_in(args.work_activities_baseline, "evidence")
    identity = rows_by_slug_locale(identity_path)
    work = rows_by_slug_locale(work_path)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    rows = []
    for item in manifest.get("rows", []):
        if not str(item.get("batch_role", "")).startswith("new_"):
            continue
        for locale in item.get("expected_locales", ["zh-CN", "en"]):
            slug = item["slug"]
            occupation = item["title_zh"] if locale == "zh-CN" else item["title_en"]
            identity_row = identity.get((slug, locale))
            work_row = work.get((slug, locale))
            selected = select_work_items(work_row or {})
            onet = item.get("onet_code_seed")
            source_id = f"onet:{onet}" if onet else f"seed:{slug}:skills-entry-boundary"
            fallback_source = {
                "source_id": source_id,
                "source_name": "O*NET OnLine" if onet else "Canonical career seed with PASS work-activities dependency",
                "url": f"https://www.onetonline.org/link/summary/{onet}" if onet else None,
                "source_relation": "direct" if onet else "dependency_boundary",
                "source_type": "official_occupation_profile" if onet else "pass_block_dependency",
                "boundary": "Skills-entry evidence derived from official occupation/task evidence and completed identity/work-activities baselines; not salary, fit, AI impact, admission, hiring, or licensing guarantee evidence.",
            }
            sources = source_list_for_selected_items(work_row or {}, selected, fallback_source)
            evidence_items = []
            for idx, work_item in enumerate(selected, start=1):
                captured = work_item.get("captured_fact")
                evidence_items.append(
                    {
                        "evidence_id": f"{slug}:skills-entry:workflow:{idx}",
                        "item_type": "workflow_to_skill_signal",
                        "source_id": work_item.get("source_id") or source_id,
                        "captured_fact": captured,
                        "skill_entry_use": "Use this workflow as evidence for role-specific knowledge, tool practice, portfolio project, case review, or field log preparation.",
                        "source_boundary": work_item.get("source_boundary") or "PASS work-activities evidence dependency.",
                    }
                )
            education = {
                "entry_education": None,
                "work_experience": None,
                "on_the_job_training": None,
                "boundary": "Education/training fields may be empty unless present in official seed or official profile evidence; do not convert them into guarantees.",
            }
            row = {
                "ledger_type": "career-skills-entry_evidence",
                "asset_version": VERSION,
                "block_type": "career-skills-entry",
                "slug": slug,
                "locale": locale,
                "occupation": occupation,
                "seed_ordinal": int(item["seed_ordinal"]),
                "batch_role": item["batch_role"],
                "summary": None,
                "facts": {
                    "identity_ref": {
                        "baseline": args.identity_baseline,
                        "row_hash": (identity_row or {}).get("audit_fields", {}).get("row_hash"),
                    },
                    "work_activities_ref": {
                        "baseline": args.work_activities_baseline,
                        "row_hash": (work_row or {}).get("audit_fields", {}).get("row_hash"),
                    },
                    "soc_code_seed": item.get("soc_code_seed"),
                    "onet_code_seed": onet,
                    "credential_boundary": "No credential, license, school admission, hiring, salary, immigration, or promotion claim is made unless a jurisdiction-specific source is present.",
                    "education_training_context": education,
                    "job_board_preference_promoted_to_requirement": False,
                    "frontend_fallback_used": False,
                    "search_projection_generated": False,
                },
                "items": evidence_items,
                "sources": sources,
                "evidence_used": [e["evidence_id"] for e in evidence_items],
                "derived_from_synthesis": None,
                "limitations": [
                    "Evidence describes skill-entry preparation signals only.",
                    "Credential or licensing claims require jurisdiction-specific sources and are not inferred from job postings.",
                ],
                "audit_fields": {"generator": "career-skills-entry collect_evidence.py", "generated_at": now},
            }
            row["audit_fields"]["row_hash"] = row_hash(row)
            rows.append(row)
    write_jsonl(args.output, rows)
    print(json.dumps({"row_count": len(rows), "output": args.output}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
