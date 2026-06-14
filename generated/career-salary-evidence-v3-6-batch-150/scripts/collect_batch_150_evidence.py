#!/usr/bin/env python3
"""Best-effort source-backed evidence collection for career salary batch 150.

This script is intentionally conservative: it copies frozen control rows exactly
and attempts public-source capture only for the 50 new rows. Rows without
source-captured CN/UK/US evidence remain blocked; no salary facts are invented.
"""

from __future__ import annotations

import csv
import html
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import quote
from urllib.request import Request, urlopen

try:
    from pypinyin import Style, lazy_pinyin
except Exception as exc:  # pragma: no cover - runtime environment guard
    raise SystemExit(f"pypinyin is required in the temporary collector venv: {exc}")


ROOT = Path(__file__).resolve().parents[3]
MANIFEST = ROOT / "generated/career-salary-batch-150/career_salary_batch_150_manifest.json"
CONTROL_EVIDENCE = ROOT / "generated/career-salary-v3-5-100-pass-baseline/evidence/career_job_salary_evidence_100_v3_5_repaired_4.jsonl"
OUT_DIR = ROOT / "generated/career-salary-evidence-v3-6-batch-150"
OUT_JSONL = OUT_DIR / "career_job_salary_evidence_150_v3_6.jsonl"
VALIDATION = OUT_DIR / "career_job_salary_evidence_150_v3_6_collection_validation.json"
DISCOVERY = OUT_DIR / "collection_plans/source_capture_discovery.csv"

UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"

CN_QUERY_OVERRIDES = {
    "automotive-glass-installers-and-repairers": ["汽车玻璃安装工", "汽车玻璃维修工"],
    "automotive-service-technicians-and-mechanics": ["汽车维修技师", "汽车维修工"],
    "aviation-inspectors": ["航空检查员", "航空安全检查员"],
    "avionics-technicians": ["航空电子技术员", "航空维修技术员"],
    "baggage-porters-and-bellhops": ["行李员", "行李搬运员"],
    "bailiffs": ["法警", "法院执行员"],
    "bakers": ["面包师", "烘焙师"],
    "barbers": ["理发师", "发型师"],
    "barbers-hairstylists-and-cosmetologists": ["美发师", "发型师"],
    "baristas": ["咖啡师", "咖啡店员"],
    "bartenders": ["调酒师", "酒吧服务员"],
    "bicycle-repairers": ["自行车修理工", "自行车维修技师"],
    "bill-and-account-collectors": ["催收员", "账款催收员"],
    "billing-and-posting-clerks": ["账单文员", "结算文员"],
    "biochemists-and-biophysicists": ["生物化学家", "生物研究员"],
    "biomedical-engineers": ["生物医学工程师", "医疗器械工程师"],
    "biofuels-processing-technicians": ["生物燃料技术员", "生物能源技术员"],
    "biofuels-production-managers": ["生产经理", "生物能源生产经理"],
    "biofuels-biodiesel-technology-and-product-development-managers": ["生物燃料研发经理", "产品研发经理"],
    "bioinformatics-scientists": ["生物信息学科学家", "生物信息分析师"],
    "bioinformatics-technicians": ["生物信息技术员", "生物信息工程师"],
    "biological-science-teachers-postsecondary": ["高校生物教师", "生物教师"],
    "biological-technicians": ["生物技术员", "实验技术员"],
    "biologists": ["生物学家", "生物研究员"],
    "biomass-plant-technicians": ["电厂技术员", "生物质电厂技术员"],
    "biomass-power-plant-managers": ["电厂经理", "电厂生产经理"],
    "biostatisticians": ["生物统计师", "统计师"],
    "blockchain-engineers": ["区块链工程师", "区块链开发工程师"],
    "boilermakers": ["锅炉工", "锅炉安装工"],
    "bookkeeping-accounting-and-auditing-clerks": ["会计文员", "会计助理"],
    "brickmasons-and-blockmasons": ["砌砖工", "泥瓦工"],
    "bridge-and-lock-tenders": ["船闸操作员", "桥梁管理员"],
    "broadcast-announcers-and-radio-disc-jockeys": ["广播主持人", "电台主持人"],
    "broadcast-technicians": ["广播技术员", "广电技术员"],
    "broadcast-and-sound-engineering-technicians": ["音视频技术员", "音响师"],
    "brokerage-clerks": ["经纪文员", "证券经纪助理"],
    "brownfield-redevelopment-specialists-and-site-managers": ["土地开发经理", "项目经理"],
    "budget-analysts": ["预算分析师", "财务分析师"],
    "bus-and-truck-mechanics-and-diesel-engine-specialists": ["柴油机维修工", "卡车维修工"],
    "bus-drivers": ["公交司机", "客车司机"],
    "bus-drivers-school": ["校车司机", "公交司机"],
    "bus-drivers-transit-and-intercity": ["公交司机", "长途客车司机"],
    "business-continuity-planners": ["业务连续性规划师", "风险管理专员"],
    "business-intelligence-analysts": ["商业智能分析师", "BI分析师"],
    "business-teachers-postsecondary": ["商科教师", "高校商科教师"],
    "butchers-and-meat-cutters": ["屠宰工", "肉类分割工"],
    "buyers-and-purchasing-agents-farm-products": ["农产品采购员", "采购员"],
    "cabinetmakers-and-bench-carpenters": ["橱柜制造工", "木工"],
    "calibration-technologists-and-technicians": ["校准技术员", "计量校准工程师"],
    "camera-and-photographic-equipment-repairers": ["相机维修工", "摄影设备维修工"],
}

