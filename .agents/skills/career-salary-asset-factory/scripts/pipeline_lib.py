#!/usr/bin/env python3
"""Shared helpers for the FermatMind career salary asset factory scripts."""

from __future__ import annotations

import csv
import hashlib
import json
import shutil
from pathlib import Path
from typing import Any


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def read_jsonl(path: Path) -> tuple[list[dict[str, Any]], list[str]]:
    rows: list[dict[str, Any]] = []
    errors: list[str] = []
    with path.open(encoding="utf-8") as handle:
        for line_no, line in enumerate(handle, 1):
            if not line.strip():
                errors.append(f"line {line_no}: blank line")
                continue
            try:
                value = json.loads(line)
            except json.JSONDecodeError as exc:
                errors.append(f"line {line_no}: invalid JSON: {exc}")
                continue
            if not isinstance(value, dict):
                errors.append(f"line {line_no}: top-level value is not object")
                continue
            rows.append(value)
    return rows, errors


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")


def write_csv(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = sorted({key for row in rows for key in row}) or ["empty"]
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def copy_with_sha(source: Path, dest: Path) -> dict[str, Any]:
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, dest)
    return {
        "source_path": str(source),
        "baseline_path": str(dest),
        "bytes": dest.stat().st_size,
        "sha256": sha256(dest),
    }


def get_jobs(data: Any) -> list[dict[str, Any]]:
    return data["jobs"] if isinstance(data, dict) and "jobs" in data else data


def load_seed(path: Path) -> list[dict[str, Any]]:
    return get_jobs(read_json(path))


def load_manifest(path: Path) -> list[dict[str, Any]]:
    return get_jobs(read_json(path))


def validation_error(value: Any, schema: dict[str, Any], path: str = "$") -> list[str]:
    errors: list[str] = []
    allowed_type = schema.get("type")
    if allowed_type is not None:
        allowed = allowed_type if isinstance(allowed_type, list) else [allowed_type]
        if not any(matches_type(value, typ) for typ in allowed):
            return [f"{path}: expected {allowed}, got {type(value).__name__}"]
    if "enum" in schema and value not in schema["enum"]:
        errors.append(f"{path}: value {value!r} not in enum {schema['enum']!r}")
    if isinstance(value, dict):
        props = schema.get("properties", {})
        missing = sorted(set(schema.get("required", [])) - set(value))
        errors.extend(f"{path}.{key}: missing required property" for key in missing)
        if schema.get("additionalProperties") is False:
            for key in sorted(set(value) - set(props)):
                errors.append(f"{path}.{key}: unknown property")
        for key, child in value.items():
            if key in props:
                errors.extend(validation_error(child, props[key], f"{path}.{key}"))
    if isinstance(value, list) and "items" in schema:
        for idx, child in enumerate(value):
            errors.extend(validation_error(child, schema["items"], f"{path}[{idx}]"))
    return errors


def matches_type(value: Any, typ: str) -> bool:
    if typ == "object":
        return isinstance(value, dict)
    if typ == "array":
        return isinstance(value, list)
    if typ == "string":
        return isinstance(value, str)
    if typ == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if typ == "number":
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    if typ == "boolean":
        return isinstance(value, bool)
    if typ == "null":
        return value is None
    return False


def read_audit_verdict(path: Path) -> str:
    data = read_json(path)
    return str(data.get("final_verdict") or data.get("verdict") or "UNKNOWN")


def write_basic_md(path: Path, title: str, lines: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("# " + title + "\n\n" + "\n".join(lines) + "\n", encoding="utf-8")
