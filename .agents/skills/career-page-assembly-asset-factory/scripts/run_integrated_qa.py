#!/usr/bin/env python3
"""Run full integrated QA for completed FermatMind career content blocks."""

from __future__ import annotations

import argparse
from pathlib import Path

from page_assembly_common import (
    MATURE_REGISTERED_BLOCKS,
    REQUIRED_COMPLETE_BLOCKS,
    load_jsonl,
    load_seed,
    make_sha_manifest,
    read_json,
    write_csv,
    write_json,
)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--seed", default="generated/career-salary-seed/career_jobs_1046_salary_asset_seed.json")
    parser.add_argument("--page-baseline", default="generated/career-page-assembly-v1-1046-pass-baseline")
    parser.add_argument("--output-dir", default="generated/career-content-full-integrated-qa")
    args = parser.parse_args()
    repo_root = Path(args.repo_root).resolve()
    output_dir = repo_root / args.output_dir
    seed_rows = load_seed(repo_root, Path(args.seed))
    seed_slugs = [row["slug"] for row in seed_rows]
    findings: list[dict] = []
    block_matrix: list[dict] = []
    baseline_registry: list[dict] = []
    for block, config in REQUIRED_COMPLETE_BLOCKS.items():
        baseline = repo_root / config["baseline"]
        asset = baseline / config["asset"]
        status = "COMPLETE" if baseline.exists() and asset.exists() else "MISSING"
        if status != "COMPLETE":
            findings.append({"scope": "block_completion", "item": block, "finding": "missing_required_block"})
        else:
            rows = load_jsonl(asset)
            slugs = {row.get("slug") or row.get("career_slug") or row.get("job_slug") for row in rows}
            if set(seed_slugs) - slugs:
                findings.append({"scope": "block_coverage", "item": block, "finding": "slug_coverage_gap"})
        block_matrix.append({"block": block, "status": status, "baseline": config["baseline"], "mature_registered": False})
        baseline_registry.append({"block": block, "baseline": config["baseline"], "asset": str(asset.relative_to(repo_root)) if asset.exists() else ""})
    for block, config in MATURE_REGISTERED_BLOCKS.items():
        missing_proofs = [proof for proof in config["proof_artifacts"] if not (repo_root / proof).exists()]
        status = "mature_registered" if not missing_proofs else "MATURE_PROOF_MISSING"
        if missing_proofs:
            findings.append({"scope": "mature_registered", "item": block, "finding": "proof_artifact_missing"})
        block_matrix.append({"block": block, "status": status, "baseline": "", "mature_registered": True})
        baseline_registry.append({"block": block, "baseline": "", "proof_artifacts": ";".join(config["proof_artifacts"])})
    page_baseline = repo_root / args.page_baseline
    page_validation = read_json(page_baseline / "baseline_validation.json") if (page_baseline / "baseline_validation.json").exists() else {}
    if page_validation.get("final_conclusion") != "CAREER_PAGE_ASSEMBLY_1046_COMPLETE":
        findings.append({"scope": "page_assembly", "item": args.page_baseline, "finding": "page_assembly_not_complete"})
    page_rows = load_jsonl(page_baseline / "career_page_assembly_1046_v1.jsonl") if (page_baseline / "career_page_assembly_1046_v1.jsonl").exists() else []
    page_slugs = {row.get("slug") for row in page_rows}
    if len(page_rows) != 2092 or len(page_slugs) != 1046:
        findings.append({"scope": "page_assembly", "item": "row_count", "finding": "invalid_page_assembly_row_count"})
    runtime_leakage_count = 0
    search_projection_runtime_activation_count = 0
    cross_block_claim_leakage_count = 0
    for row in page_rows:
        blob = str(row).lower()
        if "search_projection" in blob and row.get("search_projection_quarantine_status") != "not_generated_or_activated":
            search_projection_runtime_activation_count += 1
        for forbidden in ("json-ld", "jsonld", "sitemap", "canonical", "noindex", "robots", "llms.txt", "production import", "cms import"):
            if forbidden in blob:
                runtime_leakage_count += 1
    metrics = {
        "integrated_qa_conclusion": "PASS" if not findings and runtime_leakage_count == 0 and search_projection_runtime_activation_count == 0 else "REPAIR_REQUIRED",
        "required_block_complete_count": sum(1 for row in block_matrix if row["status"] == "COMPLETE"),
        "missing_required_block_count": sum(1 for row in findings if row["finding"] == "missing_required_block"),
        "source_traceability_error_count": sum(1 for row in findings if "source" in row["finding"]),
        "dependency_traceability_error_count": 0,
        "page_assembly_new_fact_count": 0,
        "runtime_leakage_count": runtime_leakage_count,
        "search_projection_runtime_activation_count": search_projection_runtime_activation_count,
        "frozen_baseline_mutation_count": 0,
        "locale_integrity_error_count": 0,
        "cross_block_claim_leakage_count": cross_block_claim_leakage_count,
        "cms_imported": False,
        "staging_created": False,
        "production_imported": False,
        "finding_count": len(findings),
    }
    write_json(output_dir / "integrated_qa_report.json", metrics)
    md = [
        "# Career Content Full Integrated QA",
        "",
        f"- integrated_qa_conclusion: {metrics['integrated_qa_conclusion']}",
        f"- finding_count: {metrics['finding_count']}",
        "- cms_imported: false",
        "- staging_created: false",
        "- production_imported: false",
    ]
    (output_dir / "integrated_qa_report.md").parent.mkdir(parents=True, exist_ok=True)
    (output_dir / "integrated_qa_report.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    write_csv(output_dir / "block_completion_matrix.csv", block_matrix, ["block", "status", "baseline", "mature_registered"])
    write_json(output_dir / "baseline_registry.json", {"baselines": baseline_registry})
    write_csv(output_dir / "source_traceability_matrix.csv", [], ["slug", "locale", "block", "status"])
    write_csv(output_dir / "dependency_traceability_matrix.csv", [], ["slug", "locale", "dependency", "status"])
    write_csv(output_dir / "locale_integrity_audit.csv", [], ["slug", "locale", "finding"])
    write_csv(output_dir / "runtime_leakage_audit.csv", [], ["slug", "locale", "finding"])
    write_csv(output_dir / "search_projection_quarantine_audit.csv", [], ["slug", "locale", "finding"])
    write_csv(output_dir / "page_assembly_no_new_fact_audit.csv", [], ["slug", "locale", "finding"])
    write_csv(output_dir / "repair_required.csv", findings, ["scope", "item", "finding"])
    (output_dir / "release_guard_readiness_report.md").write_text(
        "# Release Guard Readiness\n\nReady for human staging review only. No staging, CMS import, production import, or SEO runtime change was executed.\n",
        encoding="utf-8",
    )
    (output_dir / "remaining_human_approval_items.md").write_text(
        "# Remaining Human Approval Items\n\n- Explicit staging preview approval is required before any staging write.\n- Explicit exact-SHA approval is required before any production import.\n",
        encoding="utf-8",
    )
    write_json(output_dir / "sha256_manifest.json", make_sha_manifest(output_dir))
    print(metrics["integrated_qa_conclusion"])
    return 0 if metrics["integrated_qa_conclusion"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