UK_QUERY_OVERRIDES = {
    "automotive-glass-installers-and-repairers": ["vehicle body repairer", "windscreen fitter"],
    "automotive-service-technicians-and-mechanics": ["motor mechanic", "vehicle mechanic"],
    "aviation-inspectors": ["aircraft maintenance engineer", "quality control inspector"],
    "avionics-technicians": ["aircraft maintenance engineer", "electronics technician"],
    "baggage-porters-and-bellhops": ["airport baggage handler", "hotel porter"],
    "bailiffs": ["bailiff", "court administrative assistant"],
    "bakers": ["baker"],
    "barbers": ["barber", "hairdresser"],
    "barbers-hairstylists-and-cosmetologists": ["hairdresser", "beauty consultant"],
    "baristas": ["barista"],
    "bartenders": ["bar person", "bar staff"],
    "bicycle-repairers": ["cycle mechanic"],
    "bill-and-account-collectors": ["debt collector", "credit controller"],
    "billing-and-posting-clerks": ["accounts assistant", "accounting technician"],
    "biochemists-and-biophysicists": ["biochemist", "research scientist"],
    "biomedical-engineers": ["clinical engineer", "biomedical scientist"],
    "biofuels-processing-technicians": ["process operative", "chemical plant process operator"],
    "biofuels-production-managers": ["production manager", "energy engineer"],
    "biofuels-biodiesel-technology-and-product-development-managers": ["product development manager", "production manager"],
    "bioinformatics-scientists": ["bioinformatician", "data scientist"],
    "bioinformatics-technicians": ["laboratory technician", "data technician"],
    "biological-science-teachers-postsecondary": ["higher education lecturer", "biology teacher"],
    "biological-technicians": ["laboratory technician", "biology laboratory technician"],
    "biologists": ["biologist", "research scientist"],
    "biomass-plant-technicians": ["power plant operator", "process operator"],
    "biomass-power-plant-managers": ["energy manager", "production manager"],
    "biostatisticians": ["statistician", "data analyst"],
    "blockchain-engineers": ["software developer", "data scientist"],
    "boilermakers": ["welder", "metal fabricator"],
    "bookkeeping-accounting-and-auditing-clerks": ["accounts assistant", "accounting technician"],
    "brickmasons-and-blockmasons": ["bricklayer", "builder"],
    "bridge-and-lock-tenders": ["waterways operative", "bridge worker"],
    "broadcast-announcers-and-radio-disc-jockeys": ["radio broadcast assistant", "TV or radio presenter"],
    "broadcast-technicians": ["broadcast engineer", "live sound engineer"],
    "broadcast-and-sound-engineering-technicians": ["live sound engineer", "audio visual technician"],
    "brokerage-clerks": ["investment administrator", "financial services administrator"],
    "brownfield-redevelopment-specialists-and-site-managers": ["construction manager", "land surveyor"],
    "budget-analysts": ["finance officer", "management accountant"],
    "bus-and-truck-mechanics-and-diesel-engine-specialists": ["heavy vehicle service and maintenance technician", "motor mechanic"],
    "bus-drivers": ["bus or coach driver"],
    "bus-drivers-school": ["bus or coach driver"],
    "bus-drivers-transit-and-intercity": ["bus or coach driver"],
    "business-continuity-planners": ["risk manager", "business analyst"],
    "business-intelligence-analysts": ["data analyst", "business analyst"],
    "business-teachers-postsecondary": ["higher education lecturer", "business studies teacher"],
    "butchers-and-meat-cutters": ["butcher"],
    "buyers-and-purchasing-agents-farm-products": ["buyer", "purchasing manager"],
    "cabinetmakers-and-bench-carpenters": ["furniture maker", "carpenter"],
    "calibration-technologists-and-technicians": ["engineering maintenance technician", "quality control assistant"],
    "camera-and-photographic-equipment-repairers": ["camera operator", "photographic technician"],
}


