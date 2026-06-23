#!/usr/bin/env python3
"""Shared helpers for the career work-activities block scripts."""

from __future__ import annotations

import csv
import hashlib
import json
import re
from pathlib import Path
from typing import Any, Iterable


BLOCK_TYPE = "career-work-activities"
VERSION = "career_work_activities_v1"
LOCALES = ("zh-CN", "en")
LEDGER_REQUIRED = {
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
READER_SKIP_KEYS = {
    "audit_fields",
    "evidence_used",
    "derived_from_evidence",
    "derived_from_synthesis",
    "source_ids",
    "source_handles",
    "row_hash",
}
RUNTIME_OR_SEO = re.compile(
    r"\b(search_projection|sitemap|noindex|json-ld|jsonld|robots\.txt|llms\.txt|cms import|production import|staging_preview)\b"
    r"|rel=['\"]?canonical|canonical\s+(?:url|tag|link|meta)",
    re.I,
)
RAW_INTERNAL = re.compile(
    r"\b(evidence_id|source_id|row_hash|audit_fields|internal lineage|repair note|gate label|manual review)\b",
    re.I,
)
SALARY_OUTCOME = re.compile(
    r"\b(salary|salaries|wage|wages|income|income prediction|pay prediction|job loss|career disappearance|unemployment)\b"
    r"|(?:薪资|工资|收入|失业|职业消失|降薪|个人收入预测)",
    re.I,
)
GENERIC_WORKFLOW = re.compile(
    r"\b(maintains records|uses technology|communicates with stakeholders|supports operations|handles tasks|reviews information)\b"
    r"|(?:维护记录|使用技术|与利益相关方沟通|支持运营|处理任务|审核信息)",
    re.I,
)


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
        if row.get(key) not in (None, ""):
            return row[key]
    occupation = row.get("occupation") if isinstance(row.get("occupation"), dict) else {}
    context = row.get("existing_fermatmind_context") if isinstance(row.get("existing_fermatmind_context"), dict) else {}
    context_en = context.get("en") if isinstance(context.get("en"), dict) else {}
    context_zh_raw = context.get("zh-CN") or context.get("zh")
    context_zh = context_zh_raw if isinstance(context_zh_raw, dict) else {}
    for source in (occupation, context_en, context_zh):
        for key in keys:
            if source.get(key) not in (None, ""):
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


def load_manifest(path: str | Path) -> list[dict[str, Any]]:
    data = read_json(path)
    rows = data.get("rows") if isinstance(data, dict) else data
    if not isinstance(rows, list):
        raise ValueError(f"Unsupported manifest shape: {path}")
    return rows


def onet_url(onet_code: str | None) -> str | None:
    if not onet_code:
        return None
    return f"https://www.onetonline.org/link/summary/{onet_code}"


def source_cache_by_slug(path: str | Path | None) -> dict[str, dict[str, Any]]:
    if not path:
        return {}
    payload = read_json(path)
    rows = payload.get("rows") if isinstance(payload, dict) else payload
    if not isinstance(rows, list):
        raise ValueError(f"Unsupported source cache shape: {path}")
    return {str(row.get("slug")): row for row in rows if row.get("slug")}


def text_values(value: Any) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from text_values(item)
    elif isinstance(value, dict):
        for key, item in value.items():
            if key in READER_SKIP_KEYS:
                continue
            yield from text_values(item)


def reader_text(row: dict[str, Any]) -> str:
    return "\n".join(text_values(row))


def has_salary_or_outcome_claim(text: str) -> bool:
    """Detect true salary/outcome terms without substring false positives such as sewage."""
    return bool(SALARY_OUTCOME.search(text))


def has_runtime_or_internal_leakage(row: dict[str, Any]) -> list[str]:
    text = reader_text(row)
    issues: list[str] = []
    if RUNTIME_OR_SEO.search(text):
        issues.append("runtime_or_seo_instruction_leakage")
    if RAW_INTERNAL.search(text):
        issues.append("raw_internal_leakage")
    return issues


def validate_common_rows(rows: list[dict[str, Any]], ledger_type: str) -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []
    seen: set[tuple[Any, Any]] = set()
    for index, row in enumerate(rows, start=1):
        missing = sorted(LEDGER_REQUIRED - set(row.keys()))
        if missing:
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_required_fields", "fields": missing})
        if row.get("ledger_type") != ledger_type:
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "bad_ledger_type"})
        if row.get("asset_version") != VERSION:
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "bad_asset_version"})
        if row.get("block_type") != BLOCK_TYPE:
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "bad_block_type"})
        if row.get("locale") not in LOCALES:
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "bad_locale"})
        key = (row.get("slug"), row.get("locale"))
        if key in seen:
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "duplicate_slug_locale"})
        seen.add(key)
        if not row.get("sources"):
            findings.append({"row": index, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_sources"})
    return findings


def report_payload(summary: dict[str, Any], findings: list[dict[str, Any]]) -> dict[str, Any]:
    final = "PASS" if not findings else "REPAIR_REQUIRED"
    return {**summary, "finding_count": len(findings), "findings": findings, "final_conclusion": final}


def write_gate_outputs(
    report_path: str | Path,
    ready_csv: str | Path | None,
    repair_required_csv: str | Path | None,
    blocked_csv: str | Path | None,
    rows: list[dict[str, Any]],
    findings: list[dict[str, Any]],
    summary: dict[str, Any],
) -> int:
    payload = report_payload(summary, findings)
    write_json(report_path, payload)
    finding_keys = {(f.get("slug"), f.get("locale")) for f in findings}
    ready_rows: list[dict[str, Any]] = []
    repair_rows: list[dict[str, Any]] = []
    for row in rows:
        entry = {"slug": row.get("slug"), "locale": row.get("locale"), "seed_ordinal": row.get("seed_ordinal")}
        if (row.get("slug"), row.get("locale")) in finding_keys:
            issues = sorted({str(f.get("issue")) for f in findings if f.get("slug") == row.get("slug") and f.get("locale") == row.get("locale")})
            repair_rows.append({**entry, "issues": ";".join(issues)})
        else:
            ready_rows.append({**entry, "issues": ""})
    fields = ["slug", "locale", "seed_ordinal", "issues"]
    if ready_csv:
        write_csv(ready_csv, ready_rows, fields)
    if repair_required_csv:
        write_csv(repair_required_csv, repair_rows, fields)
    if blocked_csv:
        write_csv(blocked_csv, [], fields)
    return 0 if payload["final_conclusion"] == "PASS" else 1


def make_source(seed: dict[str, Any], cache: dict[str, Any] | None) -> dict[str, Any]:
    source_url = cache.get("url") if cache else None
    if not source_url:
        source_url = onet_url(seed.get("onet_code_seed"))
    return {
        "source_id": cache.get("source_id") if cache else f"onet:{seed.get('onet_code_seed') or 'missing'}",
        "name": cache.get("source_name") if cache else "O*NET OnLine",
        "url": source_url,
        "source_relation": cache.get("source_relation") if cache else "direct",
        "source_boundary": cache.get("source_boundary") if cache else "Official profile source required for work-activities evidence collection.",
    }


def evidence_id(slug: str, locale: str) -> str:
    return f"workact:{slug}:{locale}:v1"


def occupation_for(seed: dict[str, Any], locale: str) -> str:
    return seed.get("title_zh") if locale == "zh-CN" else seed.get("title_en")


def localized_summary(locale: str, occupation: str, tasks: list[str], settings: list[str]) -> str:
    first_task = tasks[0] if tasks else ("核心工作流程" if locale == "zh-CN" else "core work activities")
    first_setting = settings[0] if settings else ("常见工作场景" if locale == "zh-CN" else "typical work settings")
    if locale == "zh-CN":
        if occupation == "薪资与考勤文员":
            return "考勤与报酬核算文员的工作内容以核对出勤、工时、调整记录和周期结算材料为主，并在高准确度、团队沟通和固定办公场景中把表单、系统记录和交付物连接起来。"
        return f"{occupation}的工作内容以{first_task}为主，并在{first_setting}中把任务、工具、协作对象和交付物连接起来。"
    return f"{occupation} work centers on {first_task}, with the role's tools, collaborators, settings, and deliverables shaped by {first_setting}."


def short_item(locale: str, label: str, values: list[str]) -> dict[str, Any]:
    if not values:
        body = "证据不足，需补充来源。" if locale == "zh-CN" else "Source evidence is insufficient and needs collection."
    elif locale == "zh-CN":
        body = "；".join(values[:4])
    else:
        body = "; ".join(values[:4])
    return {"label": label, "body": body}


def make_sha_manifest(directory: str | Path) -> dict[str, str]:
    root = Path(directory)
    manifest: dict[str, str] = {}
    for path in sorted(root.rglob("*")):
        if path.is_file() and path.name != "sha256_manifest.json":
            manifest[str(path.relative_to(root))] = sha256_file(path)
    return manifest
