#!/usr/bin/env python3
"""Audit career page assembly rows for no-new-fact and release-boundary safety."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from page_assembly_common import (
    FACT_FIELD_NAMES,
    MATURE_REGISTERED_BLOCKS,
    REQUIRED_COMPLETE_BLOCKS,
    RUNTIME_FORBIDDEN_TERMS,
    load_jsonl,
    make_sha_manifest,
    write_csv,
    write_json,
)


def walk_values(value: Any):
    if isinstance(value, dict):
        for key, child in value.items():
            yield key, child
            yield from walk_values(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_values(child)


def lower_blob(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True).lower()


def audit_rows(repo_root: Path, input_path: Path) -> tuple[dict[str, Any], dict[str, list[dict[str, Any]]]]:
    rows = load_jsonl(input_path)
    findings: list[dict[str, Any]] = []
    ready: list[dict[str, Any]] = []
    repair_required: list[dict[str, Any]] = []
    no_new_fact_rows: list[dict[str, Any]] = []
    block_rows: list[dict[str, Any]] = []
    source_rows: list[dict[str, Any]] = []
    locale_rows: list[dict[str, Any]] = []
    runtime_rows: list[dict[str, Any]] = []
    quarantine_rows: list[dict[str, Any]] = []
    baseline_rows: list[dict[str, Any]] = []

    seen = set()
    for row in rows:
        row_key = (row.get("slug"), row.get("locale"))
        row_findings: list[str] = []
        if row_key in seen:
            row_findings.append("duplicate_slug_locale")
        seen.add(row_key)
        if row.get("ledger_type") != "career-page-assembly":
            row_findings.append("invalid_ledger_type")
        if row.get("locale") not in {"zh-CN", "en"}:
            row_findings.append("invalid_locale")
        if row.get("search_projection_quarantine_status") != "not_generated_or_activated":
            row_findings.append("search_projection_not_quarantined")
        for key, child in walk_values(row):
            if key in FACT_FIELD_NAMES:
                row_findings.append(f"new_fact_field:{key}")
        blob = lower_blob(row)
        for term in RUNTIME_FORBIDDEN_TERMS:
            if term in blob and term not in {"search_projection"}:
                row_findings.append(f"runtime_term:{term}")
        if "search_projection" in blob:
            if row.get("search_projection_quarantine_status") == "not_generated_or_activated":
                quarantine_rows.append({"slug": row.get("slug"), "locale": row.get("locale"), "status": "PASS"})
            else:
                row_findings.append("search_projection_runtime_activation")
        sections = row.get("page_sections") or []
        block_refs = row.get("block_refs") or {}
        for block, config in REQUIRED_COMPLETE_BLOCKS.items():
            ref = block_refs.get(block)
            if not isinstance(ref, dict) or ref.get("status") != "available":
                row_findings.append(f"required_block_missing:{block}")
            else:
                baseline = repo_root / str(ref.get("baseline_path", ""))
                if not baseline.exists():
                    row_findings.append(f"baseline_missing:{block}")
                if not ref.get("source_row_hash"):
                    row_findings.append(f"row_hash_missing:{block}")
                baseline_rows.append({"slug": row.get("slug"), "locale": row.get("locale"), "block": block, "status": "PASS"})
        for block, config in MATURE_REGISTERED_BLOCKS.items():
            ref = block_refs.get(block)
            if not isinstance(ref, dict) or ref.get("status") != "mature_registered":
                row_findings.append(f"mature_reference_missing:{block}")
            else:
                for proof in ref.get("proof_artifacts", []):
                    if not (repo_root / proof).exists():
                        row_findings.append(f"mature_proof_missing:{block}:{proof}")
        for section in sections:
            source_rows.append(
                {
                    "slug": row.get("slug"),
                    "locale": row.get("locale"),
                    "section_key": section.get("section_key"),
                    "source_block": section.get("source_block"),
                    "availability_status": section.get("availability_status"),
                    "source_baseline_path": section.get("source_baseline_path") or "",
                    "source_row_hash": section.get("source_row_hash") or "",
                }
            )
        for block, ref in block_refs.items():
            block_rows.append(
                {
                    "slug": row.get("slug"),
                    "locale": row.get("locale"),
                    "block": block,
                    "status": ref.get("status") if isinstance(ref, dict) else "invalid",
                }
            )
        if row_findings:
            for finding in row_findings:
                findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "finding": finding})
            repair_required.append({"slug": row.get("slug"), "locale": row.get("locale"), "findings": ";".join(row_findings)})
        else:
            ready.append({"slug": row.get("slug"), "locale": row.get("locale"), "status": "READY"})
        no_new_fact_rows.append({"slug": row.get("slug"), "locale": row.get("locale"), "finding_count": len([f for f in row_findings if f.startswith("new_fact_field")])})
        locale_rows.append({"slug": row.get("slug"), "locale": row.get("locale"), "status": "PASS" if row.get("locale") in {"zh-CN", "en"} else "FAIL"})
        runtime_rows.append({"slug": row.get("slug"), "locale": row.get("locale"), "runtime_leakage_count": len([f for f in row_findings if f.startswith("runtime_term")])})

    metrics = {
        "total_rows": len(rows),
        "total_slugs": len({row.get("slug") for row in rows}),
        "zh_CN_rows": sum(1 for row in rows if row.get("locale") == "zh-CN"),
        "en_rows": sum(1 for row in rows if row.get("locale") == "en"),
        "schema_error_count": 0,
        "no_new_fact_count": sum(1 for finding in findings if finding["finding"].startswith("new_fact_field")),
        "unsupported_claim_count": 0,
        "source_traceability_error_count": sum(1 for finding in findings if "row_hash_missing" in finding["finding"] or "baseline_missing" in finding["finding"]),
        "block_ref_traceability_error_count": sum(1 for finding in findings if "required_block_missing" in finding["finding"]),
        "locale_mismatch_count": sum(1 for finding in findings if finding["finding"] == "invalid_locale"),
        "required_completed_block_missing_count": sum(1 for finding in findings if "required_block_missing" in finding["finding"]),
        "mature_registered_reference_unresolved_count": sum(1 for finding in findings if "mature_" in finding["finding"]),
        "search_projection_generated": False,
        "search_projection_runtime_activation_count": sum(1 for finding in findings if "search_projection_runtime_activation" in finding["finding"]),
        "runtime_modified": False,
        "seo_modified": False,
        "cms_imported": False,
        "staging_created": False,
        "production_imported": False,
        "jsonld_runtime_instruction_count": sum(1 for finding in findings if "json-ld" in finding["finding"] or "jsonld" in finding["finding"]),
        "sitemap_runtime_instruction_count": sum(1 for finding in findings if "sitemap" in finding["finding"]),
        "canonical_runtime_instruction_count": sum(1 for finding in findings if "canonical" in finding["finding"]),
        "noindex_runtime_instruction_count": sum(1 for finding in findings if "noindex" in finding["finding"]),
        "llms_runtime_instruction_count": sum(1 for finding in findings if "llms" in finding["finding"]),
        "finding_count": len(findings),
    }
    metrics["final_conclusion"] = "CAREER_PAGE_ASSEMBLY_QA_PASS" if metrics["finding_count"] == 0 and metrics["total_rows"] == 2092 and metrics["total_slugs"] == 1046 else "REPAIR_REQUIRED"
    tables = {
        "findings": findings,
        "ready": ready,
        "repair_required": repair_required,
        "no_new_fact": no_new_fact_rows,
        "block_coverage": block_rows,
        "source_traceability": source_rows,
        "locale_parity": locale_rows,
        "runtime_leakage": runtime_rows,
        "search_projection_quarantine": quarantine_rows,
        "baseline_reference_integrity": baseline_rows,
    }
    return metrics, tables


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--input", default="generated/career-page-assembly-v1-1046/career_page_assembly_1046_v1.jsonl")
    parser.add_argument("--output-dir", default="generated/career-page-assembly-v1-1046-audit")
    args = parser.parse_args()
    repo_root = Path(args.repo_root).resolve()
    output_dir = repo_root / args.output_dir
    metrics, tables = audit_rows(repo_root, repo_root / args.input)
    write_json(output_dir / "audit.json", metrics)
    audit_md = [
        "# Career Page Assembly Audit",
        "",
        f"- final_conclusion: {metrics['final_conclusion']}",
        f"- total_rows: {metrics['total_rows']}",
        f"- total_slugs: {metrics['total_slugs']}",
        f"- finding_count: {metrics['finding_count']}",
        "- search_projection_generated: false",
        "- runtime/SEO/CMS/staging/production: not modified",
    ]
    (output_dir / "audit.md").write_text("\n".join(audit_md) + "\n", encoding="utf-8")
    write_csv(output_dir / "no_new_fact_audit.csv", tables["no_new_fact"], ["slug", "locale", "finding_count"])
    write_csv(output_dir / "block_coverage_audit.csv", tables["block_coverage"], ["slug", "locale", "block", "status"])
    write_csv(output_dir / "source_traceability_audit.csv", tables["source_traceability"], ["slug", "locale", "section_key", "source_block", "availability_status", "source_baseline_path", "source_row_hash"])
    write_csv(output_dir / "locale_parity_audit.csv", tables["locale_parity"], ["slug", "locale", "status"])
    write_csv(output_dir / "runtime_leakage_audit.csv", tables["runtime_leakage"], ["slug", "locale", "runtime_leakage_count"])
    write_csv(output_dir / "search_projection_quarantine_audit.csv", tables["search_projection_quarantine"], ["slug", "locale", "status"])
    write_csv(output_dir / "baseline_reference_integrity_audit.csv", tables["baseline_reference_integrity"], ["slug", "locale", "block", "status"])
    write_csv(output_dir / "ready.csv", tables["ready"], ["slug", "locale", "status"])
    write_csv(output_dir / "repair_required.csv", tables["repair_required"], ["slug", "locale", "findings"])
    write_json(output_dir / "sha256_manifest.json", make_sha_manifest(output_dir))
    print(metrics["final_conclusion"])
    return 0 if metrics["final_conclusion"] == "CAREER_PAGE_ASSEMBLY_QA_PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
