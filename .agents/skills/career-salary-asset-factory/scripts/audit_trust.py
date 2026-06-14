#!/usr/bin/env python3
"""Audit evidence trust quality before estimates are computed."""

from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Any

from pipeline_lib import load_manifest, read_jsonl, write_basic_md, write_csv, write_json


CN_GENERATED_PATTERNS = [
    "本轮仅记录招聘市场观察边界",
    "相关岗位常见月薪区间约",
    "观察区间约￥",
    "大同的朋友平均工资",
    "大同平均工资",
]

US_GENERATED_PATTERNS = [
    "captured or bounded for missing BLS API values",
    "this row keeps source and mapping boundaries for audit",
    "O*NET median wage captured or bounded",
]

GENERIC_UK_PROFILES = {
    "administrator",
    "office-manager",
    "customer-service-assistant",
    "maintenance-fitter",
    "software-developer",
    "arts-administrator",
}


def all_strings(value: Any) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, dict):
        out: list[str] = []
        for child in value.values():
            out.extend(all_strings(child))
        return out
    if isinstance(value, list):
        out: list[str] = []
        for child in value:
            out.extend(all_strings(child))
        return out
    return []


def normalized_url_tail(url: str | None) -> str:
    raw = (url or "").rstrip("/")
    return raw.rsplit("/", 1)[-1]


def has_documented_uk_direct_first_boundary(uk: dict[str, Any]) -> bool:
    text = " ".join(all_strings({
        "raw_evidence_text": uk.get("raw_evidence_text"),
        "limitations": uk.get("limitations"),
    })).lower()
    return (
        "direct" in text
        and (
            "not automatically captured" in text
            or "not found" in text
            or "unavailable" in text
            or "direct-first" in text
            or "direct first" in text
        )
    )


def cn_item_reasons(item: dict[str, Any]) -> tuple[list[str], list[str]]:
    blocked: list[str] = []
    repair: list[str] = []
    raw = item.get("raw_salary_text") or ""
    visible = item.get("visible_distribution_text") or ""
    url = item.get("source_url") or ""
    has_numeric = item.get("observed_monthly_low_cny") is not None or item.get("observed_monthly_high_cny") is not None

    if any(pattern in raw or pattern in visible for pattern in CN_GENERATED_PATTERNS):
        blocked.append("cn_generated_raw_salary_text_pattern")
    if "/search/salary/?keyword=" in url and not item.get("sample_count_visible"):
        blocked.append("cn_search_url_without_visible_sample_count")
    if has_numeric and not item.get("sample_count_visible") and item.get("source_type") == "platform_salary_page":
        repair.append("cn_numeric_range_without_visible_sample_count")
    if has_numeric:
        low = item.get("observed_monthly_low_cny")
        high = item.get("observed_monthly_high_cny")
        combined = raw + " " + visible
        if low is not None and high is not None:
            low_k = int(round(float(low) / 1000))
            high_k = int(round(float(high) / 1000))
            if (
                str(int(low)) not in combined
                and f"{low_k}K" not in combined
                and f"{low_k}k" not in combined
                and str(int(high)) not in combined
                and f"{high_k}K" not in combined
                and f"{high_k}k" not in combined
            ):
                blocked.append("cn_numeric_range_not_visible_in_raw_text")
    return blocked, repair


