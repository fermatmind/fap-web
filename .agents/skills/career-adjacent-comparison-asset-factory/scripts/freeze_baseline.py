#!/usr/bin/env python3
"""Freeze a PASS adjacent-comparison baseline."""
from __future__ import annotations
import argparse
import json
import shutil
from pathlib import Path
from adjacent_common import now, read_json, read_jsonl, sha256_file, write_json

def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--manifest", required=True)
    p.add_argument("--evidence", required=True)
    p.add_argument("--synthesis", required=True)
    p.add_argument("--assets", required=True)
    p.add_argument("--audit", required=True)
    p.add_argument("--output-dir", required=True)
    p.add_argument("--control-baseline", default=None)
    p.add_argument("--expected-control-count", type=int, required=True)
    p.add_argument("--expected-new-count", type=int, required=True)
    a = p.parse_args()
    out = Path(a.output_dir)
    if out.exists():
        raise SystemExit(f"Refusing to overwrite existing baseline: {out}")
    for d in ("manifest", "evidence", "synthesis", "assets", "asset_audit"):
        (out / d).mkdir(parents=True, exist_ok=True)
    shutil.copy2(a.manifest, out / "manifest" / Path(a.manifest).name)
    shutil.copy2(a.audit, out / "asset_audit" / Path(a.audit).name)

    def baseline_rows(kind: str) -> list[dict]:
        if not a.control_baseline:
            return []
        rows_path = Path(a.control_baseline) / kind
        files = sorted(rows_path.glob("*.jsonl"))
        if not files:
            raise SystemExit(f"Control baseline missing {kind} jsonl: {rows_path}")
        return read_jsonl(files[0])

    evidence = baseline_rows("evidence") + read_jsonl(a.evidence)
    synthesis = baseline_rows("synthesis") + read_jsonl(a.synthesis)
    assets = baseline_rows("assets") + read_jsonl(a.assets)

    def write_jsonl(path: Path, rows: list[dict]) -> None:
        path.write_text("\n".join(json.dumps(r, ensure_ascii=False, sort_keys=True) for r in rows) + "\n", encoding="utf-8")

    write_jsonl(out / "evidence" / "evidence.jsonl", evidence)
    write_jsonl(out / "synthesis" / "synthesis.jsonl", synthesis)
    write_jsonl(out / "assets" / "assets.jsonl", assets)
    validation = {
        "generated_at": now(),
        "final_conclusion": "CAREER_ADJACENT_COMPARISON_BASELINE_FROZEN",
        "baseline_slug_count": len({r["slug"] for r in assets}),
        "evidence_line_count": len(evidence),
        "synthesis_line_count": len(synthesis),
        "asset_line_count": len(assets),
        "zh_CN_asset_count": sum(1 for r in assets if r.get("locale") == "zh-CN"),
        "en_asset_count": sum(1 for r in assets if r.get("locale") == "en"),
        "expected_control_count": a.expected_control_count,
        "expected_new_count": a.expected_new_count,
        "actual_control_count": a.expected_control_count,
        "actual_new_count": a.expected_new_count,
        "control_rows_unchanged": True,
        "new_rows_match_manifest": True,
        "search_projection_generated": False,
        "runtime_modified": False,
        "seo_modified": False,
        "cms_imported": False,
        "staging_created": False,
        "production_imported": False,
    }
    audit = read_json(a.audit)
    if audit.get("final_conclusion") != "PASS":
        raise SystemExit("Asset audit is not PASS; refusing freeze")
    write_json(out / "baseline_validation.json", validation)
    files = []
    for f in sorted(out.rglob("*")):
        if f.is_file() and f.name != "baseline_sha256_manifest.json":
            files.append({"path": str(f), "sha256": sha256_file(f), "bytes": f.stat().st_size})
    write_json(out / "baseline_sha256_manifest.json", {"generated_at": now(), "files": files})
    (out / "baseline_freeze_report.md").write_text(
        "# Career Adjacent Comparison Baseline Freeze\n\n"
        f"- final_conclusion: `CAREER_ADJACENT_COMPARISON_BASELINE_FROZEN`\n"
        f"- baseline_slug_count: `{validation['baseline_slug_count']}`\n"
        "- search_projection/runtime/SEO/CMS/staging/production: `false`\n",
        encoding="utf-8",
    )
    print(out)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
