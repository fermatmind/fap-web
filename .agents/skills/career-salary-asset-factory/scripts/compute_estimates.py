#!/usr/bin/env python3
"""Compute estimates only after evidence and trust audits PASS."""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from pipeline_lib import load_manifest, read_audit_verdict, read_jsonl, write_json


def stable_hash(value: object) -> str:
    payload = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def display_cny(low: float | None, high: float | None, avg: float | None) -> str | None:
    if low is not None and high is not None:
        return f"约 ¥{int(low):,}–{int(high):,}/月"
    if avg is not None:
        return f"约 ¥{int(avg):,}/月"
    return None


def cn_estimate(row: dict) -> dict:
    cn = row.get("china_recruitment_evidence") or {}
    items = [item for item in cn.get("evidence_items") or [] if item.get("include_candidate")]
    lows = [item.get("observed_monthly_low_cny") for item in items if item.get("observed_monthly_low_cny") is not None]
    highs = [item.get("observed_monthly_high_cny") for item in items if item.get("observed_monthly_high_cny") is not None]
    avgs = [item.get("observed_average_monthly_cny") for item in items if item.get("observed_average_monthly_cny") is not None]
    low = min(lows) if lows else None
    high = max(highs) if highs else None
    avg = round(sum(avgs) / len(avgs), 2) if avgs else None
    included = [item.get("evidence_id") for item in items if item.get("evidence_id")]
    direct_levels = {item.get("direct_match_level") for item in items}
    low_confidence = "broad_adjacent" in direct_levels or len(items) < 2
    status = "low_confidence_calculable" if low_confidence else "calculable"
    estimate_type = "low_confidence_adjacent_range" if low_confidence else "exact_or_close_recruitment_range"
    limitations = list(cn.get("evidence_limitations") or [])
    limitations.append(
        "China recruitment estimates are platform, posting, or salary-report signals only; they are not official Chinese single-occupation wages and not personal salary predictions."
    )
    if any(item.get("platform") == "Liepin" for item in items):
        limitations.append("Some China evidence uses Liepin salary-report snippets or search-visible salary text; treat these as recruitment-market references with source-boundary limits.")
    return {
        "status": status if included else "insufficient",
        "estimate_type": estimate_type if included else "unavailable",
        "observed_monthly_low_cny": low,
        "observed_monthly_high_cny": high,
        "observed_average_monthly_cny": avg,
        "display_monthly_range_cny": display_cny(low, high, avg),
        "included_evidence_ids": included,
        "excluded_evidence_ids": [],
        "calculation_method": "observed_min_max_from_included_cn_evidence",
        "confidence": "low" if low_confidence else "medium",
        "confidence_reason": "China evidence uses source-captured recruitment-market signals; adjacent rows remain bounded and must not be read as official wage data.",
        "limitations": list(dict.fromkeys(limitations)),
        "official_wage_boundary": "This is a China recruitment-market reference derived from platform samples, posting snippets, salary pages, or adjacent-role evidence; it is not an official Chinese single-occupation median wage.",
        "use_in_asset": bool(included),
    }


def us_estimate(row: dict) -> dict:
    us = row.get("us_official_evidence") or {}
    sources = us.get("wage_sources") or []
    source = sources[0] if sources else {}
    limitations = list(source.get("limitations") or [])
    if source.get("p25_annual_usd") is None:
        limitations.append("p25 is not filled because the passed evidence ledger did not capture an official p25 value from OEWS or CareerOneStop.")
    if source.get("p75_annual_usd") is None:
        limitations.append("p75 is not filled because the passed evidence ledger did not capture an official p75 value from OEWS or CareerOneStop.")
    return {
        "status": "available" if sources else "unavailable",
        "soc_code_used": us.get("soc_code_used"),
        "mapping_quality": us.get("mapping_quality"),
        "median_annual_usd": source.get("median_annual_usd"),
        "median_hourly_usd": source.get("median_hourly_usd"),
        "p10_annual_usd": source.get("p10_annual_usd"),
        "p25_annual_usd": source.get("p25_annual_usd"),
        "p75_annual_usd": source.get("p75_annual_usd"),
        "p90_annual_usd": source.get("p90_annual_usd"),
        "job_outlook_pct": source.get("job_outlook_pct"),
        "annual_openings": source.get("annual_openings"),
        "source_ids": ["us_001"] if sources else [],
        "limitations": list(dict.fromkeys(limitations)),
        "use_in_asset": bool(sources),
    }


def uk_estimate(row: dict) -> dict:
    uk = row.get("uk_evidence") or {}
    quality = uk.get("mapping_quality")
    if quality == "unavailable":
        status = "unavailable"
    elif quality == "adjacent_uk_profile":
        status = "adjacent_reference"
    else:
        status = "available"
    limitations = list(uk.get("limitations") or [])
    if status == "adjacent_reference":
        limitations.append("UK reference is an adjacent National Careers profile and must not be presented as a fixed occupation equivalence.")
    return {
        "status": status,
        "starter_annual_gbp": uk.get("starter_annual_gbp"),
        "experienced_annual_gbp": uk.get("experienced_annual_gbp"),
        "typical_hours": uk.get("typical_hours"),
        "working_pattern": uk.get("working_pattern"),
        "source_id": "uk_001" if status != "unavailable" else None,
        "limitations": list(dict.fromkeys(limitations)),
        "use_in_asset": status != "unavailable",
    }


