#!/usr/bin/env python3
"""Select a representative read-only editorial QA sample."""

from __future__ import annotations

import argparse
from pathlib import Path

from editorial_quality_common import read_seed, select_sample_slugs, write_csv, write_json, utc_now


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", default="generated/career-salary-seed/career_jobs_1046_salary_asset_seed.json")
    parser.add_argument("--page-assembly", default="generated/career-page-assembly-v1-1046-pass-baseline/career_page_assembly_1046_v1.jsonl")
    parser.add_argument("--output-dir", default="generated/career-content-editorial-quality-gate")
    parser.add_argument("--minimum", type=int, default=50)
    args = parser.parse_args()

    seed_path = Path(args.seed)
    page_path = Path(args.page_assembly)
    if not seed_path.exists():
        raise SystemExit(f"Missing seed: {seed_path}")
    if not page_path.exists():
        raise SystemExit(f"Missing page assembly baseline: {page_path}")

    rows = select_sample_slugs(read_seed(seed_path), minimum=args.minimum)
    output_dir = Path(args.output_dir)
    manifest = {
        "generated_at": utc_now(),
        "sample_policy": "first_10_plus_high_risk_plus_final_batch_fill",
        "sample_slug_count": len(rows),
        "seed": str(seed_path),
        "page_assembly": str(page_path),
        "slugs": [
            {
                "seed_ordinal": row.get("ordinal"),
                "slug": row.get("slug"),
                "title_en": (row.get("occupation") or {}).get("title_en"),
                "title_zh": (row.get("occupation") or {}).get("title_zh"),
                "soc_code": (row.get("occupation") or {}).get("soc_code"),
                "onet_code": (row.get("occupation") or {}).get("onet_code"),
                "expected_locales": ["zh-CN", "en"],
            }
            for row in rows
        ],
        "content_generated": False,
        "baseline_mutated": False,
    }
    write_json(output_dir / "sample_manifest.json", manifest)
    write_json(output_dir / "editorial_quality_sample_manifest.json", manifest)
    write_csv(
        output_dir / "sample_slugs.csv",
        manifest["slugs"],
        ["seed_ordinal", "slug", "title_en", "title_zh", "soc_code", "onet_code", "expected_locales"],
    )
    write_csv(
        output_dir / "editorial_quality_sample_slugs.csv",
        manifest["slugs"],
        ["seed_ordinal", "slug", "title_en", "title_zh", "soc_code", "onet_code", "expected_locales"],
    )
    print(f"selected {len(rows)} slugs -> {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
