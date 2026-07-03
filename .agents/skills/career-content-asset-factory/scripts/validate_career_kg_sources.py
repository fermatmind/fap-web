#!/usr/bin/env python3

import argparse
import json
import sys
from pathlib import Path


FACT_AUTHORITY_LABELS = ["O*NET", "BLS", "My Next Move"]
MARKET_ONLY_TERMS = ["招聘", "百科", "baike", "wiki", "百度", "知乎", "boss", "猎聘", "拉勾"]


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def validate(asset):
    findings = []
    sources = asset.get("sources")
    if not isinstance(sources, list) or not sources:
        return [{"code": "sources_missing", "location": "$.sources"}]

    source_by_key = {}
    fact_labels = set()
    for index, source in enumerate(sources):
        key = source.get("key")
        label = source.get("label", "")
        authority = source.get("authority")
        if not key:
            findings.append({"code": "source_key_missing", "location": f"$.sources[{index}].key"})
            continue
        source_by_key[key] = source
        if authority == "occupation_fact":
            for expected in FACT_AUTHORITY_LABELS:
                if expected.lower() in label.lower():
                    fact_labels.add(expected)
        lower_label = label.lower()
        if any(term in lower_label for term in MARKET_ONLY_TERMS) and authority == "occupation_fact":
            findings.append({
                "code": "market_source_used_as_fact_authority",
                "location": f"$.sources[{index}]",
                "label": label,
            })

    for expected in FACT_AUTHORITY_LABELS:
        if expected not in fact_labels:
            findings.append({"code": "required_fact_authority_missing", "authority": expected})

    for block_index, block in enumerate(asset.get("content_blocks", [])):
        refs = block.get("source_refs", [])
        if not refs:
            findings.append({"code": "content_block_source_refs_missing", "location": f"$.content_blocks[{block_index}].source_refs"})
        for ref in refs:
            if ref not in source_by_key:
                findings.append({
                    "code": "source_ref_unresolved",
                    "location": f"$.content_blocks[{block_index}].source_refs",
                    "source_ref": ref,
                })

    policy = asset.get("market_reference_policy", {})
    blocked_usage = policy.get("blocked_usage") if isinstance(policy, dict) else None
    if not isinstance(blocked_usage, list) or not blocked_usage:
        findings.append({"code": "market_reference_blocked_usage_missing", "location": "$.market_reference_policy.blocked_usage"})

    return findings


def main():
    parser = argparse.ArgumentParser(description="Validate career KG source traceability and authority boundaries.")
    parser.add_argument("--asset", required=True, help="Path to career KG asset JSON.")
    parser.add_argument("--output", help="Optional JSON report path.")
    args = parser.parse_args()

    asset = read_json(Path(args.asset))
    findings = validate(asset)
    report = {
        "asset": args.asset,
        "finding_count": len(findings),
        "findings": findings,
        "final_conclusion": "PASS" if not findings else "REPAIR_REQUIRED",
    }
    if args.output:
        Path(args.output).parent.mkdir(parents=True, exist_ok=True)
        Path(args.output).write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if not findings else 1


if __name__ == "__main__":
    sys.exit(main())