def eu_estimate(row: dict) -> dict:
    eu = row.get("eu_context_evidence") or {}
    return {
        "status": eu.get("status") or "macro_context_only",
        "source_id": "eu_001" if eu else None,
        "limitations": list(dict.fromkeys((eu.get("limitations") or []) + [
            "EU evidence is macro/regional context only and must not be presented as an EU occupation-specific salary."
        ])),
        "use_in_asset": bool(eu),
    }


def build_estimate(row: dict, batch_role: str, evidence_path: Path, evidence_sha: str, generated_at: str) -> dict:
    cn = cn_estimate(row)
    us = us_estimate(row)
    uk = uk_estimate(row)
    eu = eu_estimate(row)
    source_ids = list(cn["included_evidence_ids"]) + us["source_ids"]
    if uk["source_id"]:
        source_ids.append(uk["source_id"])
    if eu["source_id"]:
        source_ids.append(eu["source_id"])
    estimate = {
        "identity": {
            "slug": row["slug"],
            "title_en": row["occupation"]["title_en"],
            "title_zh_seed": row["occupation"]["title_zh_seed"],
            "title_zh_cleaned": row["occupation"].get("title_zh_cleaned"),
            "soc_code_seed": row["occupation"].get("soc_code_seed"),
            "onet_code_seed": row["occupation"].get("onet_code_seed"),
            "batch_role": batch_role,
        },
        "evidence_ref": {
            "source_evidence_file": evidence_path.name,
            "evidence_version": "v3.6_batch",
            "evidence_audit_verdict": "PASS",
            "evidence_sha256": evidence_sha,
            "evidence_row_hash": stable_hash(row),
        },
        "cn_recruitment_estimate": cn,
        "us_official_estimate": us,
        "uk_reference_estimate": uk,
        "eu_context_estimate": eu,
        "safety_flags": {
            "cn_not_official_wage": True,
            "no_personal_salary_prediction": True,
            "no_income_guarantee": True,
            "no_us_civilian_wage_for_military_only": True,
            "no_uk_to_cn_conversion": True,
            "no_eu_unified_salary_claim": True,
            "no_percentile_fabrication": True,
            "source_traceable": True,
        },
        "audit_fields": {
            "schema_version": "career_job_salary_estimate_v3_6",
            "generated_at": generated_at,
            "row_hash": "",
            "source_evidence_ids": source_ids,
            "warnings": [],
        },
    }
    if cn["status"] == "low_confidence_calculable":
        estimate["audit_fields"]["warnings"].append("China estimate uses low-confidence or adjacent recruitment evidence; preserve boundary language in assets.")
    if uk["status"] == "adjacent_reference":
        estimate["audit_fields"]["warnings"].append("UK reference is adjacent; do not infer fixed equivalence.")
    estimate["audit_fields"]["row_hash"] = stable_hash({**estimate, "audit_fields": {**estimate["audit_fields"], "row_hash": ""}})
    return estimate


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path, help="PASS evidence JSONL")
    parser.add_argument("--evidence-audit", required=True, type=Path)
    parser.add_argument("--trust-audit", required=True, type=Path)
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    verdict = read_audit_verdict(args.evidence_audit)
    if verdict != "PASS":
        write_json(args.output.with_suffix(".blocked.json"), {"status": "BLOCKED", "reason": f"evidence audit is {verdict}"})
        return 2
    trust_verdict = read_audit_verdict(args.trust_audit)
    if trust_verdict != "PASS":
        write_json(args.output.with_suffix(".blocked.json"), {"status": "BLOCKED", "reason": f"trust audit is {trust_verdict}"})
        return 2
    rows, errors = read_jsonl(args.input)
    if errors:
        write_json(args.output.with_suffix(".blocked.json"), {"status": "BLOCKED", "reason": "evidence JSONL parse errors", "errors": errors})
        return 2
    manifest = load_manifest(args.manifest)
    roles = {job["slug"]: job["batch_role"] for job in manifest}
    expected = [job["slug"] for job in manifest]
    if [row.get("slug") for row in rows] != expected:
        write_json(args.output.with_suffix(".blocked.json"), {"status": "BLOCKED", "reason": "evidence order does not match manifest"})
        return 2
    evidence_sha = file_sha256(args.input)
    generated_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    estimates = [build_estimate(row, roles[row["slug"]], args.input, evidence_sha, generated_at) for row in rows]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as handle:
        for estimate in estimates:
            handle.write(json.dumps(estimate, ensure_ascii=False, separators=(",", ":")) + "\n")
    write_json(args.output.with_suffix(".validation.json"), {
        "status": "GENERATED",
        "total_lines": len(estimates),
        "source_evidence_file": args.input.name,
        "evidence_sha256": evidence_sha,
        "generated_salary_asset": False,
    })
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
