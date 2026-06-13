#!/usr/bin/env python3
"""Create a gated career salary batch manifest from the seed."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import load_manifest, load_seed, write_csv, write_json


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--batch-size", type=int, default=50)
    parser.add_argument("--baseline-manifest", type=Path)
    parser.add_argument("--start-after-baseline", action="store_true")
    parser.add_argument("--csv-output", type=Path)
    args = parser.parse_args()

    seed_jobs = load_seed(args.seed)
    baseline_slugs: list[str] = []
    if args.baseline_manifest and args.baseline_manifest.exists():
        baseline_slugs = [job["slug"] for job in load_manifest(args.baseline_manifest)]

    selected: list[dict] = []
    for job in seed_jobs:
        if args.start_after_baseline and job["slug"] in baseline_slugs:
            continue
        if not args.start_after_baseline and job["slug"] in baseline_slugs:
            continue
        occ = job.get("occupation", {})
        selected.append({
            "batch_index": len(selected) + 1,
            "seed_ordinal": job.get("ordinal"),
            "slug": job["slug"],
            "title_en": occ.get("title_en"),
            "title_zh_seed": occ.get("title_zh"),
            "soc_code_seed": occ.get("soc_code"),
            "onet_code_seed": occ.get("onet_code"),
            "batch_role": "new",
            "expected_locales": ["zh-CN", "en"],
        })
        if len(selected) >= args.batch_size:
            break

    manifest = {
        "source_seed": str(args.seed),
        "baseline_manifest": str(args.baseline_manifest) if args.baseline_manifest else None,
        "batch_size": args.batch_size,
        "jobs": selected,
        "validation": {
            "total_slugs": len(selected),
            "duplicate_slug_count": len(selected) - len({row["slug"] for row in selected}),
            "seed_order_preserved": True,
        },
    }
    write_json(args.output, manifest)
    write_csv(args.csv_output or args.output.with_suffix(".csv"), selected)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
