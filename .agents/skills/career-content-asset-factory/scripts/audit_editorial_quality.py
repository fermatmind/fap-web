#!/usr/bin/env python3
"""Run a read-only competitive editorial quality audit."""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path

from editorial_quality_common import (
    DO_NOT_MODIFY_FIELDS,
    LOCALES,
    markdown_table,
    phrase_reuse,
    iter_jsonl,
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


DEFAULT_BLOCK_ASSETS = {
    "career-identity": "generated/career-identity-v1-1046-pass-baseline-final/assets/assets.jsonl",
    "career-work-activities": "generated/career-work-activities-v1-1046-pass-baseline-final-repaired/assets/career_work_activities_1046_assets_repaired.jsonl",
    "career-skills-entry": "generated/career-skills-entry-v1-1046-pass-baseline-final/assets/assets.jsonl",
    "career-fit": "generated/career-fit-v1-batch-1046-pass-baseline/assets/assets.jsonl",
    "career-adjacent-comparison": "generated/career-adjacent-comparison-v1-batch-1046-pass-baseline/assets/assets.jsonl",
}


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


def parse_block_asset_args(items: list[str] | None) -> dict[str, Path]:
    if not items:
        return {block: Path(path) for block, path in DEFAULT_BLOCK_ASSETS.items()}
    parsed: dict[str, Path] = {}
    for item in items:
        if "=" not in item:
            raise SystemExit(f"Invalid --block-asset value, expected block=path: {item}")
        block, raw_path = item.split("=", 1)
        block = block.strip()
        path = Path(raw_path.strip())
        if not block:
            raise SystemExit(f"Invalid --block-asset block name: {item}")
        parsed[block] = path
    return parsed


def load_block_asset_rows(block_assets: dict[str, Path]) -> tuple[dict[tuple[str, str, str], dict], list[dict]]:
    rows: dict[tuple[str, str, str], dict] = {}
    manifest_rows: list[dict] = []
    for block, path in block_assets.items():
        if not path.exists():
            raise SystemExit(f"Missing {block} asset baseline: {path}")
        row_count = 0
        for row in iter_jsonl(path):
            slug = str(row.get("slug") or "")
            locale = str(row.get("locale") or "")
            if not slug or not locale:
                continue
            row = dict(row)
            row["block_type"] = str(row.get("block_type") or block)
            row["_editorial_source_path"] = str(path)
            rows[(block, slug, locale)] = row
            row_count += 1
        manifest_rows.append({
            "block": block,
            "path": str(path),
            "row_count": row_count,
        })
    return rows, manifest_rows


def write_repair_batches(output_path: Path, rows: list[dict], seed_by_slug: dict[str, dict]) -> dict:
    grouped: dict[int, dict] = {}
    for row in rows:
        if row["status"] == "editorial_ready":
            continue
        seed_row = seed_by_slug.get(row["slug"], {})
        ordinal = int(seed_row.get("ordinal") or row.get("seed_ordinal") or 0)
        if ordinal <= 0:
            batch_index = 0
            start_ordinal = 0
            end_ordinal = 0
        else:
            batch_index = ((ordinal - 1) // 50) + 1
            start_ordinal = ((batch_index - 1) * 50) + 1
            end_ordinal = min(batch_index * 50, 1046)
        key = batch_index
        batch = grouped.setdefault(key, {
            "batch_index": batch_index,
            "start_ordinal": start_ordinal,
            "end_ordinal": end_ordinal,
            "slug_count": 0,
            "row_count": 0,
            "finding_count": 0,
            "by_type": {},
            "by_category": {},
            "slugs": set(),
        })
        batch["row_count"] += 1
        batch["slugs"].add(row["slug"])
        for finding in row["findings"]:
            batch["finding_count"] += 1
            typ = finding["finding_type"]
            batch["by_type"][typ] = batch["by_type"].get(typ, 0) + 1
            category = classify_finding_category(finding)
            batch["by_category"][category] = batch["by_category"].get(category, 0) + 1
    batches = []
    for batch in sorted(grouped.values(), key=lambda item: item["batch_index"]):
        batch["slug_count"] = len(batch["slugs"])
        batch["slugs"] = sorted(batch["slugs"], key=lambda slug: int(seed_by_slug.get(slug, {}).get("ordinal") or 999999))
        batches.append(batch)
    data = {
        "generated_at": utc_now(),
        "batching": "seed_ordinal_groups_of_50",
        "batches": batches,
    }
    write_json(output_path, data)
    return data


def classify_finding_category(finding: dict) -> str:
    kind = finding.get("finding_type")
    locale = finding.get("locale")
    if kind == "locale_naturalness_issue":
        return "zh_locale_naturalness" if locale == "zh-CN" else "en_locale_naturalness"
    if kind == "conversion_unclear":
        return "conversion_cta"
    if kind == "generic_template":
        return "template_risk"
    if kind in {"raw_enum_leakage", "CTA_outcome_promise", "unsupported_fact_risk"}:
        return "blocked_or_safety"
    return "true_content_repair"


def write_block_outputs(output_dir: Path, block: str, rows: list[dict], findings: list[dict], seed_by_slug: dict[str, dict]) -> dict:
    block_dir = output_dir / "per_block" / block
    block_dir.mkdir(parents=True, exist_ok=True)
    repair_plan = build_repair_plan(rows)
    write_json(block_dir / "editorial_repair_plan.json", repair_plan)
    write_repair_batches(block_dir / "repair_batches_50.json", rows, seed_by_slug)
    write_csv(
        block_dir / "editorial_quality_findings.csv",
        findings,
        ["block", "finding_id", "severity", "finding_type", "slug", "locale", "field_path", "excerpt", "reason", "repair_instruction", "repair_allowed_without_source_change", "requires_human_review"],
    )
    score_rows = [{k: v for k, v in row.items() if k not in {"findings", "do_not_modify_fields", "recommended_repair_scope"}} for row in rows]
    write_csv(
        block_dir / "editorial_quality_scores.csv",
        score_rows,
        ["block", "slug", "locale", "seed_ordinal", "overall_editorial_score", "occupation_specificity_score", "workflow_density_score", "reader_usefulness_score", "template_reuse_score", "locale_naturalness_score", "conversion_clarity_score", "competitive_depth_score", "source_backed_claim_density_score", "block_relevance_score", "reader_safe_boundary_score", "status", "row_ref", "source_baseline_ref", "source_traceability_boundary", "generated_at"],
    )
    summary = {
        "block": block,
        "audited_rows": len(rows),
        "finding_count": len(findings),
        "blocked_count": sum(1 for row in rows if row["status"] == "blocked"),
        "repair_required_count": sum(1 for row in rows if row["status"] == "editorial_repair_required"),
        "editorial_ready_count": sum(1 for row in rows if row["status"] == "editorial_ready"),
        "finding_counts_by_type": dict(sorted(counter_by(findings, "finding_type").items())),
        "finding_counts_by_category": dict(sorted(counter_by([dict(f, category=classify_finding_category(f)) for f in findings], "category").items())),
    }
    write_json(block_dir / "editorial_quality_summary.json", summary)
    md = f"# {block} Editorial Quality Audit\n\n"
    for key, value in summary.items():
        if key.startswith("finding_counts"):
            continue
        md += f"- {key}: `{value}`\n"
    md += "\n## Top Findings\n\n"
    md += markdown_table(findings, ["severity", "finding_type", "slug", "locale", "reason"], 30)
    (block_dir / "editorial_quality_summary.md").write_text(md, encoding="utf-8")
    return summary


def counter_by(rows: list[dict], key: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for row in rows:
        value = str(row.get(key) or "")
        if not value:
            continue
        counts[value] = counts.get(value, 0) + 1
    return counts


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--audit-mode", choices=["page-assembly", "block-assets"], default="page-assembly")
    parser.add_argument("--page-assembly", default="generated/career-page-assembly-v1-1046-pass-baseline/career_page_assembly_1046_v1.jsonl")
    parser.add_argument("--block-asset", action="append", help="Block asset source in block=path form. Defaults to the five completed content blocks in block-assets mode.")
    parser.add_argument("--seed", default="generated/career-salary-seed/career_jobs_1046_salary_asset_seed.json")
    parser.add_argument("--sample-manifest")
    parser.add_argument("--output-dir", default="generated/career-content-editorial-quality-gate")
    args = parser.parse_args()

    seed_path = Path(args.seed)
    page_path = Path(args.page_assembly)
    if args.audit_mode == "page-assembly" and not page_path.exists():
        raise SystemExit(f"Missing page assembly baseline: {page_path}")
    if not seed_path.exists():
        raise SystemExit(f"Missing seed: {seed_path}")

    seed_rows = read_seed(seed_path)
    seed_by_slug = {str(row.get("slug")): row for row in seed_rows}
    sample_slugs = load_sample_slugs(Path(args.sample_manifest) if args.sample_manifest else None, seed_rows)
    selected_rows: list[dict] = []
    input_refs: dict = {
        "seed": str(seed_path),
        "sample_manifest": args.sample_manifest,
        "audit_mode": args.audit_mode,
    }
    if args.audit_mode == "page-assembly":
        page_rows = rows_by_slug_locale(page_path)
        selected_rows = [page_rows[(slug, locale)] for slug in sample_slugs for locale in LOCALES if (slug, locale) in page_rows]
        block_asset_rows: dict[tuple[str, str, str], dict] = {}
        block_manifest_rows: list[dict] = []
        input_refs["page_assembly"] = str(page_path)
    else:
        block_assets = parse_block_asset_args(args.block_asset)
        block_asset_rows, block_manifest_rows = load_block_asset_rows(block_assets)
        for block in block_assets:
            for slug in sample_slugs:
                for locale in LOCALES:
                    row = block_asset_rows.get((block, slug, locale))
                    if row:
                        selected_rows.append(row)
        input_refs["block_assets"] = block_manifest_rows
    phrase_counts = phrase_reuse(selected_rows, audit_mode=args.audit_mode)
    generated_at = utc_now()

    scored_rows = []
    all_findings = []
    missing_expected: list[tuple[str, str, str]] = []
    expected_blocks = ["career-page-assembly"] if args.audit_mode == "page-assembly" else list(parse_block_asset_args(args.block_asset).keys())
    for block in expected_blocks:
        for slug in sample_slugs:
            for locale in LOCALES:
                if args.audit_mode == "page-assembly":
                    row = page_rows.get((slug, locale))
                else:
                    row = block_asset_rows.get((block, slug, locale))
                if not row:
                    missing_expected.append((block, slug, locale))
                    finding = {
                        "finding_id": f"missing_row:{block}:{slug}:{locale}",
                        "severity": "blocked",
                        "finding_type": "unsupported_fact_risk",
                        "block": block,
                        "slug": slug,
                        "locale": locale,
                        "field_path": "$",
                        "excerpt": "",
                        "reason": f"Missing {block} slug-locale row in editorial audit input.",
                        "repair_instruction": "Restore the missing row from completed PASS block assets.",
                        "repair_allowed_without_source_change": False,
                        "requires_human_review": True,
                    }
                    all_findings.append(finding)
                    continue
                title = seed_title(seed_by_slug.get(slug, {"slug": slug}), locale)
                scores, findings = score_row(row, title, phrase_counts, audit_mode=args.audit_mode)
                status = "editorial_ready"
                if any(f["severity"] == "blocked" for f in findings):
                    status = "blocked"
                elif findings or scores["overall_editorial_score"] < 3.5:
                    status = "editorial_repair_required"
                block_refs = row.get("block_refs") or {}
                baseline_refs = sorted({str(ref.get("baseline_path") or ref.get("status")) for ref in block_refs.values() if isinstance(ref, dict)})
                source_path = str(row.get("_editorial_source_path") or page_path)
                source_ref = ";".join(baseline_refs) or source_path
                scored = {
                    "block": str(row.get("block_type") or block),
                    "slug": slug,
                    "locale": locale,
                    "seed_ordinal": seed_by_slug.get(slug, {}).get("ordinal") or row.get("seed_ordinal"),
                    "row_ref": f"{source_path}#{slug}:{locale}",
                    "source_baseline_ref": source_ref,
                    **scores,
                    "status": status,
                    "findings": findings,
                    "recommended_repair_scope": sorted({f["finding_type"] for f in findings}),
                    "do_not_modify_fields": DO_NOT_MODIFY_FIELDS,
                    "source_traceability_boundary": "Use completed PASS block assets only; do not add new facts in editorial repair.",
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
        "audit_mode": args.audit_mode,
        "missing_expected_rows": len(missing_expected),
        "final_conclusion": "EDITORIAL_REPAIR_RECOMMENDED" if all_findings else "EDITORIAL_SAMPLE_READY",
    }
    report = {
        "generated_at": generated_at,
        "report_type": "career_content_editorial_quality_report",
        "input_refs": input_refs,
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
        ["block", "finding_id", "severity", "finding_type", "slug", "locale", "field_path", "excerpt", "reason", "repair_instruction", "repair_allowed_without_source_change", "requires_human_review"],
    )
    score_rows = [{k: v for k, v in row.items() if k not in {"findings", "do_not_modify_fields", "recommended_repair_scope"}} for row in scored_rows]
    write_csv(
        output_dir / "editorial_quality_scores.csv",
        score_rows,
        ["block", "slug", "locale", "seed_ordinal", "overall_editorial_score", "occupation_specificity_score", "workflow_density_score", "reader_usefulness_score", "template_reuse_score", "locale_naturalness_score", "conversion_clarity_score", "competitive_depth_score", "source_backed_claim_density_score", "block_relevance_score", "reader_safe_boundary_score", "status", "row_ref", "source_baseline_ref", "source_traceability_boundary", "generated_at"],
    )
    write_repair_batches(output_dir / "repair_batches_50.json", scored_rows, seed_by_slug)
    if args.audit_mode == "block-assets":
        per_block_summary = []
        rows_by_block: dict[str, list[dict]] = defaultdict(list)
        findings_by_block: dict[str, list[dict]] = defaultdict(list)
        for row in scored_rows:
            rows_by_block[str(row["block"])].append(row)
        for finding in all_findings:
            findings_by_block[str(finding.get("block") or "unknown")].append(finding)
        for block in sorted(rows_by_block):
            per_block_summary.append(write_block_outputs(output_dir, block, rows_by_block[block], findings_by_block.get(block, []), seed_by_slug))
        write_json(output_dir / "block_editorial_quality_summary.json", {
            "generated_at": generated_at,
            "audit_mode": args.audit_mode,
            "blocks": per_block_summary,
        })
        write_json(output_dir / "block_asset_manifest.json", {
            "generated_at": generated_at,
            "block_assets": block_manifest_rows,
            "sample_slug_count": len(sample_slugs),
        })
    md = "# Career Content Editorial Quality Sample Audit\n\n"
    md += f"- final_conclusion: `{summary['final_conclusion']}`\n"
    md += f"- audit_mode: `{summary['audit_mode']}`\n"
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
