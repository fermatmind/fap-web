#!/usr/bin/env python3
"""Shared helpers for read-only career content editorial quality audits."""

from __future__ import annotations

import csv
import hashlib
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


LOCALES = ("zh-CN", "en")
DO_NOT_MODIFY_FIELDS = [
    "source_urls",
    "source_ids",
    "evidence_ids",
    "row_hash",
    "source_row_hash",
    "seed_identity",
    "slug",
    "soc_code",
    "onet_code",
    "salary_values",
    "ai_impact_scores",
    "search_projection",
    "runtime_seo",
]

LEAKAGE_PATTERNS = [
    "audit_fields",
    "evidence_id",
    "source_id",
    "row_hash",
    "source_row_hash",
    "internal_lineage",
    "search_projection",
    "candidate_only",
    "backend projection",
]

OUTCOME_PROMISE_PATTERNS = [
    "guaranteed job",
    "guaranteed career",
    "guaranteed salary",
    "income prediction",
    "will get hired",
    "一定会找到工作",
    "保证就业",
    "保证收入",
    "收入预测",
]

GENERIC_PHRASES = [
    "responsible for",
    "work with stakeholders",
    "communicate effectively",
    "review information",
    "analyze data",
    "solve problems",
    "support operations",
    "make decisions",
    "处理信息",
    "沟通协调",
    "解决问题",
    "支持工作",
    "进行分析",
    "完成任务",
]

ACTION_WORDS_EN = {
    "audit",
    "calculate",
    "inspect",
    "diagnose",
    "document",
    "operate",
    "design",
    "install",
    "repair",
    "teach",
    "counsel",
    "negotiate",
    "test",
    "monitor",
    "maintain",
    "prepare",
    "review",
    "measure",
    "record",
    "coordinate",
    "draft",
    "evaluate",
    "classify",
    "assemble",
}

CONCRETE_MARKERS = {
    "tool",
    "software",
    "equipment",
    "system",
    "report",
    "record",
    "patient",
    "student",
    "client",
    "customer",
    "court",
    "aircraft",
    "machine",
    "site",
    "drawing",
    "specification",
    "permit",
    "case",
    "lesson",
    "inspection",
    "工具",
    "系统",
    "设备",
    "报告",
    "记录",
    "患者",
    "学生",
    "客户",
    "法院",
    "飞机",
    "机器",
    "现场",
    "图纸",
    "规范",
    "许可",
    "案例",
    "课程",
    "检查",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as handle:
        json.dump(data, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


def iter_jsonl(path: Path) -> Iterable[dict[str, Any]]:
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if line:
                yield json.loads(line)


def read_seed(path: Path) -> list[dict[str, Any]]:
    data = read_json(path)
    if isinstance(data, dict):
        rows = data.get("jobs", [])
    else:
        rows = data
    if not isinstance(rows, list):
        raise ValueError(f"Unsupported seed shape: {path}")
    return rows


def seed_slug(row: dict[str, Any]) -> str:
    return str(row.get("slug") or "")


def seed_title(row: dict[str, Any], locale: str) -> str:
    occ = row.get("occupation") or {}
    if locale == "zh-CN":
        return str(occ.get("title_zh") or row.get("title_zh") or seed_slug(row))
    return str(occ.get("title_en") or row.get("title_en") or seed_slug(row))


def flatten_text(value: Any, path: str = "$") -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    if isinstance(value, str):
        if value.strip():
            out.append((path, value.strip()))
    elif isinstance(value, list):
        for idx, item in enumerate(value):
            out.extend(flatten_text(item, f"{path}[{idx}]"))
    elif isinstance(value, dict):
        for key, item in value.items():
            if key in {"audit_fields"}:
                continue
            out.extend(flatten_text(item, f"{path}.{key}"))
    return out


def normalize_sentence(text: str) -> str:
    text = re.sub(r"https?://\S+", " URL ", text)
    text = re.sub(r"\b\d+(?:\.\d+)?\b", " NUM ", text)
    text = re.sub(r"[A-Z][a-z]+(?: [A-Z][a-z]+){1,}", " TITLE ", text)
    text = re.sub(r"[\u4e00-\u9fff]{2,}", " 中文片段 ", text)
    text = re.sub(r"[^A-Za-z0-9_\u4e00-\u9fff]+", " ", text).strip().lower()
    return re.sub(r"\s+", " ", text)


def split_sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[。！？.!?])\s+|[。！？]\s*", text)
    return [p.strip() for p in parts if len(p.strip()) >= 18]


def token_set(text: str) -> set[str]:
    return set(re.findall(r"[A-Za-z][A-Za-z-]{2,}|[\u4e00-\u9fff]{2,}", text.lower()))


def contains_chinese(text: str) -> bool:
    return bool(re.search(r"[\u4e00-\u9fff]", text))


def contains_long_english(text: str) -> bool:
    return bool(re.search(r"(?:[A-Za-z][A-Za-z-]*\s+){8,}[A-Za-z][A-Za-z-]*", text))


def short_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:12]


