#!/usr/bin/env python3
"""Generate a reference-only career page assembly ledger from PASS block assets."""

from __future__ import annotations

import argparse
from pathlib import Path

from page_assembly_common import (
    MATURE_REGISTERED_BLOCKS,
    REQUIRED_COMPLETE_BLOCKS,
    SOURCE_DISCLOSURE_SECTION,
    build_source_section,
    canonical_hash,
    extract_row_hash,
    index_assets,
    load_seed,
    make_sha_manifest,
    utc_now,
    write_csv,
    write_json,
    write_jsonl,
)


def build_rows(repo_root: Path, seed_path: Path) -> tuple[list[dict], dict[str, dict]]:
    seed_rows = load_seed(repo_root, seed_path)
    asset_indexes = {
        block: index_assets(repo_root, block, config)
        for block, config in REQUIRED_COMPLETE_BLOCKS.items()
    }
    output_rows: list[dict] = []
    coverage: dict[str, dict] = {}
    for seed in seed_rows:
        slug = seed["slug"]
        occ = seed.get("occupation", {})
        coverage[slug] = {"slug": slug, "missing": []}
        for locale in ("zh-CN", "en"):
            sections: list[dict] = []
            block_refs: dict[str, dict] = {}
            missing_blocks: list[dict] = []

            for block, config in REQUIRED_COMPLETE_BLOCKS.items():
                source_row = asset_indexes[block].get((slug, locale))
                if source_row is None:
                    status = "missing"
                    row_hash = None
                    omission = f"{block} PASS row missing for {slug}/{locale}"
                    missing_blocks.append({"block": block, "locale": locale, "reason": omission})
                    coverage[slug]["missing"].append(f"{block}:{locale}")
                else:
                    status = "available"
                    row_hash = extract_row_hash(source_row)
                    omission = None
                block_refs[block] = {
                    "status": status,
                    "baseline_path": config["baseline"],
                    "source_row_hash": row_hash,
                    "locale": locale,
                }
                for section_key, priority in config["sections"]:
                    sections.append(
                        build_source_section(
                            section_key=section_key,
                            source_block=block,
                            slug=slug,
                            locale=locale,
                            priority=priority,
                            baseline_path=config["baseline"],
                            source_row_hash=row_hash,
                            status=status,
                            omission_reason=omission,
                        )
                    )

            for block, config in MATURE_REGISTERED_BLOCKS.items():
                proof_artifacts = list(config["proof_artifacts"])
                block_refs[block] = {
                    "status": "mature_registered",
                    "baseline_path": None,
                    "proof_artifacts": proof_artifacts,
                    "locale": locale,
                }
                for section_key, priority in config["sections"]:
                    sections.append(
                        build_source_section(
                            section_key=section_key,
                            source_block=block,
                            slug=slug,
                            locale=locale,
                            priority=priority,
                            baseline_path=None,
                            source_row_hash=None,
                            status="mature_registered",
                            omission_reason=None,
                            proof_artifacts=proof_artifacts,
                        )
                    )

            section_key, priority = SOURCE_DISCLOSURE_SECTION
            sections.append(
                build_source_section(
                    section_key=section_key,
                    source_block="career-page-assembly",
                    slug=slug,
                    locale=locale,
                    priority=priority,
                    baseline_path=None,
                    source_row_hash=None,
                    status="available",
                    omission_reason=None,
                )
            )

            sections.sort(key=lambda section: (section["display_priority"], section["section_key"]))
            row = {
                "ledger_type": "career-page-assembly",
                "asset_version": "career_page_assembly_v1",
                "block_type": "career-page-assembly",
                "slug": slug,
                "seed_ordinal": int(seed["ordinal"]),
                "locale": locale,
                "occupation": {
                    "title_en": occ.get("title_en", ""),
                    "title_zh": occ.get("title_zh", ""),
                    "soc_code": occ.get("soc_code", ""),
                    "onet_code": occ.get("onet_code", ""),
                },
                "page_sections": sections,
                "section_order": [section["section_key"] for section in sections],
                "block_refs": block_refs,
                "source_coverage": {
                    "complete_block_count": sum(
                        1 for block in REQUIRED_COMPLETE_BLOCKS if block_refs[block]["status"] == "available"
                    ),
                    "mature_registered_block_count": len(MATURE_REGISTERED_BLOCKS),
                    "missing_block_count": len(missing_blocks),
                },
                "missing_blocks": missing_blocks,
                "reader_boundary": "This page assembly row is a reference map to PASS career content blocks and mature registered salary/AI Impact blocks.",
                "no_new_fact_boundary": "No occupational facts, salary facts, AI impact claims, fit claims, or adjacent-career claims are generated in page assembly.",
                "search_projection_quarantine_status": "not_generated_or_activated",
                "runtime_boundary": "This row contains assembly references only and no release instruction.",
                "audit_fields": {
                    "source_block_count": len(block_refs),
                    "generated_at": utc_now(),
                    "row_hash": "",
                },
            }
            row["audit_fields"]["row_hash"] = canonical_hash({k: v for k, v in row.items() if k != "audit_fields"})
            output_rows.append(row)
    return output_rows, coverage


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--seed", default="generated/career-salary-seed/career_jobs_1046_salary_asset_seed.json")
    parser.add_argument("--output-dir", default="generated/career-page-assembly-v1-1046")
    args = parser.parse_args()

    repo_root = Path(args.repo_root).resolve()
    output_dir = repo_root / args.output_dir
    rows, coverage = build_rows(repo_root, Path(args.seed))
    ledger = output_dir / "career_page_assembly_1046_v1.jsonl"
    write_jsonl(ledger, rows)

    missing_rows = []
    block_rows = []
    source_rows = []
    for row in rows:
        for block, ref in row["block_refs"].items():
            block_rows.append(
                {
                    "slug": row["slug"],
                    "locale": row["locale"],
                    "block": block,
                    "status": ref["status"],
                    "baseline_path": ref.get("baseline_path") or "",
                    "source_row_hash": ref.get("source_row_hash") or "",
                }
            )
        for missing in row["missing_blocks"]:
            missing_rows.append({"slug": row["slug"], "locale": row["locale"], **missing})
        for section in row["page_sections"]:
            source_rows.append(
                {
                    "slug": row["slug"],
                    "locale": row["locale"],
                    "section_key": section["section_key"],
                    "source_block": section["source_block"],
                    "availability_status": section["availability_status"],
                    "source_baseline_path": section.get("source_baseline_path") or "",
                    "source_row_hash": section.get("source_row_hash") or "",
                }
            )

    validation = {
        "final_conclusion": "CAREER_PAGE_ASSEMBLY_GENERATED",
        "asset_rows": len(rows),
        "total_slugs": len(coverage),
        "zh_CN_rows": sum(1 for row in rows if row["locale"] == "zh-CN"),
        "en_rows": sum(1 for row in rows if row["locale"] == "en"),
        "missing_block_rows": len(missing_rows),
        "search_projection_generated": False,
        "runtime_modified": False,
        "seo_modified": False,
        "cms_imported": False,
        "staging_created": False,
        "production_imported": False,
    }
    write_json(output_dir / "career_page_assembly_1046_v1_validation.json", validation)
    write_csv(output_dir / "career_page_assembly_sources_coverage.csv", source_rows, ["slug", "locale", "section_key", "source_block", "availability_status", "source_baseline_path", "source_row_hash"])
    write_csv(output_dir / "career_page_assembly_block_coverage.csv", block_rows, ["slug", "locale", "block", "status", "baseline_path", "source_row_hash"])
    write_csv(output_dir / "career_page_assembly_missing_blocks.csv", missing_rows, ["slug", "locale", "block", "reason"])
    report = [
        "# Career Page Assembly Generation Report",
        "",
        f"- asset_rows: {validation['asset_rows']}",
        f"- total_slugs: {validation['total_slugs']}",
        f"- missing_block_rows: {validation['missing_block_rows']}",
        "- search_projection_generated: false",
        "- runtime/SEO/CMS/staging/production: not modified",
    ]
    (output_dir / "career_page_assembly_generation_report.md").write_text("\n".join(report) + "\n", encoding="utf-8")
    write_json(output_dir / "sha256_manifest.json", make_sha_manifest(output_dir))
    print(f"generated {len(rows)} page assembly rows in {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
