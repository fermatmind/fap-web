#!/usr/bin/env python3
"""Generate source-grounded adjacent-comparison evidence."""
from __future__ import annotations

import argparse
from adjacent_common import (
    BLOCK_TYPE, VERSION, build_index, choose_adjacent, load_dependency_assets, load_seed, now, row_hash,
    dependency_content, sentence_snippets, source_objects, write_jsonl, read_json, write_csv,
)


def parse_args():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--manifest", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--sources-csv", default=None)
    return p.parse_args()


def main() -> int:
    a = parse_args()
    manifest = read_json(a.manifest)
    rows = [r for r in manifest["rows"] if str(r["batch_role"]).startswith("new_")]
    seed = load_seed()
    seed_by_slug = {r["slug"]: r for r in seed}
    deps = load_dependency_assets()
    index = build_index(seed, deps)
    out_rows = []
    source_rows = []
    for m in rows:
        seed_row = seed_by_slug[m["slug"]]
        adjacent = choose_adjacent(m["slug"], seed, deps, index)
        for locale in ("zh-CN", "en"):
            occupation = (m.get("title_zh_seed") or m.get("title_zh")) if locale == "zh-CN" else m["title_en"]
            identity_key = (m["slug"], locale)
            work_key = (m["slug"], locale)
            skills_key = (m["slug"], locale)
            work_items = sentence_snippets(dependency_content(deps["work"].get(work_key, {})), 6)
            skills_items = sentence_snippets(dependency_content(deps["skills"].get(skills_key, {})), 6)
            evidence_items = []
            for i, cand in enumerate(adjacent, 1):
                evidence_items.append({
                    "evidence_id": f"{m['slug']}:adjacent:{i}",
                    "candidate_slug": cand["slug"],
                    "candidate_title": (cand.get("title_zh_seed") or cand.get("title_zh")) if locale == "zh-CN" else cand["title_en"],
                    "relation_type": cand["relation_type"],
                    "shared_basis": cand["score_basis"],
                    "shared_terms": cand["overlap_tokens"],
                    "boundary": "Adjacency requires work-activity and skill overlap; title, salary, AI impact, and personality similarity are not used as proof.",
                })
            row = {
                "ledger_type": "career-adjacent-comparison_evidence",
                "asset_version": VERSION,
                "block_type": BLOCK_TYPE,
                "slug": m["slug"],
                "locale": locale,
                "occupation": occupation,
                "seed_ordinal": int(m["seed_ordinal"]),
                "batch_role": m["batch_role"],
                "summary": f"{occupation} adjacent-comparison evidence uses PASS identity, work-activities, and skills-entry baselines plus O*NET profile context.",
                "facts": {
                    "identity_ref": deps["identity"].get(identity_key, {}).get("audit_fields", {}).get("row_hash"),
                    "work_activities_ref": deps["work"].get(work_key, {}).get("audit_fields", {}).get("row_hash"),
                    "skills_entry_ref": deps["skills"].get(skills_key, {}).get("audit_fields", {}).get("row_hash"),
                    "fit_ref": deps["fit"].get(work_key, {}).get("audit_fields", {}).get("row_hash"),
                    "official_related_occupation_evidence": evidence_items,
                    "work_activity_overlap_evidence": work_items[:4],
                    "skill_overlap_evidence": skills_items[:4],
                    "difference_evidence": ["Compare setting, responsibility level, tools, credentials, and workflow depth before treating the roles as adjacent."],
                    "credential_or_training_boundary": "Credential, license, training, and jurisdiction requirements must be checked separately; this evidence does not claim direct mobility.",
                    "transferability_boundary": "Adjacent comparison identifies overlap and gaps; it does not promise an easy switch or employment outcome.",
                    "rejected_proxy_notes": ["Rejected title similarity, salary similarity, AI-impact similarity, personality-fit similarity, job-board recommendations, and slug similarity as adjacency proof."],
                },
                "items": evidence_items,
                "sources": source_objects(m["slug"], seed_row),
                "evidence_used": [e["evidence_id"] for e in evidence_items],
                "limitations": ["No career switch promise; evidence is bounded to overlap, differences, and preparation gaps."],
                "audit_fields": {"generated_at": now(), "generator": "career-adjacent-comparison collect_evidence.py"},
            }
            row["audit_fields"]["row_hash"] = row_hash(row)
            out_rows.append(row)
            for s in row["sources"]:
                source_rows.append({"slug": m["slug"], "locale": locale, "name": s["name"], "url": s["url"], "boundary": s["boundary"]})
    write_jsonl(a.output, out_rows)
    if a.sources_csv:
        write_csv(a.sources_csv, source_rows, ["slug", "locale", "name", "url", "boundary"])
    print(a.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