def rows_by_slug_locale(page_assembly_jsonl: Path) -> dict[tuple[str, str], dict[str, Any]]:
    rows: dict[tuple[str, str], dict[str, Any]] = {}
    for row in iter_jsonl(page_assembly_jsonl):
        slug = str(row.get("slug") or "")
        locale = str(row.get("locale") or "")
        if slug and locale:
            rows[(slug, locale)] = row
    return rows


def select_sample_slugs(seed_rows: list[dict[str, Any]], minimum: int = 50) -> list[dict[str, Any]]:
    keywords = {
        "dirty_title": ["diagnosis", "职业诊断", "misc", "other"],
        "medical": ["physician", "surgeon", "nurse", "therapist", "medical", "clinical", "dentist", "veterinarian"],
        "military_aviation": ["air", "pilot", "aviation", "aircraft", "military", "command", "tactical", "flight"],
        "trade_service": ["mechanic", "installer", "repair", "operator", "driver", "cook", "carpenter", "electrician"],
        "managerial": ["manager", "administrator", "executive", "director"],
        "education": ["teacher", "instructor", "education", "counselor", "professor"],
        "creative": ["actor", "writer", "artist", "designer", "music", "dancer", "choreographer"],
        "legal": ["law", "judge", "legal", "paralegal", "compliance"],
    }
    selected: dict[str, dict[str, Any]] = {}
    for row in seed_rows[:10]:
        selected[seed_slug(row)] = row
    for row in seed_rows:
        slug = seed_slug(row)
        text = json.dumps(row, ensure_ascii=False).lower()
        if any(any(k in text for k in vals) for vals in keywords.values()):
            selected.setdefault(slug, row)
        if len(selected) >= max(minimum + 20, 70):
            break
    for row in seed_rows[-46:]:
        selected.setdefault(seed_slug(row), row)
    for row in seed_rows:
        if len(selected) >= minimum:
            break
        selected.setdefault(seed_slug(row), row)
    ordered = sorted(selected.values(), key=lambda r: int(r.get("ordinal") or 999999))
    return ordered[: max(minimum, min(len(ordered), 80))]


def phrase_reuse(rows: list[dict[str, Any]]) -> dict[str, int]:
    counter: Counter[str] = Counter()
    for row in rows:
        text = "\n".join(t for _, t in flatten_text(row))
        for sentence in split_sentences(text):
            skeleton = normalize_sentence(sentence)
            if len(skeleton) >= 20:
                counter[skeleton] += 1
    return {k: v for k, v in counter.items() if v >= 4}


