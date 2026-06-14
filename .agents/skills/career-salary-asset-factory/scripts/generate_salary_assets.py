#!/usr/bin/env python3
"""Generate salary assets only after evidence and estimate audits PASS."""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from pipeline_lib import read_audit_verdict, read_jsonl, write_json


def stable_hash(value: object) -> str:
    payload = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def no_cjk(value: str) -> str:
    return "".join(ch if not ("\u4e00" <= ch <= "\u9fff") else "" for ch in value)


def money_usd(value: float | None) -> str:
    return f"${int(value):,}" if value is not None else "not captured"


def money_gbp(value: float | None) -> str:
    return f"£{int(value):,}" if value is not None else "not captured"


def source_rows(evidence: dict, locale: str) -> list[dict]:
    sources: list[dict] = []
    for item in (evidence.get("china_recruitment_evidence") or {}).get("evidence_items") or []:
        if not item.get("include_candidate"):
            continue
        if locale == "zh-CN":
            name = item.get("platform") or "CN recruitment source"
            used_for = f"CN evidence {item.get('evidence_id')}: {item.get('raw_salary_text')}"
        else:
            name = item.get("platform") or "CN recruitment source"
            used_for = f"CN recruitment evidence {item.get('evidence_id')} supports a source-bounded monthly range; see evidence ledger for original Chinese source text."
        sources.append({
            "market": "CN",
            "name": name,
            "url": item.get("source_url"),
            "source_type": item.get("source_type"),
            "source_id": item.get("evidence_id"),
            "used_for": used_for,
            "captured_at": item.get("captured_at", ""),
        })
    for idx, item in enumerate((evidence.get("us_official_evidence") or {}).get("wage_sources") or [], 1):
        sources.append({
            "market": "US",
            "name": item.get("source_name"),
            "url": item.get("source_url"),
            "source_type": "official_wage_reference",
            "source_id": f"us_{idx:03d}",
            "used_for": f"US official salary reference for {evidence['occupation']['title_en']}.",
            "captured_at": "",
        })
    uk = evidence.get("uk_evidence") or {}
    if uk.get("source_url"):
        sources.append({
            "market": "UK",
            "name": uk.get("source_name"),
            "url": uk.get("source_url"),
            "source_type": "official_or_public_career_profile",
            "source_id": "uk_001",
            "used_for": f"UK salary/profile reference for {evidence['occupation']['title_en']}.",
            "captured_at": "",
        })
    eu = evidence.get("eu_context_evidence") or {}
    if eu.get("source_url"):
        sources.append({
            "market": "EU",
            "name": eu.get("source_name"),
            "url": eu.get("source_url"),
            "source_type": "macro_context_boundary",
            "source_id": "eu_001",
            "used_for": "EU macro context boundary only; not an occupation salary.",
            "captured_at": "",
        })
    return sources


def salary_drivers(title: str, locale: str) -> list[dict]:
    if locale == "zh-CN":
        return [
            {"factor": "岗位边界", "description": f"{title} 的薪资会随具体岗位标题、职责范围和相邻岗位口径变化。"},
            {"factor": "地区与雇主", "description": "城市、机构类型、企业规模和预算来源会明显影响招聘报价。"},
            {"factor": "经验层级", "description": "初级、独立承担、带团队或负责关键结果时，薪资区间通常不同。"},
            {"factor": "工具与资质", "description": "岗位相关证书、设备、软件、合规或客户责任会改变岗位定价。"},
            {"factor": "工作强度", "description": "排班、现场工作、旺季、风险和交付压力会影响补贴、奖金或上限。"},
        ]
    return [
        {"factor": "Role boundary", "description": f"{title} pay changes when the exact title, responsibility scope, or adjacent role cluster changes."},
        {"factor": "Location and employer", "description": "City, employer type, organization size, and budget source can materially change offers."},
        {"factor": "Experience level", "description": "Entry, independent, senior, lead, or accountable roles are priced differently."},
        {"factor": "Tools and credentials", "description": "Relevant licenses, equipment, software, compliance, or client responsibility can change compensation."},
        {"factor": "Workload pattern", "description": "Shift work, field work, seasonal pressure, risk, and delivery demands can affect bonuses or upper ranges."},
    ]


