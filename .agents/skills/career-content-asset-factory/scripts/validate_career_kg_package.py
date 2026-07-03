#!/usr/bin/env python3

import argparse
import json
import subprocess
import sys
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
REQUIRED_IDENTITY_FIELDS = [
    "standard_name_zh",
    "title_en",
    "soc_code",
    "onet_code",
    "aliases_zh",
    "aliases_en",
    "easily_confused_occupations",
]
REQUIRED_BLOCKS = [
    "definition",
    "core_responsibilities",
    "work_scenes",
    "skills_tools",
    "entry_path",
    "riasec_personality_boundary",
    "risk_ai_boundary",
    "adjacent_careers",
    "faq",
]
REQUIRED_PACKAGE_FILES = [
    "README.md",
    "qa_report.json",
    "dry_run_importer_report.json",
    "staging_preview_smoke.json",
    "fap_web_render_smoke.json",
    "sha256_manifest.json",
]


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def resolve_asset(package_dir: Path | None, asset_path: Path | None) -> Path:
    if asset_path:
        return asset_path
    if not package_dir:
        raise ValueError("--asset or --package-dir is required")
    assets = sorted(package_dir.glob("*.asset.json"))
    if len(assets) != 1:
        raise ValueError(f"expected exactly one *.asset.json in {package_dir}, found {len(assets)}")
    return assets[0]


def run_validator(script: str, asset_path: Path):
    result = subprocess.run(
        [sys.executable, str(SCRIPT_DIR / script), "--asset", str(asset_path)],
        text=True,
        capture_output=True,
        check=False,
    )
    try:
        report = json.loads(result.stdout)
    except json.JSONDecodeError:
        report = {"final_conclusion": "REPAIR_REQUIRED", "stdout": result.stdout, "stderr": result.stderr}
    return result.returncode, report


def validate_package(asset_path: Path, package_dir: Path | None):
    asset = read_json(asset_path)
    findings = []

    if package_dir:
        for file_name in REQUIRED_PACKAGE_FILES:
            if not (package_dir / file_name).exists():
                findings.append({"code": "package_file_missing", "file": file_name})
        if not (package_dir / asset_path.name).exists():
            findings.append({"code": "asset_not_inside_package_dir", "asset": str(asset_path)})

    identity = asset.get("identity", {})
    for field in REQUIRED_IDENTITY_FIELDS:
        if field not in identity:
            findings.append({"code": "identity_field_missing", "field": field})

    block_ids = [block.get("id") for block in asset.get("content_blocks", []) if isinstance(block, dict)]
    for block_id in REQUIRED_BLOCKS:
        if block_id not in block_ids:
            findings.append({"code": "content_block_missing", "block_id": block_id})

    if asset.get("production_import_approved") is not False:
        findings.append({"code": "production_import_approved_must_be_false"})
    if asset.get("staging_write_approved") is not False:
        findings.append({"code": "staging_write_approved_must_be_false"})

    for script in ["validate_career_kg_sources.py", "validate_career_kg_claim_boundaries.py"]:
        code, report = run_validator(script, asset_path)
        if code != 0:
            findings.append({"code": "subvalidator_failed", "script": script, "report": report})

    return findings


def main():
    parser = argparse.ArgumentParser(description="Validate a dry-run career KG package.")
    parser.add_argument("--package-dir", help="Package directory containing README, asset, reports, and SHA manifest.")
    parser.add_argument("--asset", help="Direct path to a career KG asset JSON.")
    parser.add_argument("--output", help="Optional JSON report path.")
    args = parser.parse_args()

    package_dir = Path(args.package_dir) if args.package_dir else None
    asset_path = resolve_asset(package_dir, Path(args.asset) if args.asset else None)
    findings = validate_package(asset_path, package_dir)
    report = {
        "package_dir": str(package_dir) if package_dir else None,
        "asset": str(asset_path),
        "finding_count": len(findings),
        "findings": findings,
        "final_conclusion": "PASS" if not findings else "REPAIR_REQUIRED",
    }
    if args.output:
        write_json(Path(args.output), report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if not findings else 1


if __name__ == "__main__":
    sys.exit(main())
