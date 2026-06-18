#!/usr/bin/env python3
"""Create a generic career content batch manifest.

The script preserves seed order and supports a control baseline plus new rows.
It does not generate evidence or content.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def load_json(path: str) -> object:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def rows_from_seed(seed: object) -> list[dict]:
    if isinstance(seed, list):
        return [r for r in seed if isinstance(r, dict)]
    if isinstance(seed, dict):
        for key in ("rows", "careers", "jobs", "items", "slugs"):
            value = seed.get(key)
            if isinstance(value, list):
                return [r for r in value if isinstance(r, dict)]
    raise SystemExit("Seed JSON must be a list or contain rows/careers/jobs/items/slugs.")


def slug_of(row: dict) -> str:
    slug = row.get("slug") or row.get("canonical_slug")
    if not isinstance(slug, str) or not slug:
        raise SystemExit(f"Seed row missing slug: {row}")
    return slug


def baseline_slugs(path: str | None) -> list[str]:
    if not path:
        return []
    data = load_json(path)
    if isinstance(data, dict):
        if isinstance(data.get("slugs"), list):
            return [str(s) for s in data["slugs"]]
        if isinstance(data.get("items"), list):
            return [slug_of(r) for r in data["items"] if isinstance(r, dict)]
    if isinstance(data, list):
        return [slug_of(r) for r in data if isinstance(r, dict)]
    return []


def main() -> int:
    parser = argparse.ArgumentParser(description="Create career content batch manifest.")
    parser.add_argument("--seed", required=True)
    parser.add_argument("--baseline-manifest")
    parser.add_argument("--output", required=True)
    parser.add_argument("--batch-size", type=int, default=50)
    parser.add_argument("--block", default="career-content")
    args = parser.parse_args()

    seed_rows = rows_from_seed(load_json(args.seed))
    controls = baseline_slugs(args.baseline_manifest)
    control_set = set(controls)
    new_rows = [r for r in seed_rows if slug_of(r) not in control_set][: args.batch_size]

    items: list[dict] = []
    for index, slug in enumerate(controls, start=1):
        match = next((r for r in seed_rows if slug_of(r) == slug), {})
        items.append({
            "batch_index": index,
            "seed_ordinal": match.get("ordinal") or match.get("seed_ordinal") or index,
            "slug": slug,
            "title_en": match.get("title_en") or match.get("occupation") or match.get("name_en"),
            "title_zh_seed": match.get("title_zh_seed") or match.get("title_zh") or match.get("name_zh"),
            "batch_role": f"control_{len(controls)}",
            "expected_locales": ["zh-CN", "en"],
        })
    for offset, row in enumerate(new_rows, start=1):
        items.append({
            "batch_index": len(items) + 1,
            "seed_ordinal": row.get("ordinal") or row.get("seed_ordinal") or len(items) + 1,
            "slug": slug_of(row),
            "title_en": row.get("title_en") or row.get("occupation") or row.get("name_en"),
            "title_zh_seed": row.get("title_zh_seed") or row.get("title_zh") or row.get("name_zh"),
            "batch_role": f"new_{len(new_rows)}",
            "expected_locales": ["zh-CN", "en"],
        })

    output = {
        "block": args.block,
        "total_slugs": len(items),
        "control_count": len(controls),
        "new_count": len(new_rows),
        "items": items,
    }
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

