#!/usr/bin/env python3

import argparse
import json
import re
import sys
from pathlib import Path


FORBIDDEN_PATTERNS = [
    (re.compile(r"(就业|录用|升职|转行).{0,8}(保证|包|一定|必然)"), "employment_guarantee"),
    (re.compile(r"(薪资|收入|工资).{0,8}(保证|包|一定|必然)"), "salary_guarantee"),
    (re.compile(r"(人格|MBTI|RIASEC|兴趣).{0,12}(决定|注定).{0,12}(职业|工作)"), "personality_determines_career"),
    (re.compile(r"(AI|人工智能).{0,12}(完全|必然|一定).{0,12}(替代|淘汰)"), "absolute_ai_replacement"),
]


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def collect_strings(value, location="$"):
    if isinstance(value, str):
        yield location, value
    elif isinstance(value, list):
        for index, item in enumerate(value):
            yield from collect_strings(item, f"{location}[{index}]")
    elif isinstance(value, dict):
        for key, item in value.items():
            yield from collect_strings(item, f"{location}.{key}")


def validate(asset):
    findings = []
    for location, text in collect_strings(asset):
        if location.startswith("$.market_reference_policy.blocked_usage"):
            continue
        for pattern, code in FORBIDDEN_PATTERNS:
            if pattern.search(text):
                findings.append({"code": code, "location": location, "text": text})

    for field in ["production_import_approved", "staging_write_approved", "cms_write_performed", "seo_runtime_release_performed"]:
        if asset.get(field) is not False:
            findings.append({"code": "release_flag_must_be_false", "location": f"$.{field}", "value": asset.get(field)})

    boundaries = asset.get("release_boundaries", {})
    if not isinstance(boundaries, dict):
        findings.append({"code": "release_boundaries_missing", "location": "$.release_boundaries"})
    else:
        for key, value in boundaries.items():
            if value is not False:
                findings.append({"code": "release_boundary_must_be_false", "location": f"$.release_boundaries.{key}", "value": value})

    return findings


def main():
    parser = argparse.ArgumentParser(description="Validate career KG claim and release boundaries.")
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