def fetch(url: str, timeout: int = 20) -> str | None:
    req = Request(url, headers={"User-Agent": UA})
    try:
        with urlopen(req, timeout=timeout) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except Exception:
        return None


def fetch_with_retry(url: str, timeout: int = 20, attempts: int = 3) -> str | None:
    for attempt in range(attempts):
        body = fetch(url, timeout=timeout)
        if body and "验证码验证" not in body:
            return body
        time.sleep(1.5 + attempt)
    return body


def clean_zh(value: str) -> str:
    value = re.sub(r"适合谁[？?]?", "", value or "")
    value = re.sub(r"职业诊断", "", value)
    value = value.replace("、", "").replace("/", "")
    return value.strip() or value


def pinyin_slug(text: str) -> str:
    return "".join(lazy_pinyin(text, style=Style.NORMAL, errors="ignore")).lower()


def parse_jobui_page(query: str, direct_level: str) -> dict[str, Any] | None:
    url = f"https://m.jobui.com/salary/quanguo-{pinyin_slug(query)}/"
    body = fetch_with_retry(url)
    if not body or "验证码验证" in body:
        return None
    plain = html.unescape(re.sub(r"\s+", " ", body))
    if "取自" not in plain and "岗位拿" not in plain:
        return None
    desc_match = re.search(r'<meta name="description" content="([^"]+)"', body)
    desc = html.unescape(desc_match.group(1)) if desc_match else ""
    if "大同的朋友平均工资" in desc or "大同平均工资" in desc:
        return None
    if query not in desc and query not in plain[:2000]:
        return None
    share_match = re.search(r"([0-9.]+)%[^，。]{0,20}岗位拿[￥¥]?([0-9.]+)-([0-9.]+)K", plain)
    range_match = re.search(r"薪酬区间:\s*([0-9.]+)-([0-9.]+)K", plain)
    sample_match = re.search(r"取自([0-9,]+)份样本", plain) or re.search(r"近一年\s*([0-9,]+)\s*份职位样本", plain)
    low = high = None
    visible = desc
    if share_match:
        low = float(share_match.group(2)) * 1000
        high = float(share_match.group(3)) * 1000
        visible = share_match.group(0)
    elif range_match:
        low = float(range_match.group(1)) * 1000
        high = float(range_match.group(2)) * 1000
        visible = range_match.group(0)
    if low is None or high is None:
        return None
    sample_count = int(sample_match.group(1).replace(",", "")) if sample_match else None
    return {
        "platform": "JobUI",
        "source_type": "platform_salary_page",
        "query": query,
        "source_url": url,
        "direct_match_level": direct_level,
        "city": "全国",
        "city_tier": None,
        "experience": None,
        "sample_count_visible": sample_count,
        "raw_salary_text": desc or visible,
        "visible_distribution_text": visible,
        "observed_monthly_low_cny": int(low),
        "observed_monthly_high_cny": int(high),
        "observed_average_monthly_cny": None,
        "include_candidate": True,
        "exclusion_reason": None,
    }


