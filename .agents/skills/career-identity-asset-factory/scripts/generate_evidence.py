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


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True, help="Career identity batch manifest JSON.")
    parser.add_argument("--output", required=True, help="Evidence JSONL output path.")
    return parser.parse_args()


def onet_url(code: str | None) -> str | None:
    if not code:
        return None
    return f"https://www.onetonline.org/link/summary/{code}"


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
            onet = item.get("onet_code_seed")
            soc = item.get("soc_code_seed")
            source_id = f"onet:{onet}" if onet else "seed:missing_onet"
            source = {
                "source_id": source_id,
                "source_name": "O*NET OnLine" if onet else "Canonical career seed",
                "url": onet_url(onet),
                "source_relation": "official_seed_mapping" if onet else "seed_mapping_requires_repair",
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
                    "official_title": title_en,
                    "cleaned_title_candidate": title_zh if locale == "zh-CN" else title_en,
                    "soc_code_seed": soc,
                    "onet_code_seed": onet,
                    "mapping_quality": "official_seed_mapping" if onet else "missing_official_mapping_requires_repair",
                    "boundary_type": "exact_or_seed_official_mapping",
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
                        "captured_fact": f"{title_en} is mapped to O*NET {onet} and SOC {soc} in the canonical seed." if onet else f"{title_en} lacks an O*NET mapping in the canonical seed and requires official authority repair.",
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
