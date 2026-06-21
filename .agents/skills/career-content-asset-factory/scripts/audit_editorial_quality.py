#!/usr/bin/env python3
"""Run a read-only competitive editorial quality audit."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from editorial_quality_common import (
    DO_NOT_MODIFY_FIELDS,
    LOCALES,
    markdown_table,
    phrase_reuse,
    read_json,
    read_seed,
    rows_by_slug_locale,
    score_row,
    seed_title,
    select_sample_slugs,
    utc_now,
    write_csv,
    write_json,
)


def load_sample_slugs(path: Path | None, seed_rows: list[dict]) -> list[str]:
    if path and path.exists():
        data = read_json(path)
        items = data.get("slugs", data if isinstance(data, list) else [])
        return [str(item.get("slug") if isinstance(item, dict) else item) for item in items]
    return [str(row.get("slug")) for row in select_sample_slugs(seed_rows, 50)]


def build_repair_plan(rows: list[dict]) -> dict:
    repairs = []
    for row in rows:
        if row["status"] == "editorial_ready":
            continue
        fields = sorted({finding["field_path"] for finding in row["findings"]})
        repairs.append({
            "slug": row["slug"],
            "locale": row["locale"],
            "block": row["block"],
            "affected_fields": fields or ["reader_facing_text"],
            "recommended_rewrite_type": "editorial_quality_repair_without_new_facts",
            "preserve_fields": DO_NOT_MODIFY_FIELDS,
            "forbidden_changes": [
                "Do not change source URLs, source IDs, evidence IDs, row hashes, seed identity, official codes, salary values, AI impact scores, or runtime SEO.",
                "Do not invent new facts or use competitor copy.",
            ],
            "source_refs_to_use": [row["source_baseline_ref"]],
            "max_repair_scope": "selected reader-facing fields only; use existing completed block evidence",
            "human_review_required": any(f["requires_human_review"] for f in row["findings"]),
        })
    return {
        "generated_at": utc_now(),
        "plan_type": "career_content_editorial_repair_plan",
        "repairs": repairs,
        "content_rewritten": False,
        "baseline_mutated": False,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--page-assembly", default="generated/career-page-assembly-v1-1046-pass-baseline/career_page_assembly_1046_v1.jsonl")
    parser.add_argument("--seed", default="generated/career-salary-seed/career_jobs_1046_salary_asset_seed.json")
    parser.add_argument("--sample-manifest")
    parser.add_argument("--output-dir", default="generated/career-content-editorial-quality-gate")
    args = parser.parse_args()

    page_path = Path(args.page_assembly)
    seed_path = Path(args.seed)
    if not page_path.exists():
        raise SystemExit(f"Missing page assembly baseline: {page_path}")
    if not seed_path.exists():
        raise SystemExit(f"Missing seed: {seed_path}")

    seed_rows = read_seed(seed_path)
    seed_by_slug = {str(row.get("slug")): row for row in seed_rows}
    sample_slugs = load_sample_slugs(Path(args.sample_manifest) if args.sample_manifest else None, seed_rows)
    page_rows = rows_by_slug_locale(page_path)
    selected_page_rows = [page_rows[(slug, locale)] for slug in sample_slugs for locale in LOCALES if (slug, locale) in page_rows]
    phrase_counts = phrase_reuse(selected_page_rows)
    generated_at = utc_now()

    scored_rows = []
    all_findings = []
    for slug in sample_slugs:
        for locale in LOCALES:
            row = page_rows.get((slug, locale))
            if not row:
                finding = {
                    "finding_id": f"missing_row:{slug}:{locale}",
                    "severity": "blocked",
                    "finding_type": "unsupported_fact_risk",
                    "slug": slug,
                    "locale": locale,
                    "field_path": "$",
                    "excerpt": "",
                    "reason": "Missing slug-locale row in page assembly baseline.",
                    "repair_instruction": "Restore the missing assembled row from completed PASS block assets.",
                    "repair_allowed_without_source_change": False,
                    "requires_human_review": True,
                }
                all_findings.append(finding)
                continue
            title = seed_title(seed_by_slug.get(slug, {"slug": slug}), locale)
            scores, findings = score_row(row, title, phrase_counts)
            status = "editorial_ready"
            if any(f["severity"] == "blocked" for f in findings):
                status = "blocked"
            elif findings or scores["overall_editorial_score"] < 3.5:
                status = "editorial_repair_required"
            block_refs = row.get("block_refs") or {}
            baseline_refs = sorted({str(ref.get("baseline_path") or ref.get("status")) for ref in block_refs.values() if isinstance(ref, dict)})
            source_ref = ";".join(baseline_refs) or str(page_path)
            scored = {
                "block": str(row.get("block_type") or "career-page-assembly"),
                "slug": slug,
                "locale": locale,
                "row_ref": f"{page_path}#{slug}:{locale}",
                "source_baseline_ref": source_ref,
                **scores,
                "status": status,
                "findings": findings,
                "recommended_repair_scope": sorted({f["finding_type"] for f in findings}),
                "do_not_modify_fields": DO_NOT_MODIFY_FIELDS,
                "source_traceability_boundary": "Use completed PASS block refs only; do not add new facts in page assembly.",
                "generated_at": generated_at,
            }
            scored_rows.append(scored)
            all_findings.extend(findings)

    summary = {
        "sample_slug_count": len(sample_slugs),
        "audited_rows": len(scored_rows),
        "finding_count": len(all_findings),
        "blocked_count": sum(1 for row in scored_rows if row["status"] == "blocked"),
        "repair_required_count": sum(1 for row in scored_rows if row["status"] == "editorial_repair_required"),
        "editorial_ready_count": sum(1 for row in scored_rows if row["status"] == "editorial_ready"),
        "repeated_phrase_group_count": len(phrase_counts),
        "final_conclusion": "EDITORIAL_REPAIR_RECOMMENDED" if all_findings else "EDITORIAL_SAMPLE_READY",
    }
    report = {
        "generated_at": generated_at,
        "report_type": "career_content_editorial_quality_report",
        "input_refs": {
            "page_assembly": str(page_path),
            "seed": str(seed_path),
            "sample_manifest": args.sample_manifest,
        },
        "summary": summary,
        "rows": scored_rows,
        "findings": all_findings,
        "runtime_modified": False,
        "seo_modified": False,
        "cms_imported": False,
        "staging_created": False,
        "production_imported": False,
        "search_projection_generated": False,
    }
    repair_plan = build_repair_plan(scored_rows)
    output_dir = Path(args.output_dir)
    write_json(output_dir / "editorial_quality_report.json", report)
    write_json(output_dir / "editorial_repair_plan.json", repair_plan)
    write_json(output_dir / "phrase_reuse_groups.json", phrase_counts)
    write_csv(
        output_dir / "editorial_quality_findings.csv",
        all_findings,
        ["finding_id", "severity", "finding_type", "slug", "locale", "field_path", "excerpt", "reason", "repair_instruction", "repair_allowed_without_source_change", "requires_human_review"],
    )
    score_rows = [{k: v for k, v in row.items() if k not in {"findings", "do_not_modify_fields", "recommended_repair_scope"}} for row in scored_rows]
    write_csv(
        output_dir / "editorial_quality_scores.csv",
        score_rows,
        ["block", "slug", "locale", "overall_editorial_score", "occupation_specificity_score", "workflow_density_score", "reader_usefulness_score", "template_reuse_score", "locale_naturalness_score", "conversion_clarity_score", "competitive_depth_score", "source_backed_claim_density_score", "block_relevance_score", "reader_safe_boundary_score", "status", "row_ref", "source_baseline_ref", "source_traceability_boundary", "generated_at"],
    )
    md = "# Career Content Editorial Quality Sample Audit\n\n"
    md += f"- final_conclusion: `{summary['final_conclusion']}`\n"
    md += f"- sample_slug_count: `{summary['sample_slug_count']}`\n"
    md += f"- audited_rows: `{summary['audited_rows']}`\n"
    md += f"- finding_count: `{summary['finding_count']}`\n"
    md += f"- blocked_count: `{summary['blocked_count']}`\n"
    md += f"- repair_required_count: `{summary['repair_required_count']}`\n"
    md += f"- repeated_phrase_group_count: `{summary['repeated_phrase_group_count']}`\n"
    md += "\nThis is a read-only quality gate. Findings are repair recommendations, not content rewrites.\n\n"
    md += "## Top Findings\n\n"
    md += markdown_table(all_findings, ["severity", "finding_type", "slug", "locale", "reason"], 30)
    (output_dir / "editorial_quality_report.md").write_text(md, encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
