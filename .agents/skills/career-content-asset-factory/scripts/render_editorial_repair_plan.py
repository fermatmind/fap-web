#!/usr/bin/env python3
"""Render editorial findings into a repair plan without rewriting content."""

from __future__ import annotations

import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path

from editorial_quality_common import DO_NOT_MODIFY_FIELDS, markdown_table, read_json, write_json, utc_now


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--findings", default="generated/career-content-editorial-quality-gate/editorial_quality_findings.csv")
    parser.add_argument("--output-json", default="generated/career-content-editorial-quality-gate/editorial_repair_plan.json")
    parser.add_argument("--output-md", default="generated/career-content-editorial-quality-gate/editorial_repair_plan.md")
    args = parser.parse_args()

    findings_path = Path(args.findings)
    if not findings_path.exists():
        raise SystemExit(f"Missing findings CSV: {findings_path}")

    grouped: dict[tuple[str, str], list[dict]] = defaultdict(list)
    with findings_path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            grouped[(row["slug"], row["locale"])].append(row)

    repairs = []
    for (slug, locale), findings in sorted(grouped.items()):
        repairs.append({
            "slug": slug,
            "locale": locale,
            "block": "career-page-assembly",
            "affected_fields": sorted({finding["field_path"] for finding in findings}),
            "recommended_rewrite_type": "editorial_quality_repair_without_new_facts",
            "preserve_fields": DO_NOT_MODIFY_FIELDS,
            "forbidden_changes": [
                "Do not change source URLs, source IDs, evidence IDs, row hashes, seed identity, official codes, salary values, AI impact scores, or runtime SEO.",
                "Do not generate new career facts.",
            ],
            "source_refs_to_use": ["completed PASS block assets referenced by page assembly row"],
            "max_repair_scope": "reader-facing wording only, selected fields only",
            "human_review_required": any(str(f.get("requires_human_review")).lower() == "true" for f in findings),
        })

    plan = {
        "generated_at": utc_now(),
        "plan_type": "career_content_editorial_repair_plan",
        "repairs": repairs,
        "content_rewritten": False,
        "baseline_mutated": False,
    }
    write_json(Path(args.output_json), plan)
    md = "# Editorial Repair Plan\n\n"
    md += "This plan contains repair instructions only. It does not rewrite content.\n\n"
    md += f"- repair rows: `{len(repairs)}`\n"
    md += f"- content_rewritten: `false`\n"
    md += f"- baseline_mutated: `false`\n\n"
    md += markdown_table(repairs, ["slug", "locale", "recommended_rewrite_type", "max_repair_scope", "human_review_required"], 40)
    Path(args.output_md).write_text(md, encoding="utf-8")
    print(json.dumps({"repair_rows": len(repairs), "output": args.output_json}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