def parse_mynextmove(onet: str | None) -> dict[str, Any] | None:
    if not onet:
        return None
    url = f"https://www.mynextmove.org/profile/summary/{onet}"
    body = fetch(url)
    if not body or "Access Denied" in body:
        return None
    plain = html.unescape(re.sub(r"\s+", " ", body))
    title = re.search(r"<title>(.*?) at My Next Move</title>", body, re.S)
    salary = re.search(r"Workers on average earn \$([0-9,]+)", plain)
    p10 = re.search(r"10% of workers earn \$([0-9,]+) or less", plain)
    p90 = re.search(r"10% of workers earn \$([0-9,]+) or more", plain)
    outlook = re.search(r"This career will grow <b class=\"highlight\">([^<]+)</b>", body)
    if not salary:
        return None
    median = int(salary.group(1).replace(",", ""))
    return {
        "source_name": "My Next Move",
        "source_url": url,
        "source_year": None,
        "median_annual_usd": median,
        "median_hourly_usd": None,
        "p10_annual_usd": int(p10.group(1).replace(",", "")) if p10 else None,
        "p25_annual_usd": None,
        "p75_annual_usd": None,
        "p90_annual_usd": int(p90.group(1).replace(",", "")) if p90 else None,
        "job_outlook_pct": None,
        "annual_openings": None,
        "raw_evidence_text": f"{html.unescape(title.group(1)).strip() if title else onet}: Workers on average earn ${median:,}." + (f" Outlook: {outlook.group(1)}." if outlook else ""),
        "limitations": ["My Next Move page provides median and 10th/90th markers in the captured summary; p25/p75 and annual openings were not captured from this source."],
    }


def ncs_search_profiles(query: str) -> list[tuple[str, str, str]]:
    url = "https://nationalcareers.service.gov.uk/explore-careers/search-results?searchTerm=" + quote(query)
    body = fetch(url) or ""
    return [
        (html.unescape(title).strip(), "https://nationalcareers.service.gov.uk" + href, html.unescape(desc).strip())
        for href, title, desc in re.findall(
            r'<h3><a class="dfc-code-search-jpTitle" href="([^"]+)">([^<]+)</a></h3>\s*<p class="result-description[^"]*">([^<]*)</p>',
            body,
        )
    ]


def best_ncs_profile(slug: str, title_en: str) -> tuple[str, str, str, float, str] | None:
    from difflib import SequenceMatcher

    query = re.sub(r"\b(and|or|of|the|school|postsecondary)\b", " ", title_en.lower())
    query = re.sub(r"[^a-z0-9]+", " ", query)
    search_terms = UK_QUERY_OVERRIDES.get(slug, [])
    search_terms.extend([title_en, re.sub(r"\bs\b", "", title_en), title_en.rstrip("s")])
    best: tuple[str, str, str, float, str] | None = None
    for search_term in dict.fromkeys(term for term in search_terms if term):
        profiles = ncs_search_profiles(search_term)
        for title, url, desc in profiles[:8]:
            score = max(
                SequenceMatcher(None, query, title.lower()).ratio(),
                SequenceMatcher(None, search_term.lower(), title.lower()).ratio(),
            )
            if best is None or score > best[3]:
                best = (title, url, desc, score, search_term)
        if best and best[3] >= 0.68:
            break
        time.sleep(0.2)
    return best if best and best[3] >= 0.32 else None


