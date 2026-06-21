#!/usr/bin/env python3
"""Shared helpers for the career skills-entry block."""

from __future__ import annotations

import csv
import hashlib
import json
import re
from pathlib import Path
from typing import Any, Iterable


BLOCK_TYPE = "career-skills-entry"
VERSION = "career_skills_entry_v1"
LOCALES = ("zh-CN", "en")
REQUIRED = {
    "ledger_type",
    "asset_version",
    "block_type",
    "slug",
    "locale",
    "occupation",
    "seed_ordinal",
    "batch_role",
    "sources",
    "audit_fields",
}
RUNTIME_OR_SEO = re.compile(
    r"\b(search_projection|sitemap|noindex|json-ld|jsonld|robots\.txt|llms\.txt|cms import|production import|staging_preview)\b"
    r"|rel=['\"]?canonical|canonical\s+(?:url|tag|link|meta)",
    re.I,
)
OUTCOME_CLAIMS = re.compile(
    r"\b(guarantee[sd]?|guaranteed|will get hired|job offer|admission guaranteed|certification guaranteed|visa|immigration|salary|wage|income|promotion guaranteed|guaranteed promotion)\b"
    r"|保证(?:录取|就业|入职|拿证|加薪|移民|签证)|(?:薪资|工资|收入|升职)保证",
    re.I,
)
RAW_INTERNAL = re.compile(r"\b(evidence_id|source_id|row_hash|audit_fields|internal lineage|repair note|gate label)\b", re.I)


def read_json(path: str | Path) -> Any:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_json(path: str | Path, payload: Any) -> None:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def read_jsonl(path: str | Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with Path(path).open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def write_jsonl(path: str | Path, rows: Iterable[dict[str, Any]]) -> None:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def write_csv(path: str | Path, rows: list[dict[str, Any]], fields: list[str]) -> None:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)


def sha256_file(path: str | Path) -> str:
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def row_hash(row: dict[str, Any]) -> str:
    clone = json.loads(json.dumps(row, ensure_ascii=False, sort_keys=True))
    clone.setdefault("audit_fields", {}).pop("row_hash", None)
    return hashlib.sha256(
        json.dumps(clone, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()


def load_seed(path: str | Path) -> list[dict[str, Any]]:
    data = read_json(path)
    if isinstance(data, dict):
        for key in ("jobs", "rows", "careers", "items"):
            if isinstance(data.get(key), list):
                return data[key]
    if isinstance(data, list):
        return data
    raise ValueError(f"Unsupported seed shape: {path}")


def nested_get(row: dict[str, Any], *keys: str, default: Any = None) -> Any:
    for key in keys:
        if key in row and row[key] not in (None, ""):
            return row[key]
    occupation = row.get("occupation") if isinstance(row.get("occupation"), dict) else {}
    context = row.get("existing_fermatmind_context") if isinstance(row.get("existing_fermatmind_context"), dict) else {}
    context_en = context.get("en") if isinstance(context.get("en"), dict) else {}
    context_zh_raw = context.get("zh") or context.get("zh-CN")
    context_zh = context_zh_raw if isinstance(context_zh_raw, dict) else {}
    for source in (occupation, context_en, context_zh):
        for key in keys:
            if key in source and source[key] not in (None, ""):
                return source[key]
    return default


def normalize_seed_row(row: dict[str, Any], ordinal: int | None = None) -> dict[str, Any]:
    seed_ordinal = int(nested_get(row, "seed_ordinal", "ordinal", "index", default=ordinal or 0))
    return {
        "seed_ordinal": seed_ordinal,
        "slug": nested_get(row, "slug"),
        "title_en": nested_get(row, "title_en", "occupation_en", "name_en", "title"),
        "title_zh": nested_get(row, "title_zh", "title_zh_seed", "occupation_zh", "name_zh"),
        "title_zh_seed": nested_get(row, "title_zh_seed", "title_zh", "occupation_zh", "name_zh"),
        "soc_code_seed": nested_get(row, "soc_code_seed", "soc_code", "soc"),
        "onet_code_seed": nested_get(row, "onet_code_seed", "onet_code", "onet"),
    }


def fail_report(output: str | Path, findings: list[dict[str, Any]], summary: dict[str, Any]) -> int:
    final = "PASS" if not findings else "REPAIR_REQUIRED"
    payload = {**summary, "finding_count": len(findings), "findings": findings, "final_conclusion": final}
    write_json(output, payload)
    return 0 if final == "PASS" else 1


def text_values(value: Any) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from text_values(item)
    elif isinstance(value, dict):
        for key, item in value.items():
            if key in {"audit_fields", "evidence_used", "derived_from_evidence", "derived_from_synthesis"}:
                continue
            yield from text_values(item)


def validate_common_rows(rows: list[dict[str, Any]], ledger_type: str) -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []
    seen: set[tuple[Any, Any]] = set()
    for index, row in enumerate(rows, start=1):
        missing = sorted(REQUIRED - row.keys())
        if missing:
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_required_fields", "fields": missing})
        if row.get("ledger_type") != ledger_type:
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "bad_ledger_type"})
        if row.get("block_type") != BLOCK_TYPE:
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "bad_block_type"})
        if row.get("locale") not in set(LOCALES):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "bad_locale"})
        key = (row.get("slug"), row.get("locale"))
        if key in seen:
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "duplicate_slug_locale"})
        seen.add(key)
        if not row.get("sources"):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_sources"})
    return findings


def has_unsafe_outcome_claim(text: str) -> bool:
    """Detect outcome claims while allowing explicit negative boundaries."""
    for sentence in re.split(r"(?<=[。.!?])\s+", text):
        if not OUTCOME_CLAIMS.search(sentence):
            continue
        lowered = sentence.lower()
        allowed_occupational_contexts = (
            "property income stream",
            "property income approach",
            "anticipated property income",
            "income capitalization",
            "low-income population",
            "low income population",
            "compensation polic",
            "compensation plan",
            "prevailing wage rate",
            "employee retirement income security act",
            "income growth",
            "available monthly income",
            "clients' overall financial situations",
            "income, assets, debts",
            "operating income and expense accounts",
            "income and expense accounts",
            "income statement",
            "immigration document",
            "immigration application",
            "immigration laws",
            "customs or immigration",
            "visas, and passports",
            "applications, visas, and passports",
            "eligibility for admission, residence, and travel",
            "violation of immigration or customs laws",
        )
        if any(marker in lowered for marker in allowed_occupational_contexts):
            continue
        if any(marker in lowered for marker in ("does not", "do not", "not ", "no ", "without ", "must not", "is not")):
            continue
        if any(marker in sentence for marker in ("不", "不得", "不能", "不会", "没有", "并非", "非")):
            continue
        return True
    return False


def first_jsonl_in(baseline_dir: str | Path, subdir: str) -> Path:
    root = Path(baseline_dir) / subdir
    matches = sorted(root.glob("*.jsonl"))
    if not matches:
        raise FileNotFoundError(f"No JSONL found under {root}")
    return matches[0]


def rows_by_slug_locale(path: str | Path) -> dict[tuple[str, str], dict[str, Any]]:
    return {(row["slug"], row["locale"]): row for row in read_jsonl(path)}
