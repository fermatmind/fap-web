#!/usr/bin/env python3
"""Create US official evidence collection plan from a batch manifest."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import load_manifest, write_csv


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    rows = []
    for job in load_manifest(args.input):
        soc = job.get("soc_code_seed")
        onet = job.get("onet_code_seed")
        rows.append({
            "slug": job["slug"],
            "soc_code_seed": soc,
            "onet_code_seed": onet,
            "wage_priority": f"BLS OEWS SOC {soc}; CareerOneStop; BLS OOH" if soc else "O*NET/My Next Move title search; reviewed SOC override if needed",
            "mapping_priority": f"O*NET {onet or soc}; My Next Move; BLS OOH",
            "outlook_priority": "BLS OOH or BLS Employment Projections only as outlook/openings context",
            "forbidden_source_name": "BLS Employment Projections as wage_sources.source_name",
        })
    write_csv(args.output, rows)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
