#!/usr/bin/env python3
"""Create a career-work-activities batch manifest from the canonical career seed."""

from __future__ import annotations

import argparse
from pathlib import Path

from work_activities_common import load_seed, normalize_seed_row, write_csv, write_json


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", required=True, help="Canonical 1046 career seed JSON.")
    parser.add_argument("--output", required=True, help="Output manifest JSON path.")
    parser.add_argument("--csv-output", help="Optional manifest CSV path.")
    parser.add_argument("--batch-index", type=int, required=True)
    parser.add_argument("--start-ordinal", type=int, required=True)
    parser.add_argument("--batch-size", type=int, default=50)
    parser.add_argument("--control-count", type=int, default=0)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    seed_rows = [normalize_seed_row(row, index) for index, row in enumerate(load_seed(args.seed), start=1)]
    by_ordinal = {row["seed_ordinal"]: row for row in seed_rows}
    rows = []
    for ordinal in range(1, args.control_count + 1):
        seed = by_ordinal.get(ordinal)
        if seed:
            rows.append({**seed, "batch_index": args.batch_index, "batch_role": f"control_{args.control_count}", "expected_locales": ["zh-CN", "en"]})
    for ordinal in range(args.start_ordinal, args.start_ordinal + args.batch_size):
        seed = by_ordinal.get(ordinal)
        if seed:
            rows.append({**seed, "batch_index": args.batch_index, "batch_role": f"new_{args.batch_size}", "expected_locales": ["zh-CN", "en"]})

    payload = {
        "block_type": "career-work-activities",
        "batch_index": args.batch_index,
        "control_count": args.control_count,
        "new_count": len([row for row in rows if str(row["batch_role"]).startswith("new_")]),
        "total_rows": len(rows),
        "rows": rows,
    }
    write_json(args.output, payload)
    if args.csv_output:
        write_csv(
            args.csv_output,
            rows,
            ["batch_index", "batch_role", "seed_ordinal", "slug", "title_en", "title_zh", "title_zh_seed", "soc_code_seed", "onet_code_seed", "expected_locales"],
        )
    print(f"WROTE_MANIFEST {Path(args.output)} rows={len(rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
