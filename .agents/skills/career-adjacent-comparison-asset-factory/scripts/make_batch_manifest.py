#!/usr/bin/env python3
"""Create career-adjacent-comparison control/new batch manifests."""
from __future__ import annotations

import argparse
from pathlib import Path
from adjacent_common import load_seed, read_jsonl, write_csv, write_json


def parse_args():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--seed", default="generated/career-salary-seed/career_jobs_1046_salary_asset_seed.json")
    p.add_argument("--control-baseline", default=None)
    p.add_argument("--control-count", type=int, default=0)
    p.add_argument("--new-count", type=int, default=50)
    p.add_argument("--batch-index", type=int, required=True)
    p.add_argument("--output-dir", required=True)
    return p.parse_args()


def main() -> int:
    a = parse_args()
    seed = load_seed(a.seed)
    if a.control_baseline:
        assets_path = Path(a.control_baseline) / "assets"
        control_rows = read_jsonl(sorted(assets_path.glob("*.jsonl"))[0])
        control_slugs: list[str] = []
        for row in control_rows:
            if row["locale"] == "en" and row["slug"] not in control_slugs:
                control_slugs.append(row["slug"])
        a.control_count = len(control_slugs)
    new_start = a.control_count + 1
    new_end = min(a.control_count + a.new_count, len(seed))
    rows = []
    for row in seed[:a.control_count]:
        rows.append({**row, "batch_index": a.batch_index, "batch_role": f"control_{a.control_count}", "expected_locales": ["zh-CN", "en"]})
    for row in seed[new_start - 1:new_end]:
        rows.append({**row, "batch_index": a.batch_index, "batch_role": f"new_{new_end - a.control_count}", "expected_locales": ["zh-CN", "en"]})
    out = Path(a.output_dir); out.mkdir(parents=True, exist_ok=True)
    json_path = out / f"career_adjacent_comparison_batch_{a.batch_index:03d}_manifest.json"
    csv_path = out / f"career_adjacent_comparison_batch_{a.batch_index:03d}_manifest.csv"
    val_path = out / f"career_adjacent_comparison_batch_{a.batch_index:03d}_manifest_validation.json"
    write_json(json_path, {"batch_index": a.batch_index, "control_count": a.control_count, "new_count": new_end - a.control_count, "rows": rows})
    fields = ["batch_index", "batch_role", "seed_ordinal", "slug", "title_en", "title_zh", "title_zh_seed", "soc_code_seed", "onet_code_seed", "expected_locales"]
    write_csv(csv_path, rows, fields)
    slugs = [r["slug"] for r in rows]
    validation = {
        "final_conclusion": "PASS",
        "total_rows": len(rows),
        "control_count": a.control_count,
        "new_count": new_end - a.control_count,
        "duplicate_slug_count": len(slugs) - len(set(slugs)),
        "new_ordinal_start": new_start if new_end >= new_start else None,
        "new_ordinal_end": new_end,
        "content_generated": False,
    }
    if validation["duplicate_slug_count"]:
        validation["final_conclusion"] = "REPAIR_REQUIRED"
    write_json(val_path, validation)
    print(json_path)
    return 0 if validation["final_conclusion"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
