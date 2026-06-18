#!/usr/bin/env python3
"""Shared v2 audit helpers for FermatMind career AI impact ledgers."""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

LOCALES = ("zh-CN", "en")
GENERIC_TEMPLATE_LABELS = {
    "Document and record summarization",
    "Pattern and exception screening",
    "Draft communication",
    "Planning support",
    "On-site judgment",
    "Safety and accountability",
}
GENERIC_TEMPLATE_SNIPPETS = {
    "work still depends on the conditions, people, equipment or environment",
    "Final decisions remain human because mistakes can affect safety",
    "AI can draft routine explanations",
    "AI can turn procedures, schedules and known constraints",
    "AI can compare routine records",
    "把混乱的",
    "最终责任和复杂判断仍在人",
}
MANUAL_REVIEW_RULES = {
    "actuaries": "Actuaries require manual review because low exposure conflicts with actuarial modeling, reserving, pricing, scenario testing, and risk-report workflows.",
    "administrative-law-judges-adjudicators-and-hearing-officers": "Legal evidence review, statutory reasoning, and written decisions require manual review.",
    "adhesive-bonding-machine-operators-and-tenders": "Distinguish industrial automation from AI task exposure.",
    "air-traffic-controllers": "Preserve safety-critical human accountability.",
    "airline-and-commercial-pilots": "Preserve safety-critical human accountability.",
    "airline-pilots-copilots-and-flight-engineers": "Preserve safety-critical human accountability.",
    "acute-care-nurses": "Distinguish documentation support from clinical accountability.",
    "advanced-practice-psychiatric-nurses": "Distinguish documentation support from clinical accountability.",
    "allergists-and-immunologists": "Distinguish documentation support from clinical accountability.",
    "anesthesiologist-assistants": "Distinguish documentation support from clinical accountability.",
    "anesthesiologists": "Distinguish documentation support from clinical accountability.",
}
SOURCE_REQUIRED_FIELDS = {
    "source_id",
    "name",
    "publisher",
    "url",
    "source_type",
    "used_for",
    "evidence_scope",
    "citation_boundary",
    "captured_at",
}
SOURCE_TYPES = {
    "official_occupation_profile",
    "official_task_database",
    "academic_ai_exposure_research",
    "institutional_ai_exposure_methodology",
    "internal_rubric",
}
EVIDENCE_SCOPES = {
    "occupation_specific",
    "task_methodology",
    "calibration_only",
    "internal_scoring",
}
SCORE_RATIONALE_REQUIRED = {
    "score_1_to_10",
    "score_band",
    "exposure_type",
    "confidence",
    "task_exposure_drivers",
    "human_judgment_anchors",
    "why_not_higher",
    "why_not_lower",
    "confidence_reason",
    "evidence_ids_used",
    "external_calibration_source_ids_used",
    "internal_rubric_source_id",
    "manual_review_flag",
    "manual_review_reason",
}


@dataclass
class Finding:
    level: str
    slug: str
    locale: str
    code: str
    message: str


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open(encoding="utf-8") as handle:
        for line_no, line in enumerate(handle, 1):
            if not line.strip():
                continue
            obj = json.loads(line)
            obj["_line"] = line_no
            rows.append(obj)
    return rows


