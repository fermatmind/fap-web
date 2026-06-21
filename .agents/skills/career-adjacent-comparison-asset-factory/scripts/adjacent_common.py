#!/usr/bin/env python3
"""Shared helpers for career-adjacent-comparison assets."""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any, Iterable

BLOCK_TYPE = "career-adjacent-comparison"
VERSION = "career_adjacent_comparison_v1"
LOCALES = ("zh-CN", "en")
ROOT = Path.cwd()
SEED = ROOT / "generated/career-salary-seed/career_jobs_1046_salary_asset_seed.json"
IDENTITY_BASELINE = ROOT / "generated/career-identity-v1-1046-pass-baseline-final"
WORK_BASELINE = ROOT / "generated/career-work-activities-v1-1046-pass-baseline-final-repaired"
SKILLS_BASELINE = ROOT / "generated/career-skills-entry-v1-1046-pass-baseline-final"
FIT_BASELINE = ROOT / "generated/career-fit-v1-1046-pass-baseline-final"

RUNTIME_OR_SEO = re.compile(
    r"\b(search_projection|sitemap|noindex|json-ld|jsonld|robots\.txt|llms\.txt|cms import|production import|staging_preview|canonical)\b",
    re.I,
)
RAW_INTERNAL = re.compile(r"\b(evidence_id|source_id|row_hash|audit_fields|internal lineage|repair note|gate label)\b", re.I)
UNSAFE_TRANSFER = re.compile(
    r"\b(easy switch|direct switch|guaranteed mobility|guaranteed transition|no retraining needed|same career|will get hired|salary gain|income gain|promotion guaranteed|visa|immigration)\b|"
    r"轻松转行|直接转行|保证转行|无需补训|保证就业|保证升职|保证收入|薪资提升|工资提升|移民|签证",
    re.I,
)
DISALLOWED_PROXY = re.compile(r"\b(job board|salary similarity|ai impact|automation score|personality fit|mbti|big five|riasec|title similarity|slug similarity)\b|招聘网站|薪资相似|AI影响|人格相似|标题相似|slug相似", re.I)
TOKEN_RE = re.compile(r"[a-zA-Z][a-zA-Z0-9+\-/]{2,}|[\u4e00-\u9fff]{2,}")
STOP = {
    "and", "the", "for", "with", "from", "about", "into", "onto", "that", "this", "their", "work", "task",
    "tasks", "career", "occupation", "occupational", "prepare", "review", "record", "records", "report",
    "reports", "data", "information", "materials", "system", "systems", "using", "use", "used", "source",
    "asset", "assets", "batch", "baseline", "boundaries", "boundary", "career", "generated", "version",
    "fermatmind", "pass", "ledger", "type", "locale", "context", "evidence", "generator", "block",
}


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()


