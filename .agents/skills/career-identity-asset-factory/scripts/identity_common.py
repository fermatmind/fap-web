#!/usr/bin/env python3
"""Shared helpers for career identity block scripts."""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path
from typing import Any, Iterable


LOCALES = ("en", "zh-CN")
BLOCK_TYPE = "career-identity"
VERSION = "career_identity_v1"


def read_json(path: str | Path) -> Any:
    with Path(path).open(encoding="utf-8") as handle:
        return json.load(handle)


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


def get_seed_field(row: dict[str, Any], *names: str, default: Any = None) -> Any:
    for name in names:
        if name in row and row[name] not in (None, ""):
            return row[name]
    return default


def normalize_seed_row(row: dict[str, Any], ordinal: int | None = None) -> dict[str, Any]:
    seed_ordinal = int(get_seed_field(row, "seed_ordinal", "ordinal", "index", default=ordinal or 0))
    occupation = row.get("occupation") if isinstance(row.get("occupation"), dict) else {}
    context = row.get("existing_fermatmind_context") if isinstance(row.get("existing_fermatmind_context"), dict) else {}
    context_en = context.get("en") if isinstance(context.get("en"), dict) else {}
    context_zh = context.get("zh-CN") if isinstance(context.get("zh-CN"), dict) else {}

    def field(*names: str, default: Any = None) -> Any:
        value = get_seed_field(row, *names)
        if value not in (None, ""):
            return value
        value = get_seed_field(occupation, *names)
        if value not in (None, ""):
            return value
        value = get_seed_field(context_en, *names)
        if value not in (None, ""):
            return value
        value = get_seed_field(context_zh, *names)
        if value not in (None, ""):
            return value
        return default

    return {
        "seed_ordinal": seed_ordinal,
        "slug": field("slug"),
        "title_en": field("title_en", "occupation_en", "name_en", "title"),
        "title_zh": field("title_zh", "title_zh_seed", "occupation_zh", "name_zh"),
        "title_zh_seed": field("title_zh_seed", "title_zh", "occupation_zh", "name_zh"),
        "soc_code_seed": field("soc_code_seed", "soc_code", "soc"),
        "onet_code_seed": field("onet_code_seed", "onet_code", "onet"),
    }


def add_common_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--pretty", action="store_true", help="Pretty-print stdout JSON where applicable.")


def fail_report(output: str | Path, findings: list[dict[str, Any]], summary: dict[str, Any]) -> int:
    final = "PASS" if not findings else "REPAIR_REQUIRED"
    payload = {**summary, "finding_count": len(findings), "findings": findings, "final_conclusion": final}
    write_json(output, payload)
    return 0 if final == "PASS" else 1
