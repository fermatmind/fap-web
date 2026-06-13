#!/usr/bin/env python3
"""Create China recruitment evidence collection plan from a batch manifest."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import load_manifest, write_csv


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path, help="batch manifest JSON")
    parser.add_argument("--output", required=True, type=Path, help="CSV collection plan")
    args = parser.parse_args()
    rows = []
    for job in load_manifest(args.input):
        zh = job.get("title_zh_seed") or job["title_en"]
        rows.append({
            "slug": job["slug"],
            "title_en": job["title_en"],
            "title_zh_seed": job.get("title_zh_seed"),
            "priority_queries": f"{zh} 工资 职友集 | {zh} 薪资 招聘 | {zh} 月薪 BOSS 猎聘 智联",
            "required_capture": "specific URL plus salary/sample/distribution/job-posting text",
            "forbidden": "official China occupational wage wording; invented sample count",
        })
    write_csv(args.output, rows)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