def score_row(row: dict[str, Any], title: str, phrase_counts: dict[str, int]) -> tuple[dict[str, float], list[dict[str, Any]]]:
    slug = str(row.get("slug") or "")
    locale = str(row.get("locale") or "")
    block = str(row.get("block_type") or row.get("ledger_type") or "career-page-assembly")
    texts = flatten_text(row)
    joined = "\n".join(text for _, text in texts)
    tokens = token_set(joined)
    title_tokens = token_set(title.replace("-", " "))
    slug_tokens = set(slug.replace("-", " ").split())
    concrete_hits = sum(1 for marker in CONCRETE_MARKERS if marker.lower() in joined.lower())
    action_hits = sum(1 for word in ACTION_WORDS_EN if re.search(rf"\b{re.escape(word)}(?:s|ed|ing)?\b", joined.lower()))
    generic_hits = sum(joined.lower().count(p.lower()) for p in GENERIC_PHRASES)
    sentence_skeletons = [normalize_sentence(s) for s in split_sentences(joined)]
    repeated_hits = sum(1 for s in sentence_skeletons if phrase_counts.get(s, 0) >= 4)
    block_refs = row.get("block_refs") or {}
    available_refs = sum(1 for ref in block_refs.values() if isinstance(ref, dict) and ref.get("status") in {"available", "mature_registered"})
    missing_blocks = row.get("missing_blocks") or []

    specificity = min(5.0, 1.5 + 0.2 * len(tokens & (title_tokens | slug_tokens)) + 0.35 * concrete_hits + 0.15 * action_hits)
    workflow = min(5.0, 1.3 + 0.25 * action_hits + 0.28 * concrete_hits)
    usefulness = min(5.0, 2.0 + 0.25 * concrete_hits + (0.7 if re.search(r"准备|next|test|compare|review|check|验证|选择|行动", joined, re.I) else 0))
    template = max(0.0, 5.0 - 0.55 * generic_hits - 0.7 * repeated_hits)
    locale_score = 5.0
    if locale == "en" and contains_chinese(joined):
        locale_score -= 2.5
    if locale == "zh-CN" and contains_long_english(joined):
        locale_score -= 1.5
    if locale == "zh-CN" and len(re.findall(r"\b[A-Za-z][A-Za-z-]{5,}\b", joined)) > 24:
        locale_score -= 1.0
    locale_score = max(0.0, locale_score)
    conversion = 4.0 if re.search(r"RIASEC|Holland|MBTI|Big Five|测|测试|匹配|recommendation|next step|下一步", joined, re.I) else 2.8
    competitive = min(5.0, (specificity + workflow + usefulness) / 3 + 0.3 * min(available_refs, 4))
    source_density = min(5.0, 2.0 + 0.45 * available_refs - 0.8 * len(missing_blocks))
    block_relevance = max(0.0, 5.0 - 1.5 * len(missing_blocks))
    boundary = 5.0
    disclaimer_count = len(re.findall(r"not .*prediction|not .*guarantee|不是.*预测|不.*保证|边界|boundary", joined, re.I))
    if disclaimer_count > 4:
        boundary -= 1.5
    if len(joined) > 5500:
        boundary -= 0.5
    boundary = max(0.0, boundary)

    scores = {
        "occupation_specificity_score": round(specificity, 2),
        "workflow_density_score": round(workflow, 2),
        "reader_usefulness_score": round(usefulness, 2),
        "template_reuse_score": round(template, 2),
        "locale_naturalness_score": round(locale_score, 2),
        "conversion_clarity_score": round(conversion, 2),
        "competitive_depth_score": round(competitive, 2),
        "source_backed_claim_density_score": round(source_density, 2),
        "block_relevance_score": round(block_relevance, 2),
        "reader_safe_boundary_score": round(boundary, 2),
    }
    scores["overall_editorial_score"] = round(sum(scores.values()) / len(scores), 2)

    findings: list[dict[str, Any]] = []

    def add(kind: str, severity: str, reason: str, instruction: str, field_path: str = "$", excerpt: str = "") -> None:
        findings.append({
            "finding_id": f"{kind}:{slug}:{locale}:{short_hash(reason + field_path)}",
            "severity": severity,
            "finding_type": kind,
            "slug": slug,
            "locale": locale,
            "field_path": field_path,
            "excerpt": excerpt[:240],
            "reason": reason,
            "repair_instruction": instruction,
            "repair_allowed_without_source_change": severity != "blocked",
            "requires_human_review": severity == "blocked" or kind in {"unsupported_fact_risk", "CTA_outcome_promise"},
        })

    if specificity < 3:
        add("weak_occupation_specificity", "repair_required", "The row has limited occupation-specific workflow/tool/stakeholder detail.", "Use existing block evidence to add concrete occupation-specific work context.")
    if workflow < 3:
        add("low_workflow_density", "repair_required", "The row reads more like general advice than concrete work activity.", "Strengthen task sequence, tool, artifact, setting, or decision detail from source-backed blocks.")
    if usefulness < 3:
        add("low_reader_usefulness", "warning", "The row may not help a reader make a better career exploration decision.", "Clarify what the reader can inspect, compare, or do next.")
    if template < 3:
        add("generic_template", "repair_required", "Repeated skeletons or generic phrases create template risk.", "Rewrite generic sections using block evidence and avoid slot-filled sentence patterns.")
    if locale_score < 4:
        add("locale_naturalness_issue", "repair_required", "Locale writing appears mixed or translation-like.", "Rewrite in natural locale-specific language without adding facts.")
    if conversion < 3:
        add("conversion_unclear", "warning", "The row does not clearly guide the reader's next decision.", "Add or improve bounded next-step guidance without outcome promises.")
    if competitive < 3.2:
        add("competitive_depth_weak", "warning", "The row may not be materially more useful than a generic career directory entry.", "Increase specific tradeoffs, artifacts, constraints, or decision boundaries.")
    for path, text in texts:
        low = text.lower()
        if any(p in low for p in LEAKAGE_PATTERNS):
            add("raw_enum_leakage", "blocked", "Reader-facing text contains audit/internal/source identifier leakage.", "Remove internal labels and source identifiers from reader-facing fields.", path, text)
        if any(p in low for p in OUTCOME_PROMISE_PATTERNS):
            add("CTA_outcome_promise", "blocked", "Reader-facing text may imply a guaranteed personal outcome.", "Remove outcome guarantee or prediction language.", path, text)

    return scores, findings


def write_csv(path: Path, rows: list[dict[str, Any]], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        for row in rows:
            writer.writerow({key: row.get(key, "") for key in fieldnames})


def markdown_table(rows: list[dict[str, Any]], columns: list[str], limit: int = 20) -> str:
    if not rows:
        return "_No rows._\n"
    header = "| " + " | ".join(columns) + " |\n"
    sep = "| " + " | ".join("---" for _ in columns) + " |\n"
    body = ""
    for row in rows[:limit]:
        body += "| " + " | ".join(str(row.get(col, "")).replace("\n", " ")[:160] for col in columns) + " |\n"
    return header + sep + body
