#!/usr/bin/env python3
"""Generate career-identity evidence rows from a validated manifest.

This script uses canonical seed fields and official O*NET/SOC handles as source
authority inputs. It does not mutate the seed. Rows that lack official mapping
fields are emitted with boundary flags for downstream evidence audit repair.
"""

from __future__ import annotations

import argparse
import datetime
import json

from identity_common import row_hash, write_jsonl, read_json


AUTHORITY_REPAIR_MAP = {
    "actors": {
        "official_title": "Actors",
        "soc_code": "27-2011",
        "onet_code": "27-2011.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/27-2011.00",
        "source_id": "onet:27-2011.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
    "compliance-officers": {
        "official_title": "Compliance Officers",
        "soc_code": "13-1041",
        "onet_code": "13-1041.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/13-1041.00",
        "source_id": "onet:13-1041.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
    "computer-hardware-engineers": {
        "official_title": "Computer Hardware Engineers",
        "soc_code": "17-2061",
        "onet_code": "17-2061.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/17-2061.00",
        "source_id": "onet:17-2061.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
    "computer-programmers": {
        "official_title": "Computer Programmers",
        "soc_code": "15-1251",
        "onet_code": "15-1251.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/15-1251.00",
        "source_id": "onet:15-1251.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
    "economists": {
        "official_title": "Economists",
        "soc_code": "19-3011",
        "onet_code": "19-3011.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/19-3011.00",
        "source_id": "onet:19-3011.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
    "electrical-and-electronics-engineers": {
        "official_title": "Electrical and Electronics Engineers",
        "soc_code": "17-2070",
        "onet_code": None,
        "source_name": "BLS Occupational Outlook Handbook",
        "url": "https://www.bls.gov/ooh/architecture-and-engineering/electrical-and-electronics-engineers.htm",
        "source_id": "bls-ooh:electrical-and-electronics-engineers",
        "source_relation": "official_bls_aggregate_repair",
        "mapping_quality": "official_bls_aggregate_repair",
        "boundary_type": "official aggregate SOC/BLS boundary repair",
    },
    "industrial-engineers": {
        "official_title": "Industrial Engineers",
        "soc_code": "17-2112",
        "onet_code": "17-2112.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/17-2112.00",
        "source_id": "onet:17-2112.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
    "logisticians": {
        "official_title": "Logisticians",
        "soc_code": "13-1081",
        "onet_code": "13-1081.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/13-1081.00",
        "source_id": "onet:13-1081.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
    "mathematicians-and-statisticians": {
        "official_title": "Mathematicians and Statisticians",
        "soc_code": "15-2020",
        "onet_code": None,
        "source_name": "BLS Occupational Outlook Handbook",
        "url": "https://www.bls.gov/ooh/math/mathematicians-and-statisticians.htm",
        "source_id": "bls-ooh:mathematicians-and-statisticians",
        "source_relation": "official_bls_aggregate_repair",
        "mapping_quality": "official_bls_aggregate_repair",
        "boundary_type": "official aggregate SOC/BLS boundary repair",
    },
    "mechanical-engineers": {
        "official_title": "Mechanical Engineers",
        "soc_code": "17-2141",
        "onet_code": "17-2141.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/17-2141.00",
        "source_id": "onet:17-2141.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
    "network-and-computer-systems-administrators": {
        "official_title": "Network and Computer Systems Administrators",
        "soc_code": "15-1244",
        "onet_code": "15-1244.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/15-1244.00",
        "source_id": "onet:15-1244.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
    "operations-research-analysts": {
        "official_title": "Operations Research Analysts",
        "soc_code": "15-2031",
        "onet_code": "15-2031.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/15-2031.00",
        "source_id": "onet:15-2031.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
    "personal-financial-advisors": {
        "official_title": "Personal Financial Advisors",
        "soc_code": "13-2052",
        "onet_code": "13-2052.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/13-2052.00",
        "source_id": "onet:13-2052.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
    "public-relations-specialists": {
        "official_title": "Public Relations Specialists",
        "soc_code": "27-3031",
        "onet_code": "27-3031.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/27-3031.00",
        "source_id": "onet:27-3031.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
    "sales-engineers": {
        "official_title": "Sales Engineers",
        "soc_code": "41-9031",
        "onet_code": "41-9031.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/41-9031.00",
        "source_id": "onet:41-9031.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
    "technical-writers": {
        "official_title": "Technical Writers",
        "soc_code": "27-3042",
        "onet_code": "27-3042.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/27-3042.00",
        "source_id": "onet:27-3042.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
    "training-and-development-managers": {
        "official_title": "Training and Development Managers",
        "soc_code": "11-3131",
        "onet_code": "11-3131.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/11-3131.00",
        "source_id": "onet:11-3131.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
    "training-and-development-specialists": {
        "official_title": "Training and Development Specialists",
        "soc_code": "13-1151",
        "onet_code": "13-1151.00",
        "source_name": "O*NET OnLine",
        "url": "https://www.onetonline.org/link/summary/13-1151.00",
        "source_id": "onet:13-1151.00",
        "source_relation": "official_onet_direct_repair",
        "mapping_quality": "official_onet_direct_repair",
        "boundary_type": "official direct O*NET profile repair",
    },
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True, help="Career identity batch manifest JSON.")
    parser.add_argument("--output", required=True, help="Evidence JSONL output path.")
    return parser.parse_args()


def onet_url(code: str | None) -> str | None:
    if not code:
        return None
    return f"https://www.onetonline.org/link/summary/{code}"


def repaired_identity(item: dict) -> dict | None:
    return AUTHORITY_REPAIR_MAP.get(item["slug"])


def main() -> int:
    args = parse_args()
    manifest = read_json(args.manifest)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    rows = []
    for item in manifest.get("rows", []):
        if not str(item.get("batch_role", "")).startswith("new_"):
            continue
        for locale in item.get("expected_locales", ["en", "zh-CN"]):
            title_en = item.get("title_en")
            title_zh = item.get("title_zh")
            repair = repaired_identity(item)
            onet = item.get("onet_code_seed") or (repair or {}).get("onet_code")
            soc = item.get("soc_code_seed") or (repair or {}).get("soc_code")
            source_id = (repair or {}).get("source_id") or (f"onet:{onet}" if onet else "seed:missing_onet")
            mapping_quality = (repair or {}).get("mapping_quality") or ("official_seed_mapping" if onet else "missing_official_mapping_requires_repair")
            source_relation = (repair or {}).get("source_relation") or ("official_seed_mapping" if onet else "seed_mapping_requires_repair")
            official_title = (repair or {}).get("official_title") or title_en
            boundary_type = (repair or {}).get("boundary_type") or "exact_or_seed_official_mapping"
            source = {
                "source_id": source_id,
                "source_name": (repair or {}).get("source_name") or ("O*NET OnLine" if onet else "Canonical career seed"),
                "url": (repair or {}).get("url") or onet_url(onet),
                "source_relation": source_relation,
                "boundary": "Official occupation identity mapping source. Does not mutate canonical seed.",
            }
            evidence_id = f"{item['slug']}:identity:official-boundary"
            row = {
                "ledger_type": "career-identity_evidence",
                "asset_version": "career_identity_v1",
                "block_type": "career-identity",
                "slug": item["slug"],
                "locale": locale,
                "occupation": title_zh if locale == "zh-CN" else title_en,
                "seed_ordinal": int(item["seed_ordinal"]),
                "batch_role": item["batch_role"],
                "summary": None,
                "facts": {
                    "raw_seed_title_en": title_en,
                    "raw_seed_title_zh": title_zh,
                    "title_zh_seed": item.get("title_zh_seed"),
                    "official_title": official_title,
                    "cleaned_title_candidate": title_zh if locale == "zh-CN" else title_en,
                    "soc_code_seed": soc,
                    "onet_code_seed": onet,
                    "mapping_quality": mapping_quality,
                    "boundary_type": boundary_type,
                    "canonical_seed_mutated": False,
                    "title_similarity_proxy_used": False,
                    "ambiguous_alias_accepted": False,
                    "dirty_title_review_required": False,
                },
                "items": [
                    {
                        "evidence_id": evidence_id,
                        "item_type": "official_identity_boundary",
                        "source_id": source_id,
                        "captured_fact": (
                            f"{title_en} is mapped to O*NET {onet} and SOC {soc} in the canonical seed."
                            if item.get("onet_code_seed")
                            else (
                                f"{title_en} has an official identity repair boundary from {source['source_name']} with"
                                f" {'O*NET ' + onet + ' and ' if onet else ''}SOC {soc}."
                                if repair
                                else f"{title_en} lacks an O*NET mapping in the canonical seed and requires official authority repair."
                            )
                        ),
                        "boundary": "Identity evidence only; not compensation, automation/risk, work-activities, or frontend fallback evidence.",
                    }
                ],
                "sources": [source],
                "evidence_used": [evidence_id],
                "derived_from_synthesis": None,
                "limitations": ["Identity evidence is limited to official boundary/title/classification mapping and does not describe compensation, fit, work activities, or outcomes."],
                "audit_fields": {
                    "generator": "career-identity generate_evidence.py",
                    "generated_at": now,
                },
            }
            row["audit_fields"]["row_hash"] = row_hash(row)
            rows.append(row)
    write_jsonl(args.output, rows)
    print(json.dumps({"row_count": len(rows), "output": args.output}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