def row_reasons(row: dict[str, Any]) -> tuple[list[str], list[str]]:
    blocked: list[str] = []
    repair: list[str] = []

    cn = row.get("china_recruitment_evidence") or {}
    included = [item for item in cn.get("evidence_items") or [] if item.get("include_candidate")]
    if not included:
        blocked.append("cn_no_included_evidence")
    if len(included) == 1:
        repair.append("cn_single_source")
    for item in included:
        item_blocked, item_repair = cn_item_reasons(item)
        blocked.extend(item_blocked)
        repair.extend(item_repair)
        if item.get("direct_match_level") == "broad_adjacent":
            repair.append("cn_broad_adjacent")

    us = row.get("us_official_evidence") or {}
    wage_sources = us.get("wage_sources") or []
    if not wage_sources:
        blocked.append("us_no_wage_source")
    for source in wage_sources:
        source_name = source.get("source_name")
        source_url = source.get("source_url") or ""
        raw = " ".join(all_strings(source))
        if source_name == "O*NET":
            repair.append("us_onet_only_or_fallback_source")
            if "/find/quick" in source_url:
                blocked.append("us_onet_search_url_not_profile")
            if any(pattern in raw for pattern in US_GENERATED_PATTERNS):
                blocked.append("us_generated_onet_fallback_text")
        if source_name == "BLS Employment Projections":
            blocked.append("us_employment_projections_used_as_wage_source")
    if us.get("mapping_quality") == "reviewed_soc_override" and not us.get("soc_code_used"):
        blocked.append("us_reviewed_override_without_soc")
    mapping_url = us.get("mapping_source_url") or ""
    if mapping_url == "https://www.onetonline.org/" or "/find/quick" in mapping_url:
        blocked.append("us_mapping_url_not_specific_profile")

    uk = row.get("uk_evidence") or {}
    uk_quality = uk.get("mapping_quality")
    uk_profile = normalized_url_tail(uk.get("source_url"))
    if uk_quality == "unavailable":
        blocked.append("uk_unavailable")
    if uk_quality == "adjacent_uk_profile":
        if uk_profile in GENERIC_UK_PROFILES:
            blocked.append("uk_generic_adjacent_profile")
        elif not has_documented_uk_direct_first_boundary(uk):
            repair.append("uk_adjacent_profile_without_direct_first_boundary")
    if uk.get("typical_hours") is not None and not isinstance(uk.get("typical_hours"), str):
        blocked.append("uk_typical_hours_not_string_or_null")

    eu = row.get("eu_context_evidence") or {}
    eu_text = " ".join(all_strings(eu)).lower()
    if eu.get("status") == "occupation_specific" and re.search(r"eu[- ]wide|unified.*eu|european.*median", eu_text):
        blocked.append("eu_unified_salary_claim")

    return sorted(set(blocked)), sorted(set(repair) - set(blocked))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path, help="evidence JSONL")
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--control-baseline", type=Path)
    args = parser.parse_args()

    rows, errors = read_jsonl(args.input)
    manifest = load_manifest(args.manifest)
    expected_slugs = [job["slug"] for job in manifest]
    row_slugs = [row.get("slug") for row in rows]

    control_by_slug: dict[str, dict[str, Any]] = {}
    if args.control_baseline and args.control_baseline.exists():
        control_rows, control_errors = read_jsonl(args.control_baseline)
        errors.extend(f"control: {error}" for error in control_errors)
        control_by_slug = {row["slug"]: row for row in control_rows}

    ready: list[dict[str, Any]] = []
    repair: list[dict[str, Any]] = []
    blocked: list[dict[str, Any]] = []
    all_rows: list[dict[str, Any]] = []
    control_changed_count = 0

    for row in rows:
        slug = row.get("slug", "")
        if slug in control_by_slug:
            if row != control_by_slug[slug]:
                control_changed_count += 1
                item = {
                    "slug": slug,
                    "status": "BLOCKED",
                    "reasons": "control_row_changed",
                    "fix_required": "restore control row from trusted baseline; do not re-author evidence facts",
                }
                blocked.append(item)
                all_rows.append(item)
            else:
                item = {"slug": slug, "status": "CONTROL_UNCHANGED", "reasons": "", "fix_required": ""}
                ready.append(item)
                all_rows.append(item)
            continue

        blocked_reasons, repair_reasons = row_reasons(row)
        if blocked_reasons:
            item = {
                "slug": slug,
                "status": "BLOCKED",
                "reasons": " | ".join(blocked_reasons + repair_reasons),
                "fix_required": "repair evidence only with source-captured facts; do not compute estimates or generate assets",
            }
            blocked.append(item)
        elif repair_reasons:
            item = {
                "slug": slug,
                "status": "REPAIR_REQUIRED",
                "reasons": " | ".join(repair_reasons),
                "fix_required": "strengthen source capture or downgrade boundaries before estimate generation",
            }
            repair.append(item)
        else:
            item = {"slug": slug, "status": "READY", "reasons": "", "fix_required": ""}
            ready.append(item)
        all_rows.append(item)

    if row_slugs != expected_slugs:
        blocked.append({
            "slug": "",
            "status": "BLOCKED",
            "reasons": "manifest_order_mismatch",
            "fix_required": "regenerate evidence ledger in manifest order",
        })
    if errors:
        blocked.append({
            "slug": "",
            "status": "BLOCKED",
            "reasons": "json_parse_errors",
            "fix_required": "repair JSONL parse errors",
        })

    metrics = {
        "total_lines": len(rows) + len(errors),
        "valid_json_lines": len(rows),
        "slug_order_matches_manifest": row_slugs == expected_slugs,
        "control_rows_checked": len(control_by_slug),
        "control_changed_count": control_changed_count,
        "ready_count": len(ready),
        "repair_required_count": len(repair),
        "blocked_count": len(blocked),
        "new_ready_count": sum(1 for item in ready if item["status"] == "READY"),
    }
    verdict = "PASS" if not errors and not blocked and not repair and row_slugs == expected_slugs else "REJECT"
    if not blocked and repair:
        verdict = "REPAIR_REQUIRED"

    reports = args.output_dir / "reports"
    write_json(reports / "audit.json", {"final_verdict": verdict, "metrics": metrics, "errors": errors})
    write_csv(reports / "ready.csv", ready)
    write_csv(reports / "repair_required.csv", repair)
    write_csv(reports / "blocked.csv", blocked)
    write_csv(reports / "trust_audit_all.csv", all_rows)
    write_basic_md(
        reports / "audit.md",
        "Evidence Trust Audit",
        [
            f"- final_verdict: `{verdict}`",
            f"- ready_count: `{metrics['ready_count']}`",
            f"- repair_required_count: `{metrics['repair_required_count']}`",
            f"- blocked_count: `{metrics['blocked_count']}`",
            f"- control_changed_count: `{metrics['control_changed_count']}`",
            "- gate: `must PASS before compute_estimates`",
        ],
    )
    return 0 if verdict == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
