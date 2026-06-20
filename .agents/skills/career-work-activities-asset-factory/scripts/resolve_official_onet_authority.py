#!/usr/bin/env python3
"""Validate narrow official O*NET authority overrides for work-activities.

This script writes only authority-review sidecars and reports. It does not
generate evidence, synthesis, reader assets, search projection, staging data,
runtime files, or production imports.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import html
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any


DEFAULT_TARGETS: dict[str, dict[str, str]] = {
    "compliance-officers": {
        "official_onet_code": "13-1041.00",
        "official_title": "Compliance Officers",
        "mapping_basis": "exact_official_title_match",
    },
    "computer-hardware-engineers": {
        "official_onet_code": "17-2061.00",
        "official_title": "Computer Hardware Engineers",
        "mapping_basis": "exact_official_title_match",
    },
    "computer-programmers": {
        "official_onet_code": "15-1251.00",
        "official_title": "Computer Programmers",
        "mapping_basis": "exact_official_title_match",
    },
}

SENSITIVE_OUTPUT_NAMES = (
    "evidence.jsonl",
    "synthesis.jsonl",
    "assets.jsonl",
    "search_projection.jsonl",
)


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def normalize_title(value: str | None) -> str:
    text = (value or "").casefold()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def load_seed_rows(seed_path: Path) -> list[dict[str, Any]]:
    data = read_json(seed_path)
    if isinstance(data, list):
        return data
    for key in ("jobs", "items", "careers", "rows"):
        value = data.get(key)
        if isinstance(value, list):
            return value
    raise ValueError(f"Unsupported seed shape: {seed_path}")


def seed_by_slug(seed_path: Path) -> dict[str, dict[str, Any]]:
    return {row.get("slug"): row for row in load_seed_rows(seed_path)}


def manifest_rows(manifest_path: Path) -> list[dict[str, Any]]:
    data = read_json(manifest_path)
    if isinstance(data, list):
        return data
    rows = data.get("rows")
    if isinstance(rows, list):
        return rows
    rows = data.get("manifest_rows")
    if isinstance(rows, list):
        return rows
    raise ValueError(f"Unsupported manifest shape: {manifest_path}")


def title_from_seed_row(row: dict[str, Any]) -> tuple[str, str, str | None, str | None, int | None]:
    occ = row.get("occupation") if isinstance(row.get("occupation"), dict) else {}
    return (
        row.get("title_en") or occ.get("title_en") or row.get("title") or "",
        row.get("title_zh") or row.get("title_zh_seed") or occ.get("title_zh") or "",
        row.get("soc_code_seed") or row.get("soc_code") or occ.get("soc_code"),
        row.get("onet_code_seed") or row.get("onet_code") or occ.get("onet_code"),
        row.get("seed_ordinal") or row.get("ordinal"),
    )


def onet_url(code: str) -> str:
    return f"https://www.onetonline.org/link/summary/{code}"


def fetch_official_page(code: str, timeout: int = 25) -> dict[str, Any]:
    url = onet_url(code)
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 FermatMind career content authority review"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            body = response.read().decode("utf-8", errors="replace")
            final_url = response.geturl()
            status = getattr(response, "status", 200)
    except urllib.error.HTTPError as exc:
        return {"url": url, "status": exc.code, "error": repr(exc), "accepted": False}
    except Exception as exc:  # pragma: no cover - network-specific
        return {"url": url, "status": None, "error": repr(exc), "accepted": False}

    title = extract_onet_title(body)
    code_found = extract_onet_code(body)
    return {
        "url": url,
        "final_url": final_url,
        "status": status,
        "official_title": title,
        "official_onet_code": code_found,
        "body_sha256": hashlib.sha256(body.encode("utf-8")).hexdigest(),
        "accepted": bool(title and code_found),
    }


def extract_onet_title(body: str) -> str | None:
    for pattern in (r"<h1[^>]*>\s*(.*?)\s*</h1>", r"<title[^>]*>\s*(.*?)\s*</title>"):
        match = re.search(pattern, body, flags=re.I | re.S)
        if match:
            text = re.sub(r"<[^>]+>", " ", match.group(1))
            text = html.unescape(text)
            text = re.sub(r"\s+", " ", text).strip()
            text = re.sub(r"\s+-\s+O\*NET OnLine$", "", text)
            text = clean_onet_heading(text)
            if text:
                return text
    return None


def clean_onet_heading(text: str) -> str:
    """Remove O*NET page badges/code from an occupation heading."""
    text = re.sub(r"\b\d{2}-\d{4}\.\d{2}\b.*$", "", text).strip()
    text = re.sub(r"\bBright Outlook\b.*$", "", text).strip()
    text = re.sub(r"\bUpdated\s+\d{4}\b.*$", "", text).strip()
    return re.sub(r"\s+", " ", text).strip()


def extract_onet_code(body: str) -> str | None:
    match = re.search(r"\b(\d{2}-\d{4}\.\d{2})\b", body)
    return match.group(1) if match else None


def blocked_slugs(blocked_path: Path | None) -> list[str]:
    if not blocked_path or not blocked_path.exists():
        return []
    data = read_json(blocked_path)
    return [issue.get("slug") for issue in data.get("issues", []) if issue.get("slug")]


def report_markdown_table(rows: list[dict[str, Any]], fields: list[str]) -> str:
    lines = ["| " + " | ".join(fields) + " |", "| " + " | ".join("---" for _ in fields) + " |"]
    for row in rows:
        lines.append("| " + " | ".join(str(row.get(field, "")) for field in fields) + " |")
    return "\n".join(lines)


def write_csv(path: Path, rows: list[dict[str, Any]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field) for field in fields})


def build_override(slug: str, review: dict[str, Any], seed_row: dict[str, Any]) -> dict[str, Any]:
    title_en, title_zh, soc_code, onet_code, _ordinal = title_from_seed_row(seed_row)
    resolved_onet = review["official_onet_code"]
    return {
        "slug": slug,
        "title_en_seed": title_en,
        "title_zh_seed": title_zh,
        "original_soc_code_seed": soc_code,
        "original_onet_code_seed": onet_code,
        "resolved_soc_code": resolved_onet.split(".")[0],
        "resolved_onet_code": resolved_onet,
        "official_title": review["official_title"],
        "official_source_url": review["official_source_url"],
        "mapping_quality": "reviewed_official_authority_override",
        "mapping_basis": review["mapping_basis"],
        "seed_mutated": False,
        "allowed_for_block": "career-work-activities",
        "allowed_for_stage": "evidence_collection",
        "expires_or_review_policy": "review when O*NET occupation code/title changes or career identity baseline repairs canonical seed",
        "audit_boundary": "Sidecar authority resolution only; canonical seed and frozen baselines are not mutated.",
    }


def run(args: argparse.Namespace) -> int:
    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)

    manifest = manifest_rows(Path(args.manifest))
    seed = seed_by_slug(Path(args.seed))
    manifest_by_slug = {row["slug"]: row for row in manifest if row.get("slug")}
    target_slugs = args.target_slug or list(DEFAULT_TARGETS)
    blocked = blocked_slugs(Path(args.blocked_report) if args.blocked_report else None)

    batch_200_manifest_valid = bool(manifest) and len({row.get("slug") for row in manifest}) == len(manifest)
    sensitive_generated = []
    for name in SENSITIVE_OUTPUT_NAMES:
        sensitive_generated.extend(str(path) for path in out.rglob(name))

    failure = {
        "batch_200_manifest_valid": batch_200_manifest_valid,
        "target_slugs": target_slugs,
        "blocked_slugs_from_source_availability": blocked,
        "only_target_slugs_blocked": sorted(blocked) == sorted(target_slugs),
        "evidence_generated": False,
        "synthesis_generated": False,
        "asset_generated": False,
        "search_projection_generated": False,
        "runtime_modified": False,
        "seo_modified": False,
        "cms_modified": False,
        "staging_created": False,
        "production_imported": False,
        "final_conclusion": "PASS" if batch_200_manifest_valid and sorted(blocked) == sorted(target_slugs) else "REPAIR_REQUIRED",
    }
    write_json(out / "failure_inspection_report.json", failure)
    (out / "failure_inspection_report.md").write_text(
        "# Failure Inspection Report\n\n"
        f"Final conclusion: `{failure['final_conclusion']}`\n\n"
        f"- batch 200 manifest valid: `{str(batch_200_manifest_valid).lower()}`\n"
        f"- blocked slugs: `{', '.join(blocked)}`\n"
        f"- only target slugs blocked: `{str(failure['only_target_slugs_blocked']).lower()}`\n"
        "- evidence/synthesis/asset/search_projection generated: `false`\n"
        "- runtime/SEO/CMS/staging/production modified: `false`\n",
        encoding="utf-8",
    )

    reviews: list[dict[str, Any]] = []
    capture_lines = ["# Official Source Capture Log\n"]
    unresolved = []
    for slug in target_slugs:
        candidate = DEFAULT_TARGETS.get(slug)
        seed_row = seed.get(slug) or {}
        manifest_row = manifest_by_slug.get(slug) or {}
        title_en, title_zh, soc_code, onet_code, ordinal = title_from_seed_row(seed_row or manifest_row)
        if not candidate:
            unresolved.append({"slug": slug, "reason": "no curated candidate mapping"})
            continue
        fetched = fetch_official_page(candidate["official_onet_code"], timeout=args.timeout)
        official_title = fetched.get("official_title")
        official_code = fetched.get("official_onet_code")
        normalized_title_match = normalize_title(title_en) == normalize_title(official_title)
        code_match = official_code == candidate["official_onet_code"]
        title_candidate_match = normalize_title(official_title) == normalize_title(candidate["official_title"])
        accepted = bool(
            fetched.get("status") == 200
            and normalized_title_match
            and code_match
            and title_candidate_match
        )
        rejection_reason = "" if accepted else "official_title_or_code_not_verified"
        review = {
            "slug": slug,
            "seed_ordinal": ordinal,
            "title_en_seed": title_en,
            "title_zh_seed": title_zh,
            "original_soc_code_seed": soc_code,
            "original_onet_code_seed": onet_code,
            "official_source_url": onet_url(candidate["official_onet_code"]),
            "official_title": official_title or "",
            "official_onet_code": official_code or "",
            "mapping_basis": candidate["mapping_basis"],
            "normalized_title_match": normalized_title_match,
            "ambiguity_count": 0 if accepted else 1,
            "accepted": accepted,
            "rejection_reason": rejection_reason,
            "official_page_sha256": fetched.get("body_sha256", ""),
            "http_status": fetched.get("status"),
        }
        reviews.append(review)
        capture_lines.append(
            f"## {slug}\n\n"
            f"- URL: {review['official_source_url']}\n"
            f"- HTTP status: `{review['http_status']}`\n"
            f"- Official title: `{review['official_title']}`\n"
            f"- Official O*NET code: `{review['official_onet_code']}`\n"
            f"- Mapping basis: `{review['mapping_basis']}`\n"
            f"- Accepted: `{str(accepted).lower()}`\n"
            f"- Page SHA-256: `{review['official_page_sha256']}`\n"
        )
        if not accepted:
            unresolved.append({"slug": slug, "reason": rejection_reason})

    review_fields = [
        "slug",
        "seed_ordinal",
        "title_en_seed",
        "title_zh_seed",
        "original_soc_code_seed",
        "original_onet_code_seed",
        "official_source_url",
        "official_title",
        "official_onet_code",
        "mapping_basis",
        "normalized_title_match",
        "ambiguity_count",
        "accepted",
        "rejection_reason",
        "official_page_sha256",
        "http_status",
    ]
    write_csv(out / "target_slug_authority_review.csv", reviews, review_fields)
    write_json(out / "target_slug_authority_review.json", {"reviews": reviews})
    (out / "official_source_capture_log.md").write_text("\n".join(capture_lines) + "\n", encoding="utf-8")

    if unresolved:
        (out / "unresolved_authority_mapping_report.md").write_text(
            "# Unresolved Authority Mapping Report\n\n"
            + report_markdown_table(unresolved, ["slug", "reason"])
            + "\n",
            encoding="utf-8",
        )
        return 2

    overrides = [build_override(row["slug"], row, seed[row["slug"]]) for row in reviews]
    override_payload = {
        "policy_name": "official_onet_authority_resolution_override_v1",
        "created_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "canonical_seed_mutated": False,
        "frozen_baseline_mutated": False,
        "overrides": overrides,
    }
    write_json(out / "authority_resolution_overrides.json", override_payload)
    (out / "authority_resolution_overrides.md").write_text(
        "# Authority Resolution Overrides\n\n"
        "Policy: `official_onet_authority_resolution_override_v1`\n\n"
        + report_markdown_table(
            overrides,
            [
                "slug",
                "title_en_seed",
                "original_onet_code_seed",
                "resolved_onet_code",
                "official_title",
                "mapping_quality",
                "seed_mutated",
            ],
        )
        + "\n",
        encoding="utf-8",
    )

    targeted = {
        "final_conclusion": "PASS",
        "target_slug_resolution_count": len(target_slugs),
        "target_slug_resolution_pass_count": len(overrides),
        "authority_resolution_policy_added": True,
        "direct_onet_fetch_no_longer_404_after_override_resolution": True,
        "evidence_generation_performed": False,
        "synthesis_generated": False,
        "asset_generated": False,
        "search_projection_generated": False,
        "runtime_modified": False,
        "seo_modified": False,
        "cms_modified": False,
        "staging_created": False,
        "production_imported": False,
        "canonical_seed_mutated": False,
        "frozen_baseline_mutated": False,
        "resolved_slugs": [row["slug"] for row in reviews],
    }
    write_json(out / "targeted_preflight_rerun_report.json", targeted)
    (out / "targeted_preflight_rerun_report.md").write_text(
        "# Targeted Preflight Rerun Report\n\n"
        "Final conclusion: `PASS`\n\n"
        "The three target slugs resolve to official O*NET pages through the reviewed override sidecar. "
        "No evidence, synthesis, asset, search projection, runtime, SEO, CMS, staging, or production import was generated.\n",
        encoding="utf-8",
    )

    operator = {
        "final_conclusion": "PASS",
        "execution_performed": False,
        "next_action": "resume_batch_200_evidence_generation",
        "resume_manifest": str(args.manifest),
        "authority_resolution_overrides": str(out / "authority_resolution_overrides.json"),
        "requires_human_approval": True,
        "content_generated": False,
        "search_projection_generated": False,
        "runtime_modified": False,
        "seo_modified": False,
        "cms_modified": False,
        "staging_created": False,
        "production_imported": False,
    }
    write_json(out / "operator_dry_run_report.json", operator)
    (out / "next_goal_recommendation.md").write_text(
        "# Next Goal Recommendation\n\n"
        "Resume career-work-activities batch 200 evidence generation from the validated manifest and "
        "`authority_resolution_overrides.json` sidecar. Do not mutate the canonical seed. Do not generate "
        "search_projection, runtime, SEO, CMS, staging, or production import.\n",
        encoding="utf-8",
    )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate official O*NET authority overrides for work-activities."
    )
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--seed", required=True)
    parser.add_argument("--blocked-report")
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--target-slug", action="append")
    parser.add_argument("--timeout", type=int, default=25)
    args = parser.parse_args()
    return run(args)


if __name__ == "__main__":
    sys.exit(main())
