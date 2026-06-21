#!/usr/bin/env python3
"""Run a read-only career content staging preview dry-run.

This harness validates the 50-slug staging preview design scope against the
frozen page-assembly baseline and emits reader-safe API projection samples.
It does not write staging rows, CMS rows, runtime files, SEO files, or
production import records.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


FORBIDDEN_READER_KEYS = {
    "audit_fields",
    "evidence_id",
    "evidence_ids",
    "evidence_used",
    "source_id",
    "source_ids",
    "source_row_hash",
    "row_hash",
    "search_projection",
    "score_rationale",
    "internal_lineage",
    "lineage",
}

FORBIDDEN_READER_TERMS = {
    "search_projection",
    "candidate_only",
    "backend projection review",
    "audit_fields",
    "evidence_id",
    "source_id",
    "row_hash",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                rows.append(json.loads(line))
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def write_csv(path: Path, rows: list[dict[str, Any]], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fieldnames})


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_seed(seed_path: Path) -> dict[str, dict[str, Any]]:
    payload = read_json(seed_path)
    rows = payload if isinstance(payload, list) else payload.get("jobs", [])
    return {row["slug"]: row for row in rows}


def walk_payload(value: Any):
    if isinstance(value, dict):
        for key, child in value.items():
            yield key, child
            yield from walk_payload(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_payload(child)


def reader_projection_from_assembly(row: dict[str, Any]) -> dict[str, Any]:
    sections = []
    for section in row.get("page_sections", []):
        sections.append(
            {
                "key": section.get("section_key"),
                "available": section.get("availability_status") in {"available", "mature_registered"},
                "display_priority": section.get("display_priority"),
            }
        )
    return {
        "slug": row.get("slug"),
        "locale": row.get("locale"),
        "preview": True,
        "status": "dry_run_preview_candidate",
        "asset_version": row.get("asset_version"),
        "occupation": row.get("occupation"),
        "section_order": row.get("section_order", []),
        "sections": sections,
        "reader_boundary": "Preview payload is assembled from PASS or mature registered blocks and contains no new career facts.",
    }


def validate_reader_projection(payload: dict[str, Any]) -> list[str]:
    findings: list[str] = []
    for key, _child in walk_payload(payload):
        if str(key) in FORBIDDEN_READER_KEYS:
            findings.append(f"forbidden_key:{key}")
    text = json.dumps(payload, ensure_ascii=False, sort_keys=True).lower()
    for term in FORBIDDEN_READER_TERMS:
        if term in text:
            findings.append(f"forbidden_term:{term}")
    return findings


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--design-manifest", default="generated/career-content-staging-preview-design/staging_preview_scope_manifest.json")
    parser.add_argument("--output-dir", default="generated/career-content-staging-preview-dry-run")
    parser.add_argument("--seed", default="generated/career-salary-seed/career_jobs_1046_salary_asset_seed.json")
    args = parser.parse_args()

    repo_root = Path(args.repo_root).resolve()
    output_dir = repo_root / args.output_dir
    design = read_json(repo_root / args.design_manifest)
    seed_by_slug = load_seed(repo_root / args.seed)

    page_baseline = repo_root / design["inputs"]["page_assembly_baseline"]
    assembly_file = page_baseline / "career_page_assembly_1046_v1.jsonl"
    integrated_qa = read_json(repo_root / design["inputs"]["integrated_qa"])
    import_state = read_json(repo_root / design["inputs"]["state"] / "import_state.json")
    assembly_rows = read_jsonl(assembly_file)
    assembly_index = {(row["slug"], row["locale"]): row for row in assembly_rows}
    sample_slugs = [row["slug"] for row in design["preview_scope"]]

    findings: list[dict[str, Any]] = []
    authority_rows: list[dict[str, Any]] = []
    smoke_rows: list[dict[str, Any]] = []
    projections: list[dict[str, Any]] = []

    expected_sha = design["input_verification"]["page_assembly_baseline_sha256"]
    actual_sha = sha256_file(assembly_file)
    if actual_sha != expected_sha:
        findings.append({"scope": "artifact_sha", "finding": "page_assembly_sha_mismatch", "expected": expected_sha, "actual": actual_sha})
    if integrated_qa.get("integrated_qa_conclusion") != "PASS":
        findings.append({"scope": "integrated_qa", "finding": "integrated_qa_not_pass"})
    if import_state.get("import_state") != "READY_FOR_HUMAN_STAGING_REVIEW":
        findings.append({"scope": "import_state", "finding": "not_ready_for_human_staging_review"})

    for slug in sample_slugs:
        seed = seed_by_slug.get(slug)
        if not seed:
            findings.append({"scope": "authority", "slug": slug, "finding": "slug_missing_from_seed"})
            continue
        canonical = seed.get("canonical_path", {})
        authority = {
            "slug": slug,
            "seed_ordinal": seed.get("ordinal"),
            "zh_path_present": bool(canonical.get("zh")),
            "en_path_present": bool(canonical.get("en")),
            "occupation_present": bool(seed.get("occupation")),
            "authority_gate": "PASS",
        }
        if not authority["zh_path_present"] or not authority["en_path_present"] or not authority["occupation_present"]:
            authority["authority_gate"] = "REPAIR_REQUIRED"
            findings.append({"scope": "authority", "slug": slug, "finding": "canonical_or_occupation_authority_missing"})
        authority_rows.append(authority)

        for locale in ("zh-CN", "en"):
            row = assembly_index.get((slug, locale))
            if not row:
                findings.append({"scope": "assembly_row", "slug": slug, "locale": locale, "finding": "missing_assembly_row"})
                smoke_rows.append({"slug": slug, "locale": locale, "dry_run_status": "REPAIR_REQUIRED", "projection_safe": False, "finding_count": 1})
                continue
            projection = reader_projection_from_assembly(row)
            projection_findings = validate_reader_projection(projection)
            projections.append(projection)
            if projection_findings:
                for finding in projection_findings:
                    findings.append({"scope": "reader_projection", "slug": slug, "locale": locale, "finding": finding})
            smoke_rows.append(
                {
                    "slug": slug,
                    "locale": locale,
                    "dry_run_status": "PASS" if not projection_findings else "REPAIR_REQUIRED",
                    "projection_safe": not projection_findings,
                    "finding_count": len(projection_findings),
                }
            )

    duplicate_projection_count = len(projections) - len({(row["slug"], row["locale"]) for row in projections})
    if duplicate_projection_count:
        findings.append({"scope": "duplicates", "finding": "duplicate_projection_rows", "count": duplicate_projection_count})

    report = {
        "generated_at": utc_now(),
        "final_conclusion": "CAREER_CONTENT_STAGING_PREVIEW_DRY_RUN_PASS" if not findings and len(projections) == 100 else "REPAIR_REQUIRED",
        "write_mode": "dry_run_only",
        "design_manifest": args.design_manifest,
        "page_assembly_baseline": design["inputs"]["page_assembly_baseline"],
        "page_assembly_sha256": actual_sha,
        "sample_slug_count": len(sample_slugs),
        "expected_projection_rows": 100,
        "projection_rows": len(projections),
        "authority_rows": len(authority_rows),
        "finding_count": len(findings),
        "staging_rows_written": 0,
        "production_rows_written": 0,
        "cms_rows_written": 0,
        "runtime_modified": False,
        "seo_runtime_modified": False,
        "search_projection_activated": False,
        "frozen_baselines_mutated": False,
        "new_career_facts_generated": False,
        "findings": findings,
    }

    write_json(output_dir / "dry_run_report.json", report)
    dry_run_md = [
        "# Career Content Staging Preview Dry Run",
        "",
        f"- final_conclusion: {report['final_conclusion']}",
        f"- sample_slug_count: {report['sample_slug_count']}",
        f"- projection_rows: {report['projection_rows']}",
        f"- finding_count: {report['finding_count']}",
        "- staging_rows_written: 0",
        "- production_rows_written: 0",
        "- cms_rows_written: 0",
        "- runtime_modified: false",
        "- seo_runtime_modified: false",
        "- search_projection_activated: false",
    ]
    (output_dir / "dry_run_report.md").parent.mkdir(parents=True, exist_ok=True)
    (output_dir / "dry_run_report.md").write_text("\n".join(dry_run_md) + "\n", encoding="utf-8")
    write_csv(output_dir / "authority_gate_report.csv", authority_rows, ["slug", "seed_ordinal", "zh_path_present", "en_path_present", "occupation_present", "authority_gate"])
    write_csv(output_dir / "api_projection_smoke.csv", smoke_rows, ["slug", "locale", "dry_run_status", "projection_safe", "finding_count"])
    write_jsonl(output_dir / "reader_safe_projection_sample.jsonl", projections)
    write_json(output_dir / "findings.json", {"findings": findings})
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["final_conclusion"] == "CAREER_CONTENT_STAGING_PREVIEW_DRY_RUN_PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