def read_projection(path: Path | None) -> list[dict[str, str]]:
    if not path or not path.exists():
        return []
    with path.open(encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def row_text(row: Any) -> str:
    if row is None:
        return ""
    return json.dumps(row, ensure_ascii=False, sort_keys=True)


def source_id(source: Any) -> str | None:
    return source.get("source_id") if isinstance(source, dict) else None


def validate_source_object(source: Any, slug: str, locale: str, prefix: str) -> list[Finding]:
    findings: list[Finding] = []
    if not isinstance(source, dict):
        return [Finding("repair_required", slug, locale, f"{prefix}_source_not_object", repr(source))]
    missing = sorted(field for field in SOURCE_REQUIRED_FIELDS if not source.get(field))
    if missing:
        findings.append(Finding("repair_required", slug, locale, f"{prefix}_source_missing_fields", ",".join(missing)))
    if source.get("source_type") and source.get("source_type") not in SOURCE_TYPES:
        findings.append(Finding("repair_required", slug, locale, f"{prefix}_source_bad_type", str(source.get("source_type"))))
    if source.get("evidence_scope") and source.get("evidence_scope") not in EVIDENCE_SCOPES:
        findings.append(Finding("repair_required", slug, locale, f"{prefix}_source_bad_scope", str(source.get("evidence_scope"))))
    return findings


def validate_score_rationale(row: dict[str, Any], evidence_ids: set[str], source_ids: set[str]) -> list[Finding]:
    slug = str(row.get("slug", ""))
    locale = str(row.get("locale", ""))
    rationale = row.get("score_rationale")
    if not isinstance(rationale, dict):
        return [Finding("repair_required", slug, locale, "score_rationale_missing", "score_rationale must be an object")]
    findings: list[Finding] = []
    missing = sorted(field for field in SCORE_RATIONALE_REQUIRED if field not in rationale)
    if missing:
        findings.append(Finding("repair_required", slug, locale, "score_rationale_missing_fields", ",".join(missing)))
    drivers = rationale.get("task_exposure_drivers")
    anchors = rationale.get("human_judgment_anchors")
    if not isinstance(drivers, list) or len([x for x in drivers if isinstance(x, str) and x.strip()]) < 3:
        findings.append(Finding("repair_required", slug, locale, "task_exposure_drivers_too_few", "minimum 3 occupation-specific drivers"))
    if not isinstance(anchors, list) or len([x for x in anchors if isinstance(x, str) and x.strip()]) < 2:
        findings.append(Finding("repair_required", slug, locale, "human_judgment_anchors_too_few", "minimum 2 occupation-specific anchors"))
    used_evidence = set(x for x in rationale.get("evidence_ids_used", []) if isinstance(x, str))
    used_calibration = set(x for x in rationale.get("external_calibration_source_ids_used", []) if isinstance(x, str))
    missing_evidence = sorted(used_evidence - evidence_ids)
    missing_sources = sorted(used_calibration - source_ids)
    if missing_evidence:
        findings.append(Finding("repair_required", slug, locale, "score_rationale_evidence_traceability_error", ",".join(missing_evidence)))
    if missing_sources:
        findings.append(Finding("repair_required", slug, locale, "score_rationale_calibration_traceability_error", ",".join(missing_sources)))
    if rationale.get("confidence") == "high" and rationale.get("manual_review_flag") is True:
        findings.append(Finding("repair_required", slug, locale, "high_confidence_with_manual_review", "high confidence cannot have unresolved manual review"))
    if slug in MANUAL_REVIEW_RULES and rationale.get("manual_review_flag") is not False:
        findings.append(Finding("repair_required", slug, locale, "manual_review_unresolved", MANUAL_REVIEW_RULES[slug]))
    if slug == "actuaries" and rationale.get("score_1_to_10") in {1, 2, 3, 4, 5} and rationale.get("confidence") == "high":
        findings.append(Finding("repair_required", slug, locale, "actuaries_low_score_high_confidence", "actuaries requires manual review before low high-confidence score"))
    return findings


def evidence_identity(rows: list[dict[str, Any]]) -> tuple[dict[str, set[str]], dict[str, set[str]]]:
    evidence_ids: dict[str, set[str]] = defaultdict(set)
    source_ids: dict[str, set[str]] = defaultdict(set)
    for row in rows:
        slug = str(row.get("slug", ""))
        for source in row.get("sources", []) + row.get("external_calibration_sources", []):
            sid = source_id(source)
            if sid:
                source_ids[slug].add(sid)
        for item in row.get("workflow_evidence_items", []):
            if isinstance(item, dict):
                if item.get("evidence_id"):
                    evidence_ids[slug].add(str(item["evidence_id"]))
                if item.get("source_id"):
                    source_ids[slug].add(str(item["source_id"]))
        for item in row.get("task_evidence", []):
            if isinstance(item, dict):
                if item.get("evidence_id"):
                    evidence_ids[slug].add(str(item["evidence_id"]))
                for sid in item.get("source_ids", []) or []:
                    source_ids[slug].add(str(sid))
        for key in ("judgment_evidence", "scoring_evidence"):
            for item in row.get(key, []) or []:
                if isinstance(item, dict) and item.get("evidence_id"):
                    evidence_ids[slug].add(str(item["evidence_id"]))
    return evidence_ids, source_ids


def audit_evidence(rows: list[dict[str, Any]]) -> list[Finding]:
    findings: list[Finding] = []
    if len(rows) != 50:
        findings.append(Finding("repair_required", "__batch__", "", "total_evidence_rows_not_50", str(len(rows))))
    seen = Counter(str(row.get("slug", "")) for row in rows)
    for slug, count in seen.items():
        if count != 1:
            findings.append(Finding("repair_required", slug, "", "duplicate_or_missing_evidence_slug", str(count)))
    for row in rows:
        slug = str(row.get("slug", ""))
        source_ids = set()
        for source in row.get("sources", []):
            source_ids.add(source_id(source) or "")
            findings.extend(validate_source_object(source, slug, "", "evidence"))
        calibration = row.get("external_calibration_sources", [])
        if not calibration:
            findings.append(Finding("repair_required", slug, "", "external_calibration_missing", "minimum one external calibration source object"))
        for source in calibration:
            source_ids.add(source_id(source) or "")
            findings.extend(validate_source_object(source, slug, "", "external_calibration"))
        workflow = row.get("workflow_evidence_items")
        if not isinstance(workflow, list) or len(workflow) < 4:
            findings.append(Finding("repair_required", slug, "", "workflow_evidence_items_below_4", "minimum 4 occupation-specific workflow evidence items"))
        else:
            for item in workflow:
                if not isinstance(item, dict):
                    findings.append(Finding("repair_required", slug, "", "workflow_evidence_item_not_object", repr(item)))
                    continue
                for field in ("evidence_id", "workflow_area", "occupation_specific_task", "source_id", "source_quote_or_paraphrase", "ai_relevance", "likely_ai_effect", "reason"):
                    if not item.get(field):
                        findings.append(Finding("repair_required", slug, "", "workflow_evidence_item_missing_field", field))
                if item.get("source_id") and item.get("source_id") not in source_ids:
                    findings.append(Finding("repair_required", slug, "", "workflow_evidence_source_traceability_error", str(item.get("source_id"))))
        rubric = row.get("internal_rubric_use")
        if not isinstance(rubric, dict) or not rubric.get("used_with_task_evidence") or not rubric.get("used_with_external_calibration"):
            findings.append(Finding("repair_required", slug, "", "internal_rubric_alone_or_unbounded", "internal rubric must be paired with task evidence and external calibration"))
    return findings


def audit_synthesis(rows: list[dict[str, Any]], evidence_rows: list[dict[str, Any]]) -> list[Finding]:
    findings: list[Finding] = []
    evidence_ids, source_ids = evidence_identity(evidence_rows)
    if len(rows) != 100:
        findings.append(Finding("repair_required", "__batch__", "", "total_synthesis_rows_not_100", str(len(rows))))
    counts = Counter((str(row.get("slug", "")), str(row.get("locale", ""))) for row in rows)
    for (slug, locale), count in counts.items():
        if count != 1:
            findings.append(Finding("repair_required", slug, locale, "duplicate_synthesis_slug_locale", str(count)))
    for row in rows:
        slug = str(row.get("slug", ""))
        locale = str(row.get("locale", ""))
        findings.extend(validate_score_rationale(row, evidence_ids.get(slug, set()), source_ids.get(slug, set())))
        if row.get("locale") not in LOCALES:
            findings.append(Finding("repair_required", slug, locale, "bad_locale", str(row.get("locale"))))
        for source in row.get("external_calibration_sources", []):
            findings.extend(validate_source_object(source, slug, locale, "synthesis_external_calibration"))
    return findings


def audit_assets(rows: list[dict[str, Any]], evidence_rows: list[dict[str, Any]]) -> list[Finding]:
    findings: list[Finding] = []
    evidence_ids, source_ids = evidence_identity(evidence_rows)
    if len(rows) != 100:
        findings.append(Finding("repair_required", "__batch__", "", "total_asset_rows_not_100", str(len(rows))))
    pairs = [(str(row.get("slug", "")), str(row.get("locale", ""))) for row in rows]
    expected: list[tuple[str, str]] = []
    for slug in [str(row.get("slug", "")) for row in evidence_rows]:
        expected.extend([(slug, "zh-CN"), (slug, "en")])
    if pairs and pairs != expected:
        findings.append(Finding("repair_required", "__batch__", "", "asset_slug_locale_order_mismatch", "expected evidence order with zh-CN then en"))
    for row in rows:
        slug = str(row.get("slug", ""))
        locale = str(row.get("locale", ""))
        text = row_text(row)
        findings.extend(validate_score_rationale(row, evidence_ids.get(slug, set()), source_ids.get(slug, set())))
        if row.get("occupation_specificity_score", -1) < 3:
            findings.append(Finding("repair_required", slug, locale, "occupation_specificity_score_below_3", str(row.get("occupation_specificity_score"))))
        if row.get("locale_independence_score", -1) < 3:
            findings.append(Finding("repair_required", slug, locale, "locale_independence_score_below_3", str(row.get("locale_independence_score"))))
        if row.get("repeated_template_risk") is True:
            findings.append(Finding("repair_required", slug, locale, "repeated_template_risk", "must be false"))
        for source in row.get("sources", []):
            findings.extend(validate_source_object(source, slug, locale, "asset"))
        for source in row.get("external_calibration_sources", []):
            findings.extend(validate_source_object(source, slug, locale, "asset_external_calibration"))
        if locale == "en" and re.search(r"[\u4e00-\u9fff]", text):
            findings.append(Finding("repair_required", slug, locale, "english_contains_chinese", "English asset contains Chinese characters"))
        for snippet in GENERIC_TEMPLATE_SNIPPETS:
            if snippet in text:
                findings.append(Finding("repair_required", slug, locale, "generic_template_asset", snippet))
        for label in GENERIC_TEMPLATE_LABELS:
            if label in text:
                findings.append(Finding("repair_required", slug, locale, "generic_template_asset", label))
        projection = row.get("search_projection")
        if isinstance(projection, dict):
            findings.extend(audit_projection_rows([projection], evidence_rows, slug_override=slug, locale_override=locale))
        else:
            findings.append(Finding("repair_required", slug, locale, "search_projection_missing", "asset must include candidate-only search_projection"))
    return findings


def audit_template_reuse(evidence_rows: list[dict[str, Any]], asset_rows: list[dict[str, Any]]) -> list[Finding]:
    findings: list[Finding] = []
    claim_counts: Counter[str] = Counter()
    rows_by_claim: defaultdict[str, list[str]] = defaultdict(list)
    for row in evidence_rows:
        slug = str(row.get("slug", ""))
        for item in row.get("task_evidence", []) + row.get("workflow_evidence_items", []):
            if not isinstance(item, dict):
                continue
            claim = str(item.get("claim") or item.get("workflow_area") or item.get("occupation_specific_task") or "")
            if claim:
                claim_counts[claim] += 1
                rows_by_claim[claim].append(slug)
    for claim, count in claim_counts.items():
        if count >= 10 or claim in GENERIC_TEMPLATE_LABELS:
            findings.append(Finding("repair_required", "__template__", "", "repeated_task_template", f"{claim}: {count} rows"))
    for row in asset_rows:
        slug = str(row.get("slug", ""))
        locale = str(row.get("locale", ""))
        text = row_text(row)
        for snippet in GENERIC_TEMPLATE_SNIPPETS:
            if snippet in text:
                findings.append(Finding("repair_required", slug, locale, "generic_template_asset", snippet))
    return findings


def audit_projection_rows(rows: list[dict[str, Any]], evidence_rows: list[dict[str, Any]], slug_override: str | None = None, locale_override: str | None = None) -> list[Finding]:
    findings: list[Finding] = []
    _, source_ids = evidence_identity(evidence_rows)
    for row in rows:
        slug = slug_override or str(row.get("slug", ""))
        locale = locale_override or str(row.get("locale", ""))
        text = row_text(row)
        if row.get("projection_status") != "candidate_only_not_runtime_seo":
            findings.append(Finding("repair_required", slug, locale, "bad_projection_status", str(row.get("projection_status"))))
        boundary = str(row.get("runtime_use_boundary", ""))
        if not re.search(r"audit|审计", boundary, flags=re.I):
            findings.append(Finding("repair_required", slug, locale, "projection_missing_audit_boundary", boundary))
        if re.search(r"update runtime|write runtime|directly write|直接写入|直接用于|canonical 更新|noindex 更新", text, flags=re.I):
            findings.append(Finding("repair_required", slug, locale, "search_projection_runtime_seo_instruction", text[:240]))
        snippets = row.get("citation_snippets", [])
        if isinstance(snippets, str):
            findings.append(Finding("repair_required", slug, locale, "citation_snippets_wrong_shape", "expected array of objects, found string"))
            continue
        for snippet in snippets or []:
            if not isinstance(snippet, dict):
                findings.append(Finding("repair_required", slug, locale, "citation_snippet_not_object", repr(snippet)))
                continue
            for sid in snippet.get("source_ids", []) or []:
                if sid not in source_ids.get(slug, set()):
                    findings.append(Finding("repair_required", slug, locale, "projection_source_traceability_error", str(sid)))
    return findings


def write_csv(path: Path, rows: list[Finding]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["level", "slug", "locale", "code", "message"],
            lineterminator="\n",
        )
        writer.writeheader()
        for row in rows:
            writer.writerow(row.__dict__)


def write_report(output_dir: Path, findings_by_file: dict[str, list[Finding]], verdict: str) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    all_findings = [finding for findings in findings_by_file.values() for finding in findings]
    counts = Counter(finding.code for finding in all_findings)
    summary = {
        "verdict": verdict,
        "finding_count": len(all_findings),
        "level_counts": Counter(finding.level for finding in all_findings),
        "code_counts": counts,
        "expected_v1_reject_confirmed": verdict != "PASS",
    }
    (output_dir / "audit.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    lines = [
        "# Career AI Impact v1 vs v2 Audit",
        "",
        f"Verdict: `{verdict}`",
        "",
        f"Finding count: {len(all_findings)}",
        "",
        "## Top Failure Codes",
        "",
    ]
    for code, count in counts.most_common(20):
        lines.append(f"- `{code}`: {count}")
    lines.extend([
        "",
        "## Next Step",
        "",
        "Regenerate batch 001 v2 evidence, synthesis, assets, sources, and search projection from the v2 prompt. Do not patch v1.",
        "",
    ])
    (output_dir / "audit.md").write_text("\n".join(lines), encoding="utf-8")
    for filename, findings in findings_by_file.items():
        write_csv(output_dir / filename, findings)


def load_inputs(args: argparse.Namespace) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    evidence = read_jsonl(Path(args.evidence)) if args.evidence else []
    synthesis = read_jsonl(Path(args.synthesis)) if args.synthesis else []
    assets = read_jsonl(Path(args.assets)) if args.assets else []
    projection = read_projection(Path(args.projection)) if args.projection else []
    return evidence, synthesis, assets, projection


def build_parser(description: str) -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=description)
    parser.add_argument("--evidence", help="Evidence JSONL path")
    parser.add_argument("--synthesis", help="Synthesis JSONL path")
    parser.add_argument("--assets", help="Asset JSONL path")
    parser.add_argument("--projection", help="Search projection CSV path")
    parser.add_argument("--output-dir", required=True, help="Directory for audit outputs")
    return parser


