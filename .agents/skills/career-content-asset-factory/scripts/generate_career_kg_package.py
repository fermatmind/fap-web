#!/usr/bin/env python3

import argparse
import copy
import hashlib
import json
import re
import sys
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_DIR = SCRIPT_DIR.parent
TEMPLATE_DIR = SKILL_DIR / "templates"

ASSET_TEMPLATE = TEMPLATE_DIR / "career_kg_asset_package_template.json"
README_TEMPLATE = TEMPLATE_DIR / "career_kg_readme_template.md"

CONTENT_REPORTS = [
    "qa_report.json",
    "dry_run_importer_report.json",
    "staging_preview_smoke.json",
    "fap_web_render_smoke.json",
]


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_text(path: Path, text: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def slug_title(slug: str) -> str:
    return " ".join(part.capitalize() for part in slug.split("-"))


def pr_number(pr_id: str) -> str:
    match = re.search(r"(\d+)$", pr_id)
    if not match:
        raise ValueError(f"pr_id must end with digits: {pr_id}")
    return match.group(1)


def replace_tokens(value, tokens):
    if isinstance(value, str):
        for key, replacement in tokens.items():
            value = value.replace("{{" + key + "}}", str(replacement))
        return value
    if isinstance(value, list):
        return [replace_tokens(item, tokens) for item in value]
    if isinstance(value, dict):
        return {key: replace_tokens(item, tokens) for key, item in value.items()}
    return value


def validate_batch(batch):
    errors = []
    if batch.get("schema_version") != "fermatmind.career_kg.confirmed_batch.v1":
        errors.append("schema_version must be fermatmind.career_kg.confirmed_batch.v1")
    if batch.get("source") != "operator_confirmed":
        errors.append("source must be operator_confirmed")
    for flag in ["cms_write_authorized", "production_import_authorized", "seo_runtime_release_authorized"]:
        if batch.get(flag) is not False:
            errors.append(f"{flag} must be false")
    items = batch.get("items")
    if not isinstance(items, list) or not 1 <= len(items) <= 20:
        errors.append("items must contain 1-20 confirmed occupations")
        return errors
    seen = set()
    for index, item in enumerate(items):
        prefix = f"items[{index}]"
        for field in ["pr_id", "priority", "slug", "locale", "focus", "gsc_summary"]:
            if field not in item:
                errors.append(f"{prefix}.{field} is required")
        if item.get("priority") not in ["P0", "P1", "P2"]:
            errors.append(f"{prefix}.priority must be P0, P1, or P2")
        if item.get("locale") != "zh-CN":
            errors.append(f"{prefix}.locale must be zh-CN")
        slug = item.get("slug", "")
        if not re.match(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", slug):
            errors.append(f"{prefix}.slug must be lowercase kebab-case")
        key = (item.get("pr_id"), slug, item.get("locale"))
        if key in seen:
            errors.append(f"{prefix} duplicates pr_id/slug/locale")
        seen.add(key)
        summary = item.get("gsc_summary", {})
        for field in ["impressions", "clicks", "avg_position"]:
            if field not in summary:
                errors.append(f"{prefix}.gsc_summary.{field} is required")
    return errors


def build_asset(item):
    template = read_json(ASSET_TEMPLATE)
    tokens = {
        "artifact_version": f"kg.pr{pr_number(item['pr_id'])}.scaffold.v1",
        "pr_id": item["pr_id"],
        "slug": item["slug"],
        "locale": item["locale"],
        "slug_title": slug_title(item["slug"]),
    }
    asset = replace_tokens(copy.deepcopy(template), tokens)
    asset["generator"] = {
        "name": "generate_career_kg_package.py",
        "mode": "dry_run_scaffold",
        "real_occupation_content_generated": False,
    }
    asset["confirmed_batch_ref"] = {
        "priority": item["priority"],
        "focus": item["focus"],
        "gsc_summary": item["gsc_summary"],
        "gsc_summary_usage": "opportunity_signal_only_not_occupation_fact",
    }
    return asset


def render_readme(item):
    template = README_TEMPLATE.read_text(encoding="utf-8")
    focus = "\n".join(f"- `{entry}`" for entry in item["focus"])
    summary = item["gsc_summary"]
    tokens = {
        "pr_id": item["pr_id"],
        "slug": item["slug"],
        "locale": item["locale"],
        "priority": item["priority"],
        "focus_list": focus,
        "impressions": summary["impressions"],
        "clicks": summary["clicks"],
        "avg_position": summary["avg_position"],
    }
    return replace_tokens(template, tokens)


def status_report(kind: str, item, package_dir: Path):
    return {
        "status": "not_run",
        "kind": kind,
        "pr_id": item["pr_id"],
        "slug": item["slug"],
        "locale": item["locale"],
        "dry_run_only": True,
        "cms_write_performed": False,
        "staging_write_performed": False,
        "production_import_performed": False,
        "notes": "Placeholder report generated by package scaffold; later PRs run focused validators and smokes.",
        "package_dir": str(package_dir),
    }


def write_package(item, output_root: Path):
    directory = output_root / f"career-kg-pr-{pr_number(item['pr_id'])}-{item['slug']}"
    directory.mkdir(parents=True, exist_ok=True)

    asset_name = f"{item['slug']}.{item['locale']}.asset.json"
    write_text(directory / "README.md", render_readme(item))
    write_json(directory / asset_name, build_asset(item))
    for report_name in CONTENT_REPORTS:
        write_json(directory / report_name, status_report(report_name.removesuffix(".json"), item, directory))

    manifest = {
        "status": "generated",
        "dry_run_only": True,
        "files": {},
    }
    for path in sorted(p for p in directory.iterdir() if p.name != "sha256_manifest.json"):
        if path.is_file():
            manifest["files"][path.name] = sha256_file(path)
    write_json(directory / "sha256_manifest.json", manifest)
    return directory


def main():
    parser = argparse.ArgumentParser(
        description="Generate dry-run career KG package scaffolds from an operator-confirmed batch."
    )
    parser.add_argument("--batch", required=True, help="Path to confirmed batch JSON.")
    parser.add_argument("--output-root", default="generated", help="Output root for generated packages.")
    parser.add_argument("--dry-run", action="store_true", help="Validate and print planned directories without writing.")
    args = parser.parse_args()

    batch_path = Path(args.batch)
    batch = read_json(batch_path)
    errors = validate_batch(batch)
    if errors:
        print(json.dumps({"status": "failed", "errors": errors}, ensure_ascii=False, indent=2))
        return 1

    output_root = Path(args.output_root)
    planned = [
        str(output_root / f"career-kg-pr-{pr_number(item['pr_id'])}-{item['slug']}")
        for item in batch["items"]
    ]
    if args.dry_run:
        print(json.dumps({"status": "planned", "packages": planned}, ensure_ascii=False, indent=2))
        return 0

    written = [str(write_package(item, output_root)) for item in batch["items"]]
    print(json.dumps({"status": "generated", "packages": written}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
