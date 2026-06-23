#!/usr/bin/env python3
"""Shared helpers for career page assembly tooling.

The assembly layer is intentionally reference-only: it links PASS block rows
and mature block proof artifacts without copying or rewriting occupational
facts into a new reader-facing fact source.
"""

from __future__ import annotations

import csv
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[4]
STATE_BASELINES = REPO_ROOT / "generated/fermatmind-content-agent-state/latest_pass_baselines.json"


def resolve_latest_baseline(block_name: str, fallbacks: list[str]) -> str:
    if STATE_BASELINES.exists():
        try:
            payload = json.loads(STATE_BASELINES.read_text(encoding="utf-8"))
            for row in payload.get("baselines", []):
                if row.get("block_name") == block_name and row.get("baseline_directory"):
                    candidate = str(row["baseline_directory"])
                    if (REPO_ROOT / candidate).exists():
                        return candidate
        except json.JSONDecodeError:
            pass
    for candidate in fallbacks:
        if (REPO_ROOT / candidate).exists():
            return candidate
    return fallbacks[0]

REQUIRED_COMPLETE_BLOCKS = {
    "career-identity": {
        "baseline": resolve_latest_baseline("career-identity", [
            "generated/career-identity-v1-batch-1046-pass-baseline-final-repaired",
            "generated/career-identity-v1-1046-pass-baseline-final",
        ]),
        "asset": "assets/assets.jsonl",
        "sections": [("hero_identity", 10), ("quick_summary_from_identity", 20)],
    },
    "career-work-activities": {
        "baseline": resolve_latest_baseline("career-work-activities", [
            "generated/career-work-activities-v1-batch-1046-pass-baseline-final-repaired",
            "generated/career-work-activities-v1-1046-pass-baseline-final-repaired",
        ]),
        "asset": "assets/career_work_activities_1046_assets_repaired.jsonl",
        "sections": [("work_activities", 30)],
    },
    "career-skills-entry": {
        "baseline": resolve_latest_baseline("career-skills-entry", [
            "generated/career-skills-entry-v1-batch-1046-pass-baseline-final-repaired",
            "generated/career-skills-entry-v1-1046-pass-baseline-final",
        ]),
        "asset": "assets/assets.jsonl",
        "sections": [("skills_entry", 40)],
    },
    "career-fit": {
        "baseline": resolve_latest_baseline("career-fit", [
            "generated/career-fit-v1-batch-1046-pass-baseline-final-repaired",
            "generated/career-fit-v1-1046-pass-baseline-final",
        ]),
        "asset": "assets/assets.jsonl",
        "sections": [("career_fit", 50), ("test_cta_placeholder", 90)],
    },
    "career-adjacent-comparison": {
        "baseline": resolve_latest_baseline("career-adjacent-comparison", [
            "generated/career-adjacent-comparison-v1-1046-pass-baseline-final-repaired",
            "generated/career-adjacent-comparison-v1-1046-pass-baseline-final",
        ]),
        "asset": "assets/assets.jsonl",
        "sections": [("adjacent_comparison", 60)],
    },
}

MATURE_REGISTERED_BLOCKS = {
    "career-salary": {
        "sections": [("salary_reference", 70)],
        "proof_artifacts": [
            "generated/career-salary-v3-6-1046-editorial-review-package/editorial_qa_report.json",
            "generated/career-salary-1046-post-import-seo-safety-audit/audit.json",
        ],
    },
    "career-risk-future-ai-impact": {
        "sections": [("ai_impact_reference", 80)],
        "proof_artifacts": [
            "generated/career-ai-impact-v5-1046-expanded-page-qa/audit.json"
        ],
    },
}

SOURCE_DISCLOSURE_SECTION = ("source_and_boundary", 100)

RUNTIME_FORBIDDEN_TERMS = [
    "search_projection",
    "json-ld",
    "jsonld",
    "sitemap",
    "canonical",
    "noindex",
    "robots",
    "llms.txt",
    "production import",
    "cms import",
    "staging_preview write",
]

FACT_FIELD_NAMES = {
    "summary",
    "facts",
    "items",
    "body",
    "copy",
    "text",
    "content",
    "question",
    "answer",
    "faq",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                rows.append(json.loads(line))
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def write_csv(path: Path, rows: list[dict[str, Any]], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fieldnames})


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def canonical_hash(payload: Any) -> str:
    blob = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(blob).hexdigest()


def load_seed(repo_root: Path, seed_path: Path) -> list[dict[str, Any]]:
    payload = read_json(repo_root / seed_path)
    if isinstance(payload, list):
        rows = payload
    else:
        rows = payload.get("jobs", [])
    rows = sorted(rows, key=lambda row: int(row["ordinal"]))
    return rows


def normalize_locale(value: str) -> str:
    if value in {"zh", "zh_CN", "zh-CN"}:
        return "zh-CN"
    return value


def row_slug(row: dict[str, Any]) -> str | None:
    return row.get("slug") or row.get("career_slug") or row.get("job_slug")


def row_locale(row: dict[str, Any]) -> str | None:
    locale = row.get("locale") or row.get("language")
    return normalize_locale(locale) if isinstance(locale, str) else None


def extract_row_hash(row: dict[str, Any]) -> str | None:
    audit = row.get("audit_fields")
    if isinstance(audit, dict):
        for key in ("row_hash", "asset_hash", "hash"):
            if audit.get(key):
                return str(audit[key])
    for key in ("row_hash", "asset_hash", "hash"):
        if row.get(key):
            return str(row[key])
    return canonical_hash(row)


def index_assets(repo_root: Path, block: str, config: dict[str, Any]) -> dict[tuple[str, str], dict[str, Any]]:
    asset_path = repo_root / config["baseline"] / config["asset"]
    rows = load_jsonl(asset_path)
    index: dict[tuple[str, str], dict[str, Any]] = {}
    for row in rows:
        slug = row_slug(row)
        locale = row_locale(row)
        if slug and locale:
            index[(slug, locale)] = row
    return index


def build_source_section(
    *,
    section_key: str,
    source_block: str,
    slug: str,
    locale: str,
    priority: int,
    baseline_path: str | None,
    source_row_hash: str | None,
    status: str,
    omission_reason: str | None,
    proof_artifacts: list[str] | None = None,
) -> dict[str, Any]:
    section: dict[str, Any] = {
        "section_key": section_key,
        "source_block": source_block,
        "source_baseline_path": baseline_path,
        "source_slug": slug,
        "source_locale": locale,
        "source_row_hash": source_row_hash,
        "display_priority": priority,
        "availability_status": status,
        "omission_reason": omission_reason,
        "no_new_fact_boundary": "This assembly section references the named PASS or mature block only; it does not create or rewrite occupational facts.",
    }
    if proof_artifacts is not None:
        section["proof_artifacts"] = proof_artifacts
    return section


def make_sha_manifest(base_dir: Path) -> dict[str, Any]:
    entries = []
    for path in sorted(base_dir.rglob("*")):
        if path.is_file():
            entries.append(
                {
                    "path": str(path.relative_to(base_dir)),
                    "sha256": sha256_file(path),
                    "bytes": path.stat().st_size,
                }
            )
    return {"generated_at": utc_now(), "file_count": len(entries), "files": entries}