def run_audit(args: argparse.Namespace, mode: str) -> int:
    evidence, synthesis, assets, projection = load_inputs(args)
    findings_by_file: dict[str, list[Finding]] = {}
    if mode in {"all", "evidence"}:
        findings_by_file["schema_failures.csv"] = audit_evidence(evidence)
    if mode in {"all", "synthesis"}:
        findings_by_file["score_rationale_failures.csv"] = audit_synthesis(synthesis, evidence)
    if mode in {"all", "assets"}:
        asset_findings = audit_assets(assets, evidence)
        findings_by_file["source_object_failures.csv"] = [f for f in asset_findings if "source" in f.code]
        findings_by_file["occupation_specificity_failures.csv"] = [f for f in asset_findings if "specificity" in f.code]
        findings_by_file["locale_independence_failures.csv"] = [f for f in asset_findings if "locale_independence" in f.code]
        findings_by_file["schema_failures.csv"] = findings_by_file.get("schema_failures.csv", []) + [
            f for f in asset_findings if f.code not in {"generic_template_asset"} and "source" not in f.code and "specificity" not in f.code and "locale_independence" not in f.code
        ]
    if mode in {"all", "template"}:
        findings_by_file["template_reuse_failures.csv"] = audit_template_reuse(evidence, assets)
    if mode in {"all", "projection"}:
        findings_by_file["projection_failures.csv"] = audit_projection_rows(projection, evidence)
    manual = []
    for row in evidence:
        slug = str(row.get("slug", ""))
        if slug in MANUAL_REVIEW_RULES:
            manual.append(Finding("repair_required", slug, "", "manual_review_required_seed", MANUAL_REVIEW_RULES[slug]))
    findings_by_file["manual_review_required.csv"] = manual
    verdict = "PASS" if not any(findings_by_file.values()) else "NEEDS_BATCH_001_REGENERATION"
    write_report(Path(args.output_dir), findings_by_file, verdict)
    return 0 if verdict == "PASS" else 2


def main(mode: str) -> int:
    parser = build_parser(f"Audit career AI impact v2 {mode}")
    args = parser.parse_args()
    return run_audit(args, mode)
