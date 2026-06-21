#!/usr/bin/env python3
"""Create a career-identity batch manifest from the canonical seed."""

from __future__ import annotations

import argparse
import json

from identity_common import LOCALES, load_seed, normalize_seed_row, write_csv, write_json


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", required=True, help="Canonical 1046 career seed JSON.")
    parser.add_argument("--batch-index", type=int, required=True, help="Identity batch index.")
    parser.add_argument("--control-count", type=int, default=0, help="Previous PASS baseline count.")
    parser.add_argument("--new-count", type=int, default=50, help="New careers to add.")
    parser.add_argument("--output-json", required=True, help="Manifest JSON output path.")
    parser.add_argument("--output-csv", required=True, help="Manifest CSV output path.")
    parser.add_argument("--validation-json", required=True, help="Manifest validation JSON output path.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    seed_rows = [normalize_seed_row(row, idx + 1) for idx, row in enumerate(load_seed(args.seed))]
    by_ordinal = {row["seed_ordinal"]: row for row in seed_rows}
    control = [by_ordinal[i] for i in range(1, args.control_count + 1) if i in by_ordinal]
    start = args.control_count + 1
    end = min(args.control_count + args.new_count, len(seed_rows))
    new = [by_ordinal[i] for i in range(start, end + 1) if i in by_ordinal]
    rows = []
    for role, items in ((f"control_{len(control)}", control), (f"new_{len(new)}", new)):
        for item in items:
            rows.append(
                {
                    "batch_index": args.batch_index,
                    "batch_role": role,
                    "seed_ordinal": item["seed_ordinal"],
                    "slug": item["slug"],
                    "title_en": item["title_en"],
                    "title_zh": item["title_zh"],
                    "title_zh_seed": item["title_zh_seed"],
                    "soc_code_seed": item["soc_code_seed"],
                    "onet_code_seed": item["onet_code_seed"],
                    "expected_locales": list(LOCALES),
                }
            )
    duplicate_slugs = len(rows) - len({row["slug"] for row in rows})
    validation = {
        "batch_index": args.batch_index,
        "control_count": len(control),
        "new_count": len(new),
        "total_rows": len(rows),
        "duplicate_slug_count": duplicate_slugs,
        "new_ordinal_start": start if new else None,
        "new_ordinal_end": end if new else None,
        "final_conclusion": "PASS" if duplicate_slugs == 0 and len(new) == max(0, end - start + 1) else "REPAIR_REQUIRED",
    }
    write_json(args.output_json, {"block_type": "career-identity", "batch_index": args.batch_index, "control_count": len(control), "new_count": len(new), "rows": rows})
    fields = ["batch_index", "batch_role", "seed_ordinal", "slug", "title_en", "title_zh", "title_zh_seed", "soc_code_seed", "onet_code_seed", "expected_locales"]
    write_csv(args.output_csv, [{**row, "expected_locales": json.dumps(row["expected_locales"])} for row in rows], fields)
    write_json(args.validation_json, validation)
    print(json.dumps(validation, ensure_ascii=False, indent=2))
    return 0 if validation["final_conclusion"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
