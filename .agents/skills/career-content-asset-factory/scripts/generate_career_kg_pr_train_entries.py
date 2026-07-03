#!/usr/bin/env python3

import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_DIR = SCRIPT_DIR.parent
TEMPLATE_DIR = SKILL_DIR / "templates"
YAML_TEMPLATE = TEMPLATE_DIR / "career_kg_pr_train_entry.yaml"
STATE_TEMPLATE = TEMPLATE_DIR / "career_kg_pr_train_state_entry.json"


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_text(path: Path, text: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def write_json(path: Path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def pr_number(pr_id: str) -> str:
    match = re.search(r"(\d+)$", pr_id)
    if not match:
        raise ValueError(f"pr_id must end with digits: {pr_id}")
    return match.group(1)


def replace_tokens(text: str, tokens: dict[str, str]) -> str:
    for key, value in tokens.items():
        text = text.replace("{{" + key + "}}", value)
    return text


def package_files(item):
    number = pr_number(item["pr_id"])
    slug = item["slug"]
    package_dir = f"generated/career-kg-pr-{number}-{slug}"
    return [
        f"{package_dir}/README.md",
        f"{package_dir}/{slug}.{item['locale']}.asset.json",
        f"{package_dir}/qa_report.json",
        f"{package_dir}/dry_run_importer_report.json",
        f"{package_dir}/staging_preview_smoke.json",
        f"{package_dir}/fap_web_render_smoke.json",
        f"{package_dir}/sha256_manifest.json",
        f"tests/contracts/career-kg-{number}-{slug}.contract.test.ts",
        "tests/contracts/helpers/currentPrScope.ts",
        "docs/codex/pr-train.yaml",
        "docs/codex/pr-train-state.json",
    ]


def render_yaml_entry(item):
    slug = item["slug"]
    tokens = {
        "pr_id": item["pr_id"],
        "slug": slug,
        "slug_underscore": slug.replace("-", "_"),
        "branch_slug": f"pr-career-kg-{pr_number(item['pr_id'])}-{slug}",
        "contract_test": f"career-kg-{pr_number(item['pr_id'])}-{slug}.contract.test.ts",
        "artifact_list": "\n".join(f"      - {file}" for file in package_files(item)),
    }
    return replace_tokens(YAML_TEMPLATE.read_text(encoding="utf-8"), tokens)


def render_state_entry(item):
    slug = item["slug"]
    tokens = {
        "pr_id": item["pr_id"],
        "slug": slug,
        "slug_underscore": slug.replace("-", "_"),
        "branch_slug": f"pr-career-kg-{pr_number(item['pr_id'])}-{slug}",
    }
    return json.loads(replace_tokens(STATE_TEMPLATE.read_text(encoding="utf-8"), tokens))


def render_prompt(batch, output_dir: Path):
    ids = ", ".join(item["pr_id"] for item in batch["items"])
    return f"""# Career KG PR Train Execution Prompt

Use `$fermatmind-pr-train` to apply the generated manifest/state patch artifacts
from `{output_dir}` and execute one PR per occupation.

Scope: {ids}

Rules:
- Do not combine adjacent scopes.
- Do not perform CMS writes, staging writes, production imports, SEO runtime
  release, sitemap/llms/canonical/noindex/JSON-LD changes, manual deploy, or
  production deploy.
- Apply `pr_train_patch.yaml` and `pr_train_state_patch.json` only after explicit
  operator authorization.
"""


def main():
    parser = argparse.ArgumentParser(description="Generate career KG PR train patch artifacts from a confirmed batch.")
    parser.add_argument("--batch", required=True, help="Path to confirmed batch JSON.")
    parser.add_argument("--output-dir", help="Output directory. Defaults to generated/career-kg-agent-run-YYYYMMDD.")
    args = parser.parse_args()

    batch = read_json(Path(args.batch))
    if batch.get("source") != "operator_confirmed":
        print(json.dumps({"status": "failed", "error": "batch source must be operator_confirmed"}, indent=2))
        return 1
    output_dir = Path(args.output_dir or f"generated/career-kg-agent-run-{dt.date.today().strftime('%Y%m%d')}")
    yaml_patch = "\n".join(render_yaml_entry(item).rstrip() for item in batch.get("items", [])) + "\n"
    state_patch = {}
    for item in batch.get("items", []):
        state_patch.update(render_state_entry(item))
    write_text(output_dir / "pr_train_patch.yaml", yaml_patch)
    write_json(output_dir / "pr_train_state_patch.json", state_patch)
    write_text(output_dir / "execution_prompt.md", render_prompt(batch, output_dir))
    print(json.dumps({"status": "generated", "output_dir": str(output_dir), "pr_count": len(state_patch)}, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
