#!/usr/bin/env python3
"""Freeze PASS career-work-activities artifacts into a reusable baseline directory."""

from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

from work_activities_common import make_sha_manifest, read_jsonl, write_json


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--evidence", required=True)
    parser.add_argument("--synthesis", required=True)
    parser.add_argument("--assets", required=True)
    parser.add_argument("--asset-gate", required=True)
    parser.add_argument("--output-dir", required=True)
    return parser.parse_args()


def copy_file(src: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dest)


def main() -> int:
    args = parse_args()
    gate_payload = json.loads(Path(args.asset_gate).read_text(encoding="utf-8"))
    if gate_payload.get("final_conclusion") != "PASS":
        raise SystemExit(f"asset gate is not PASS: {gate_payload.get('final_conclusion')}")
    gate = read_jsonl(args.assets)
    output = Path(args.output_dir)
    output.mkdir(parents=True, exist_ok=True)
    copy_file(args.evidence, output / "evidence" / "career_work_activities_1046_evidence_repaired.jsonl")
    copy_file(args.synthesis, output / "synthesis" / "career_work_activities_1046_synthesis_repaired.jsonl")
    copy_file(args.assets, output / "assets" / "career_work_activities_1046_assets_repaired.jsonl")
    copy_file(args.asset_gate, output / "asset_gate.json")
    slug_count = len({row.get("slug") for row in gate})
    row_count = len(gate)
    validation = {
        "block_type": "career-work-activities",
        "final_conclusion": "CAREER_WORK_ACTIVITIES_BASELINE_FROZEN",
        "asset_rows": row_count,
        "unique_slugs": slug_count,
        "zh_CN_rows": sum(1 for row in gate if row.get("locale") == "zh-CN"),
        "en_rows": sum(1 for row in gate if row.get("locale") == "en"),
    }
    write_json(output / "baseline_validation.json", validation)
    manifest = make_sha_manifest(output)
    write_json(output / "baseline_sha256_manifest.json", manifest)
    print(f"FROZE_BASELINE {output} asset_rows={row_count} unique_slugs={slug_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
