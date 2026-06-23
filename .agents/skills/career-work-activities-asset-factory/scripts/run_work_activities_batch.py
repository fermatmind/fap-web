#!/usr/bin/env python3
"""Run one career-work-activities batch through evidence, synthesis, and asset gates."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd))
    subprocess.run(cmd, check=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--batch-index", type=int, required=True)
    parser.add_argument("--start-ordinal", type=int, required=True)
    parser.add_argument("--batch-size", type=int, default=50)
    parser.add_argument("--control-count", type=int, default=0)
    parser.add_argument("--source-cache", help="Required for evidence PASS; missing cache produces repair-required evidence.")
    parser.add_argument("--stop-after", choices=["manifest", "evidence", "synthesis", "asset"], default="asset")
    parser.add_argument("--freeze-output-dir", help="Optional freeze target. Only used after asset gate PASS.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)
    manifest = out / "manifest.json"
    evidence = out / "evidence.jsonl"
    synthesis = out / "synthesis.jsonl"
    assets = out / "assets.jsonl"
    evidence_audit = out / "evidence_audit.json"
    synthesis_audit = out / "synthesis_audit.json"
    asset_audit = out / "asset_audit.json"

    run([
        sys.executable,
        str(SCRIPT_DIR / "make_batch_manifest.py"),
        "--seed",
        args.seed,
        "--output",
        str(manifest),
        "--csv-output",
        str(out / "manifest.csv"),
        "--batch-index",
        str(args.batch_index),
        "--start-ordinal",
        str(args.start_ordinal),
        "--batch-size",
        str(args.batch_size),
        "--control-count",
        str(args.control_count),
    ])
    if args.stop_after == "manifest":
        return 0

    collect_cmd = [
        sys.executable,
        str(SCRIPT_DIR / "collect_evidence.py"),
        "--manifest",
        str(manifest),
        "--output",
        str(evidence),
    ]
    if args.source_cache:
        collect_cmd += ["--source-cache", args.source_cache]
    run(collect_cmd)
    run([sys.executable, str(SCRIPT_DIR / "validate_evidence_schema.py"), "--evidence", str(evidence), "--output", str(out / "evidence_schema.json")])
    run([
        sys.executable,
        str(SCRIPT_DIR / "audit_evidence.py"),
        "--evidence",
        str(evidence),
        "--output",
        str(evidence_audit),
        "--ready-csv",
        str(out / "evidence_ready.csv"),
        "--repair-required-csv",
        str(out / "evidence_repair_required.csv"),
        "--blocked-csv",
        str(out / "evidence_blocked.csv"),
    ])
    if args.stop_after == "evidence":
        return 0

    run([sys.executable, str(SCRIPT_DIR / "generate_synthesis.py"), "--evidence", str(evidence), "--output", str(synthesis)])
    run([
        sys.executable,
        str(SCRIPT_DIR / "audit_synthesis.py"),
        "--synthesis",
        str(synthesis),
        "--output",
        str(synthesis_audit),
        "--ready-csv",
        str(out / "synthesis_ready.csv"),
        "--repair-required-csv",
        str(out / "synthesis_repair_required.csv"),
        "--blocked-csv",
        str(out / "synthesis_blocked.csv"),
    ])
    if args.stop_after == "synthesis":
        return 0

    run([sys.executable, str(SCRIPT_DIR / "generate_asset.py"), "--synthesis", str(synthesis), "--output", str(assets)])
    run([
        sys.executable,
        str(SCRIPT_DIR / "audit_asset.py"),
        "--assets",
        str(assets),
        "--output",
        str(asset_audit),
        "--ready-csv",
        str(out / "asset_ready.csv"),
        "--repair-required-csv",
        str(out / "asset_repair_required.csv"),
        "--blocked-csv",
        str(out / "asset_blocked.csv"),
    ])
    if args.freeze_output_dir:
        run([
            sys.executable,
            str(SCRIPT_DIR / "freeze_baseline.py"),
            "--evidence",
            str(evidence),
            "--synthesis",
            str(synthesis),
            "--assets",
            str(assets),
            "--asset-gate",
            str(asset_audit),
            "--output-dir",
            args.freeze_output_dir,
        ])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