def build_asset(evidence: dict, estimate: dict, locale: str, estimate_path: Path, generated_at: str) -> dict:
    title_en = estimate["identity"]["title_en"]
    title_zh = estimate["identity"].get("title_zh_cleaned") or estimate["identity"].get("title_zh_seed") or title_en
    title = title_zh if locale == "zh-CN" else title_en
    cn = estimate["cn_recruitment_estimate"]
    us = estimate["us_official_estimate"]
    uk = estimate["uk_reference_estimate"]
    eu = estimate["eu_context_estimate"]
    cn_ids = cn["included_evidence_ids"]
    us_ids = us["source_ids"]
    uk_ids = [uk["source_id"]] if uk.get("source_id") else []
    eu_ids = [eu["source_id"]] if eu.get("source_id") else []
    all_ids = cn_ids + us_ids + uk_ids + eu_ids
    if locale == "zh-CN":
        heading = f"{title}薪资与就业参考"
        headline = f"{title}薪资参考"
        short = f"中国大陆使用招聘市场可见证据，参考区间为 {cn.get('display_monthly_range_cny') or '暂不可计算'}；美国、英国和欧盟仅按各自来源边界阅读。"
        cn_body = f"中国大陆部分只使用已通过审计的招聘市场证据。{title} 当前可见参考为 {cn.get('display_monthly_range_cny') or '暂不可计算'}，不是官方职业中位薪资，也不是个人收入预测。"
        us_body = f"美国部分使用官方或公共职业来源；当前 median annual 为 {money_usd(us.get('median_annual_usd'))}，p25/p75 缺失时保持为空。"
        uk_body = f"英国部分使用 UK National Careers 或有边界的相邻 profile；starter 为 {money_gbp(uk.get('starter_annual_gbp'))}，experienced 为 {money_gbp(uk.get('experienced_annual_gbp'))}。"
        eu_body = "欧盟部分只作为宏观语境边界，不写成统一欧洲职业薪资。"
        guidance = [
            f"先确认你看的是否真的是 {title}，还是相邻岗位或更宽岗位簇。",
            "中国薪资只读作招聘市场样本信号，不读作官方全国职业工资。",
            "美国、英国和欧盟来源各有统计口径，不能直接互相换算。",
            "比较 offer 时同时看城市、经验、雇主类型、排班和职责边界。",
        ]
        occupation = {
            "title_en": title_en,
            "title_zh": title_zh,
            "title_zh_seed": estimate["identity"].get("title_zh_seed"),
            "soc_code": estimate["identity"].get("soc_code_seed"),
            "onet_code": estimate["identity"].get("onet_code_seed"),
            "canonical_path": f"/zh/career/jobs/{estimate['identity']['slug']}",
            "title_normalization": {"cleaned_title_zh": title_zh},
        }
        research_queries = list((evidence.get("china_recruitment_evidence") or {}).get("exact_title_queries") or [])
    else:
        heading = f"{title_en} salary and outlook reference"
        headline = f"{title_en} salary reference"
        short = f"China is shown only as a recruitment-market signal ({cn.get('display_monthly_range_cny') or 'not calculable'}), while US, UK, and EU references must be read within their source boundaries."
        cn_body = f"The China section uses passed recruitment-market evidence only. The current bounded reference for {title_en} is {cn.get('display_monthly_range_cny') or 'not calculable'}; it is not an official occupation wage or personal salary prediction."
        us_body = f"The US section uses official or public career evidence. Current median annual pay is {money_usd(us.get('median_annual_usd'))}; missing p25/p75 values remain null."
        uk_body = f"The UK section uses a National Careers or audited adjacent profile. Starter is {money_gbp(uk.get('starter_annual_gbp'))}; experienced is {money_gbp(uk.get('experienced_annual_gbp'))}."
        eu_body = "The EU section is macro context only and must not be read as a unified European occupation salary."
        guidance = [
            f"First confirm whether the source is the exact {title_en} role or an audited adjacent role cluster.",
            "Read China pay only as recruitment-market evidence, not an official national occupation wage.",
            "US, UK, and EU references use different source boundaries and should not be converted into a personal salary.",
            "Compare offers by location, experience, employer type, schedule, and responsibility scope.",
        ]
        occupation = {
            "title_en": title_en,
            "title_zh": title_en,
            "title_zh_seed": title_en,
            "soc_code": estimate["identity"].get("soc_code_seed"),
            "onet_code": estimate["identity"].get("onet_code_seed"),
            "canonical_path": f"/en/career/jobs/{estimate['identity']['slug']}",
            "title_normalization": {"cleaned_title_zh": title_en},
        }
        research_queries = [title_en, "CN recruitment evidence terms retained in source ledger"]
    asset = {
        "asset_type": "career_job_salary_asset",
        "asset_version": "career_job_salary_asset_v3_6",
        "slug": estimate["identity"]["slug"],
        "locale": locale,
        "occupation": occupation,
        "heading": heading,
        "summary": {
            "headline": headline,
            "short_answer": short,
            "confidence_label": cn.get("confidence") or "medium",
        },
        "china_recruitment_reference": {
            "heading": "中国招聘市场参考" if locale == "zh-CN" else "China recruitment-market reference",
            "evidence_status": cn["status"],
            "display_monthly_range_cny": cn.get("display_monthly_range_cny"),
            "range_basis": "observed evidence range, not percentile",
            "body": cn_body,
            "data_boundary": cn["official_wage_boundary"],
            "confidence_label": cn["confidence"],
            "confidence_reason": cn["confidence_reason"],
            "facts": {
                "monthly_cny_low_observed": cn.get("observed_monthly_low_cny"),
                "monthly_cny_high_observed": cn.get("observed_monthly_high_cny"),
                "monthly_cny_average_observed": cn.get("observed_average_monthly_cny"),
                "monthly_cny_p25": None,
                "monthly_cny_median": None,
                "monthly_cny_p75": None,
                "range_source_evidence_ids": cn_ids,
            },
            "limitations": cn["limitations"] if locale == "zh-CN" else [
                "China figures are recruitment-market references only, not official occupation wages.",
                "Platform, city, experience, and adjacent-role boundaries can materially change offers.",
            ],
        },
        "china_official_context": {
            "heading": "中国官方工资语境" if locale == "zh-CN" else "China official wage context",
            "body": "中国大陆没有在本资产中使用官方单职业中位薪资；官方行业或单位数据只能作为宏观语境。" if locale == "zh-CN" else "This asset does not use an official Chinese single-occupation median wage; official industry or unit statistics are macro context only.",
            "facts": {"official_single_occupation_median_available": False},
        },
        "us_official_reference": {
            "heading": "美国官方参考" if locale == "zh-CN" else "US official reference",
            "status": us["status"],
            "mapping_quality": us.get("mapping_quality"),
            "soc_code_used": us.get("soc_code_used"),
            "body": us_body,
            "facts": {key: us.get(key) for key in ["median_annual_usd", "median_hourly_usd", "p10_annual_usd", "p25_annual_usd", "p75_annual_usd", "p90_annual_usd", "job_outlook_pct", "annual_openings"]},
            "source_ids": us_ids,
            "limitations": us["limitations"],
        },
        "uk_reference": {
            "heading": "英国参考" if locale == "zh-CN" else "UK reference",
            "status": uk["status"],
            "body": uk_body,
            "facts": {
                "starter_annual_gbp": uk.get("starter_annual_gbp"),
                "experienced_annual_gbp": uk.get("experienced_annual_gbp"),
                "typical_hours": uk.get("typical_hours"),
                "working_pattern": uk.get("working_pattern"),
            },
            "source_id": uk.get("source_id"),
            "limitations": uk["limitations"],
        },
        "eu_context_boundary": {
            "heading": "欧盟语境边界" if locale == "zh-CN" else "EU context boundary",
            "status": eu["status"],
            "body": eu_body,
            "source_id": eu.get("source_id"),
            "limitations": eu["limitations"],
        },
        "salary_drivers": salary_drivers(title, locale),
        "reader_guidance": guidance,
        "forbidden_claims": [
            "Do not describe China recruitment samples as official occupation wages.",
            "Do not convert US, UK, or EU references into a personal China salary.",
            "Do not promise employment, raises, visas, certification, promotion, or career outcomes.",
        ],
        "sources": source_rows(evidence, locale),
        "evidence_used": {
            "cn_evidence_ids": cn_ids,
            "us_evidence_ids": us_ids,
            "uk_evidence_ids": uk_ids,
            "eu_evidence_ids": eu_ids,
            "all_source_evidence_ids": all_ids,
        },
        "derived_from_estimate": {
            "source_estimate_file": estimate_path.name,
            "estimate_schema_version": estimate["audit_fields"]["schema_version"],
            "estimate_row_hash": estimate["audit_fields"]["row_hash"],
            "cn_status": cn["status"],
            "us_status": us["status"],
            "uk_status": uk["status"],
            "eu_status": eu["status"],
        },
        "research_notes": {
            "limitations": cn["limitations"] if locale == "zh-CN" else ["See source ledger for original CN source text and query terms."],
            "query_terms_used": research_queries,
            "adjacent_roles_used": research_queries,
            "asset_generation_boundary": "Generated only from PASS evidence and PASS estimate ledgers.",
        },
        "audit_fields": {
            "schema_version": "career_job_salary_asset_v3_6",
            "generated_at": generated_at,
            "ready_for_codex_audit": True,
            "row_hash": "",
        },
    }
    if locale == "en":
        asset = json.loads(no_cjk(json.dumps(asset, ensure_ascii=False)))
    asset["audit_fields"]["row_hash"] = stable_hash({**asset, "audit_fields": {**asset["audit_fields"], "row_hash": ""}})
    return asset


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--evidence", required=True, type=Path)
    parser.add_argument("--evidence-audit", required=True, type=Path)
    parser.add_argument("--estimates", required=True, type=Path)
    parser.add_argument("--estimate-audit", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    evidence_verdict = read_audit_verdict(args.evidence_audit)
    estimate_verdict = read_audit_verdict(args.estimate_audit)
    if evidence_verdict != "PASS" or estimate_verdict != "PASS":
        write_json(args.output.with_suffix(".blocked.json"), {"status": "BLOCKED", "evidence_verdict": evidence_verdict, "estimate_verdict": estimate_verdict})
        return 2
    evidence_rows, evidence_errors = read_jsonl(args.evidence)
    estimate_rows, estimate_errors = read_jsonl(args.estimates)
    if evidence_errors or estimate_errors:
        write_json(args.output.with_suffix(".blocked.json"), {
            "status": "BLOCKED",
            "evidence_errors": evidence_errors,
            "estimate_errors": estimate_errors,
        })
        return 2
    if [row.get("slug") for row in evidence_rows] != [row.get("identity", {}).get("slug") for row in estimate_rows]:
        write_json(args.output.with_suffix(".blocked.json"), {"status": "BLOCKED", "reason": "evidence and estimate slug order mismatch"})
        return 2
    generated_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    assets = []
    for evidence, estimate in zip(evidence_rows, estimate_rows):
        assets.append(build_asset(evidence, estimate, "zh-CN", args.estimates, generated_at))
        assets.append(build_asset(evidence, estimate, "en", args.estimates, generated_at))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as handle:
        for asset in assets:
            handle.write(json.dumps(asset, ensure_ascii=False, separators=(",", ":")) + "\n")
    write_json(args.output.with_suffix(".validation.json"), {
        "status": "GENERATED",
        "total_lines": len(assets),
        "unique_slugs": len(estimate_rows),
        "zh_CN_assets": sum(1 for asset in assets if asset["locale"] == "zh-CN"),
        "en_assets": sum(1 for asset in assets if asset["locale"] == "en"),
    })
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