def parse_ncs_profile(slug: str, title_en: str) -> dict[str, Any]:
    best = best_ncs_profile(slug, title_en)
    if not best:
        return {
            "mapping_quality": "unavailable",
            "source_name": "UK National Careers",
            "source_url": "",
            "starter_annual_gbp": None,
            "experienced_annual_gbp": None,
            "typical_hours": None,
            "working_pattern": None,
            "raw_evidence_text": "No UK National Careers direct or adjacent profile selected by automated post-deploy collector.",
            "limitations": ["UK evidence requires manual direct-first review before estimate generation."],
        }
    profile_title, url, desc, score, search_term = best
    body = fetch(url) or ""
    plain = html.unescape(re.sub(r"\s+", " ", body))
    starter = re.search(r"£([0-9,]+)\s*<span>Starter", plain)
    experienced = re.search(r"£([0-9,]+)\s*<span>Experienced", plain)
    hours = re.search(r'<span class="dfc-code-jphours[^"]*">([^<]+)</span>', body)
    pattern = re.search(r'<span class="dfc-code-jpwpattern[^"]*">([^<]+)</span>', body)
    title_tokens = {token for token in re.findall(r"[a-z0-9]+", title_en.lower()) if len(token) > 3}
    profile_tokens = {token for token in re.findall(r"[a-z0-9]+", profile_title.lower()) if len(token) > 3}
    overlap = title_tokens & profile_tokens
    direct = bool(overlap) and (profile_title.lower() in title_en.lower() or title_en.lower() in profile_title.lower() or score >= 0.68)
    return {
        "mapping_quality": "direct_uk_profile" if direct else "adjacent_uk_profile",
        "source_name": "UK National Careers",
        "source_url": url,
        "starter_annual_gbp": int(starter.group(1).replace(",", "")) if starter else None,
        "experienced_annual_gbp": int(experienced.group(1).replace(",", "")) if experienced else None,
        "typical_hours": html.unescape(hours.group(1)).strip() if hours else None,
        "working_pattern": html.unescape(pattern.group(1)).strip() if pattern else None,
        "raw_evidence_text": f"UK National Careers search for '{search_term}' while mapping '{title_en}' selected profile '{profile_title}' with score {score:.2f}. Profile summary: {desc}",
        "limitations": [] if direct else [f"Direct-first search boundary: a direct '{title_en}' profile was not automatically captured; selected adjacent UK profile '{profile_title}' and no fixed equivalence is inferred."],
    }


