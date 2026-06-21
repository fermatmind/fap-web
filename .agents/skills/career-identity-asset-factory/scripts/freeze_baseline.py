#!/usr/bin/env python3
"""Freeze a PASS career-identity baseline with validation and SHA manifests."""

from __future__ import annotations

import argparse
import datetime
import json
import shutil
from pathlib import Path

from identity_common import read_jsonl, sha256_file, write_json


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--evidence", required=True, help="PASS evidence JSONL.")
    parser.add_argument("--synthesis", required=True, help="PASS synthesis JSONL.")
    parser.add_argument("--assets", required=True, help="PASS asset JSONL.")
    parser.add_argument("--audit", required=True, help="PASS asset audit JSON.")
    parser.add_argument("--output-dir", required=True, help="Frozen baseline output directory.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    output = Path(args.output_dir)
    if output.exists():
        raise SystemExit(f"Refusing to overwrite existing baseline: {output}")
    (output / "evidence").mkdir(parents=True)
    (output / "synthesis").mkdir()
    (output / "assets").mkdir()
    (output / "asset_audit").mkdir()
    shutil.copy2(args.evidence, output / "evidence" / Path(args.evidence).name)
    shutil.copy2(args.synthesis, output / "synthesis" / Path(args.synthesis).name)
    shutil.copy2(args.assets, output / "assets" / Path(args.assets).name)
    shutil.copy2(args.audit, output / "asset_audit" / Path(args.audit).name)
    evidence = read_jsonl(args.evidence)
    synthesis = read_jsonl(args.synthesis)
    assets = read_jsonl(args.assets)
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    validation = {
        "generated_at": now,
        "final_conclusion": "CAREER_IDENTITY_BASELINE_FROZEN",
        "baseline_slug_count": len({row.get("slug") for row in assets}),
        "evidence_line_count": len(evidence),
        "synthesis_line_count": len(synthesis),
        "asset_line_count": len(assets),
        "zh_CN_asset_count": sum(1 for row in assets if row.get("locale") == "zh-CN"),
        "en_asset_count": sum(1 for row in assets if row.get("locale") == "en"),
        "search_projection_generated": False,
        "runtime_modified": False,
        "seo_modified": False,
        "cms_imported": False,
        "staging_created": False,
        "production_imported": False,
    }
    write_json(output / "baseline_validation.json", validation)
    files = []
    for path in sorted(output.rglob("*")):
        if path.is_file() and path.name != "baseline_sha256_manifest.json":
            files.append({"path": str(path), "sha256": sha256_file(path), "bytes": path.stat().st_size})
    write_json(output / "baseline_sha256_manifest.json", {"generated_at": now, "files": files})
    (output / "baseline_freeze_report.md").write_text(
        "# Career Identity Baseline Freeze\n\n"
        "- final_conclusion: `CAREER_IDENTITY_BASELINE_FROZEN`\n"
        f"- baseline_slug_count: `{validation['baseline_slug_count']}`\n"
        "- search_projection/runtime/SEO/CMS/staging/production: `false`\n",
        encoding="utf-8",
    )
    print(json.dumps(validation, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