def read_json(path: str | Path) -> Any:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_json(path: str | Path, payload: Any) -> None:
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def read_jsonl(path: str | Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    with Path(path).open(encoding="utf-8") as h:
        for line in h:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def write_jsonl(path: str | Path, rows: Iterable[dict[str, Any]]) -> None:
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("w", encoding="utf-8") as h:
        for row in rows:
            h.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")


def write_csv(path: str | Path, rows: list[dict[str, Any]], fields: list[str]) -> None:
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open("w", newline="", encoding="utf-8") as h:
        w = csv.DictWriter(h, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)


def sha256_file(path: str | Path) -> str:
    d = hashlib.sha256()
    with Path(path).open("rb") as h:
        for chunk in iter(lambda: h.read(1024 * 1024), b""):
            d.update(chunk)
    return d.hexdigest()


def stable_hash(payload: Any) -> str:
    return hashlib.sha256(json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def row_hash(row: dict[str, Any]) -> str:
    clone = json.loads(json.dumps(row, ensure_ascii=False, sort_keys=True))
    clone.setdefault("audit_fields", {}).pop("row_hash", None)
    return stable_hash(clone)


def load_seed(path: str | Path = SEED) -> list[dict[str, Any]]:
    data = read_json(path)
    if isinstance(data, dict):
        for key in ("jobs", "rows", "careers", "items"):
            if isinstance(data.get(key), list):
                data = data[key]
                break
    if not isinstance(data, list):
        raise ValueError(f"Unsupported seed shape: {path}")
    out = []
    for i, row in enumerate(data, 1):
        out.append(normalize_seed_row(row, i))
    return out


def nested_get(row: dict[str, Any], *keys: str, default: Any = None) -> Any:
    for key in keys:
        if row.get(key) not in (None, ""):
            return row[key]
    for source in [
        row.get("occupation") if isinstance(row.get("occupation"), dict) else {},
        (row.get("existing_fermatmind_context") or {}).get("en") if isinstance(row.get("existing_fermatmind_context"), dict) else {},
        (row.get("existing_fermatmind_context") or {}).get("zh-CN") if isinstance(row.get("existing_fermatmind_context"), dict) else {},
    ]:
        if not isinstance(source, dict):
            continue
        for key in keys:
            if source.get(key) not in (None, ""):
                return source[key]
    return default


def normalize_seed_row(row: dict[str, Any], ordinal: int) -> dict[str, Any]:
    seed_ordinal = int(nested_get(row, "seed_ordinal", "ordinal", "index", default=ordinal))
    return {
        "seed_ordinal": seed_ordinal,
        "slug": nested_get(row, "slug"),
        "title_en": nested_get(row, "title_en", "occupation_en", "name_en", "title"),
        "title_zh": nested_get(row, "title_zh", "title_zh_seed", "occupation_zh", "name_zh"),
        "title_zh_seed": nested_get(row, "title_zh_seed", "title_zh", "occupation_zh", "name_zh"),
        "soc_code_seed": nested_get(row, "soc_code_seed", "soc_code", "soc"),
        "onet_code_seed": nested_get(row, "onet_code_seed", "onet_code", "onet"),
    }


def first_jsonl_in(baseline_dir: str | Path, subdir: str) -> Path:
    root = Path(baseline_dir) / subdir
    matches = sorted(root.glob("*.jsonl"))
    if not matches:
        raise FileNotFoundError(f"No JSONL found under {root}")
    return matches[0]


def rows_by_slug_locale(path: str | Path) -> dict[tuple[str, str], dict[str, Any]]:
    return {(r["slug"], r["locale"]): r for r in read_jsonl(path)}


def rows_by_slug(path: str | Path, locale: str = "en") -> dict[str, dict[str, Any]]:
    return {r["slug"]: r for r in read_jsonl(path) if r.get("locale") == locale}


def text_values(v: Any) -> Iterable[str]:
    if isinstance(v, str):
        yield v
    elif isinstance(v, list):
        for i in v:
            yield from text_values(i)
    elif isinstance(v, dict):
        for k, i in v.items():
            if k in {"audit_fields", "evidence_used", "derived_from_synthesis", "derived_from_evidence"}:
                continue
            yield from text_values(i)


def tokens(payload: Any) -> set[str]:
    text = " ".join(text_values(payload)).lower()
    return {t for t in TOKEN_RE.findall(text) if len(t) > 2 and t not in STOP}


def dependency_content(row: dict[str, Any]) -> dict[str, Any]:
    """Return only reader/evidence content fields, excluding ledger metadata."""
    return {
        "summary": row.get("summary"),
        "items": row.get("items"),
        "work_activity_groups": row.get("work_activity_groups"),
        "tools_and_work_context": row.get("tools_and_work_context"),
        "collaboration_and_stakeholders": row.get("collaboration_and_stakeholders"),
        "work_environment": row.get("work_environment"),
        "facts": row.get("facts"),
    }


def sentence_snippets(row: dict[str, Any], limit: int = 6) -> list[str]:
    snippets: list[str] = []
    for value in text_values(row):
        for part in re.split(r"(?<=[。.!?])\s+", value):
            part = part.strip()
            if 18 <= len(part) <= 220 and part not in snippets:
                snippets.append(part)
            if len(snippets) >= limit:
                return snippets
    return snippets


def load_dependency_assets() -> dict[str, Any]:
    identity = rows_by_slug_locale(first_jsonl_in(IDENTITY_BASELINE, "assets"))
    work = rows_by_slug_locale(first_jsonl_in(WORK_BASELINE, "assets"))
    skills = rows_by_slug_locale(first_jsonl_in(SKILLS_BASELINE, "assets"))
    fit = rows_by_slug_locale(first_jsonl_in(FIT_BASELINE, "assets"))
    work_en = rows_by_slug(first_jsonl_in(WORK_BASELINE, "assets"), "en")
    skills_en = rows_by_slug(first_jsonl_in(SKILLS_BASELINE, "assets"), "en")
    return {"identity": identity, "work": work, "skills": skills, "fit": fit, "work_en": work_en, "skills_en": skills_en}


def build_index(seed_rows: list[dict[str, Any]], deps: dict[str, Any]) -> dict[str, Any]:
    by_slug = {r["slug"]: r for r in seed_rows}
    text_tokens: dict[str, set[str]] = {}
    for row in seed_rows:
        slug = row["slug"]
        text_tokens[slug] = tokens(dependency_content(deps["work_en"].get(slug, {}))) | tokens(dependency_content(deps["skills_en"].get(slug, {})))
    return {"seed_by_slug": by_slug, "tokens": text_tokens}


def soc_major(seed_row: dict[str, Any]) -> str:
    code = str(seed_row.get("soc_code_seed") or "")
    return code.split("-")[0] if "-" in code else code[:2]


def choose_adjacent(slug: str, seed_rows: list[dict[str, Any]], deps: dict[str, Any], index: dict[str, Any], count: int = 5) -> list[dict[str, Any]]:
    own = index["seed_by_slug"][slug]
    own_tokens = index["tokens"].get(slug, set())
    scores = []
    for cand in seed_rows:
        cslug = cand["slug"]
        if cslug == slug:
            continue
        c_tokens = index["tokens"].get(cslug, set())
        overlap = own_tokens & c_tokens
        if not overlap:
            continue
        score = len(overlap)
        if soc_major(own) and soc_major(own) == soc_major(cand):
            score += 2
        if str(own.get("onet_code_seed", ""))[:2] == str(cand.get("onet_code_seed", ""))[:2]:
            score += 1
        scores.append((score, len(overlap), cand["seed_ordinal"], cand, sorted(overlap)[:8]))
    scores.sort(key=lambda x: (-x[0], -x[1], x[2]))
    chosen = []
    for score, overlap_count, _, cand, overlap in scores[:count]:
        relation = "adjacent_role"
        if soc_major(own) == soc_major(cand):
            relation = "same_major_group_with_work_skill_overlap"
        chosen.append({
            "slug": cand["slug"],
            "title_en": cand["title_en"],
            "title_zh": cand.get("title_zh") or cand.get("title_zh_seed"),
            "soc_code_seed": cand.get("soc_code_seed"),
            "onet_code_seed": cand.get("onet_code_seed"),
            "relation_type": relation,
            "overlap_tokens": overlap,
            "overlap_count": overlap_count,
            "score_basis": "work_activities_and_skills_overlap; SOC/O*NET proximity is supporting context only",
        })
    return chosen


def source_objects(slug: str, seed_row: dict[str, Any]) -> list[dict[str, Any]]:
    onet = seed_row.get("onet_code_seed") or ""
    return [
        {
            "name": "FermatMind PASS career-identity baseline",
            "url": str(IDENTITY_BASELINE),
            "boundary": "Occupation identity and official boundary only.",
            "source_type": "frozen_dependency_baseline",
        },
        {
            "name": "FermatMind PASS career-work-activities baseline",
            "url": str(WORK_BASELINE),
            "boundary": "Verified work activities and workflow comparison evidence.",
            "source_type": "frozen_dependency_baseline",
        },
        {
            "name": "FermatMind PASS career-skills-entry baseline",
            "url": str(SKILLS_BASELINE),
            "boundary": "Verified skills and preparation evidence. Not a mobility guarantee.",
            "source_type": "frozen_dependency_baseline",
        },
        {
            "name": "O*NET OnLine occupational profile",
            "url": f"https://www.onetonline.org/link/summary/{onet}" if onet else "https://www.onetonline.org/",
            "boundary": "Official occupational profile context; relatedness still requires work and skill overlap evidence.",
            "source_type": "official_profile",
        },
    ]


def common_required_findings(rows: list[dict[str, Any]], ledger_type: str) -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []
    seen = set()
    required = {"ledger_type", "asset_version", "block_type", "slug", "locale", "occupation", "seed_ordinal", "batch_role", "sources", "audit_fields"}
    for i, row in enumerate(rows, 1):
        missing = sorted(required - row.keys())
        if missing:
            findings.append({"row": i, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_required_fields", "fields": missing})
        if row.get("ledger_type") != ledger_type:
            findings.append({"row": i, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "bad_ledger_type"})
        if row.get("block_type") != BLOCK_TYPE:
            findings.append({"row": i, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "bad_block_type"})
        if row.get("locale") not in LOCALES:
            findings.append({"row": i, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "bad_locale"})
        key = (row.get("slug"), row.get("locale"))
        if key in seen:
            findings.append({"row": i, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "duplicate_slug_locale"})
        seen.add(key)
        if not row.get("sources"):
            findings.append({"row": i, "slug": row.get("slug"), "locale": row.get("locale"), "issue": "missing_sources"})
    return findings


def gate_report(output: str | Path, findings: list[dict[str, Any]], summary: dict[str, Any]) -> int:
    final = "PASS" if not findings else "REPAIR_REQUIRED"
    write_json(output, {**summary, "finding_count": len(findings), "findings": findings, "final_conclusion": final})
    return 0 if final == "PASS" else 1


def assert_no_runtime_or_search(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []
    for row in rows:
        text = "\n".join(text_values(row))
        if RUNTIME_OR_SEO.search(text):
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "runtime_or_search_instruction_leakage"})
        if RAW_INTERNAL.search(text):
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "raw_internal_metadata_leakage"})
        negative_boundary = any(marker in text.lower() for marker in ("not a direct-switch", "not presented as direct-switch", "不是“直接可转”", "不是直接转行", "不作为直接"))
        if UNSAFE_TRANSFER.search(text) and not negative_boundary:
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "unsupported_transfer_or_outcome_claim"})
        if DISALLOWED_PROXY.search(text):
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "disallowed_proxy_claim"})
        if row.get("locale") == "en" and re.search(r"[\u4e00-\u9fff]", text):
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "english_contains_chinese"})
        if row.get("locale") == "zh-CN" and len(re.findall(r"[A-Za-z]{20,}", text)) > 2:
            findings.append({"slug": row.get("slug"), "locale": row.get("locale"), "issue": "zh_contains_long_english_prose"})
    return findings


def parser(description: str) -> argparse.ArgumentParser:
    return argparse.ArgumentParser(description=description)