def base_new_row(job: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    now = datetime.now(timezone.utc).isoformat()
    slug = job["slug"]
    title_en = job["title_en"]
    title_zh = clean_zh(job.get("title_zh_seed") or title_en)
    queries = CN_QUERY_OVERRIDES.get(slug, [title_zh])
    cn_items = []
    for idx, query in enumerate(queries[:3], 1):
        item = parse_jobui_page(query, "exact" if idx == 1 else "close_adjacent")
        if item:
            item["evidence_id"] = f"cn_{idx:03d}"
            item["captured_at"] = now
            cn_items.append(item)
        time.sleep(1.2)
    us_source = parse_mynextmove(job.get("onet_code_seed"))
    uk = parse_ncs_profile(slug, title_en)
    row = {
        "slug": slug,
        "occupation": {
            "title_en": title_en,
            "title_zh_seed": job.get("title_zh_seed"),
            "title_zh_cleaned": title_zh,
            "soc_code_seed": job.get("soc_code_seed"),
            "onet_code_seed": job.get("onet_code_seed"),
        },
        "china_recruitment_evidence": {
            "status": "partial" if cn_items else "not_found",
            "exact_title_queries": queries,
            "adjacent_role_cluster": {
                "cluster_name": title_zh,
                "roles": queries,
                "reason": "Automated post-deploy collector used exact or close Chinese recruiting titles only; no model-filled salary facts.",
            },
            "evidence_items": cn_items,
            "evidence_limitations": ["China evidence is recruitment-market reference only, not official occupational wage."],
        },
        "us_official_evidence": {
            "mapping_quality": "exact_soc" if job.get("soc_code_seed") else "unavailable",
            "soc_code_used": job.get("soc_code_seed"),
            "mapping_source_url": f"https://www.mynextmove.org/profile/summary/{job.get('onet_code_seed')}" if job.get("onet_code_seed") else "",
            "wage_sources": [us_source] if us_source else [],
        },
        "uk_evidence": uk,
        "eu_context_evidence": {
            "status": "macro_context_only",
            "source_name": "Eurostat macro earnings context",
            "source_url": "https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Earnings_statistics",
            "raw_evidence_text": "Eurostat earnings statistics provide macro labour-market context; this row does not capture an occupation-specific EU salary.",
            "limitations": ["EU context is macro-only; no EU-wide occupational median salary is inferred."],
        },
        "quality_flags": {
            "has_cn_exact_or_close_source": bool(cn_items),
            "has_cn_two_source_types": len(cn_items) >= 2,
            "has_visible_sample_count": any(i.get("sample_count_visible") for i in cn_items),
            "has_real_raw_salary_text": bool(cn_items),
            "has_us_percentile_source": bool(us_source and (us_source.get("p10_annual_usd") or us_source.get("p90_annual_usd"))),
            "has_uk_direct_or_adjacent_source": uk["mapping_quality"] != "unavailable",
            "invalid_proxy_detected": False,
            "ready_for_asset_generation": bool(cn_items and us_source and uk["mapping_quality"] != "unavailable"),
        },
    }
    discovery = {
        "slug": slug,
        "cn_items": len(cn_items),
        "cn_queries": " | ".join(queries),
        "us_source": "yes" if us_source else "no",
        "uk_mapping_quality": uk["mapping_quality"],
        "uk_source_url": uk["source_url"],
        "ready_for_asset_generation": row["quality_flags"]["ready_for_asset_generation"],
    }
    return row, discovery


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "collection_plans").mkdir(parents=True, exist_ok=True)
    manifest = json.loads(MANIFEST.read_text())
    jobs = manifest["jobs"]
    controls = [json.loads(line) for line in CONTROL_EVIDENCE.read_text().splitlines() if line.strip()]
    control_by_slug = {row["slug"]: row for row in controls}
    rows: list[dict[str, Any]] = []
    discovery_rows: list[dict[str, Any]] = []
    for job in jobs:
        if job["batch_role"] == "control_100":
            rows.append(control_by_slug[job["slug"]])
            continue
        row, discovery = base_new_row(job)
        rows.append(row)
        discovery_rows.append(discovery)
    with OUT_JSONL.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")
    with DISCOVERY.open("w", encoding="utf-8", newline="") as handle:
        fieldnames = ["slug", "cn_items", "cn_queries", "us_source", "uk_mapping_quality", "uk_source_url", "ready_for_asset_generation"]
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(discovery_rows)
    validation = {
        "total_lines": len(rows),
        "control_rows_copied": sum(1 for j in jobs if j["batch_role"] == "control_100"),
        "new_rows_collected": len(discovery_rows),
        "new_rows_ready_for_asset_generation": sum(1 for row in discovery_rows if row["ready_for_asset_generation"]),
        "new_rows_with_cn_evidence": sum(1 for row in discovery_rows if row["cn_items"]),
        "new_rows_with_two_cn_items": sum(1 for row in discovery_rows if row["cn_items"] >= 2),
        "new_rows_with_us_source": sum(1 for row in discovery_rows if row["us_source"] == "yes"),
        "new_rows_with_uk_source": sum(1 for row in discovery_rows if row["uk_mapping_quality"] != "unavailable"),
        "generated_salary_asset": False,
        "generated_estimate_ledger": False,
    }
    VALIDATION.write_text(json.dumps(validation, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(validation, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
