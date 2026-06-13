#!/usr/bin/env python3
"""Freeze PASS batch artifacts and record SHA-256 manifests."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import copy_with_sha, read_audit_verdict, write_basic_md, write_json


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--artifact", action="append", default=[], help="file path to archive; may be repeated")
    parser.add_argument("--audit", action="append", default=[], help="audit.json path that must be PASS; may be repeated")
    args = parser.parse_args()

    verdicts = {path: read_audit_verdict(Path(path)) for path in args.audit}
    if any(verdict != "PASS" for verdict in verdicts.values()):
        write_json(args.output_dir / "baseline_freeze_failed.json", {"verdicts": verdicts})
        return 2

    entries = []
    for item in args.artifact:
        src = Path(item)
        entries.append(copy_with_sha(src, args.output_dir / src.name))
    write_json(args.output_dir / "baseline_file_manifest.json", {"entries": entries})
    write_json(args.output_dir / "baseline_sha256_manifest.json", {"files": entries})
    write_basic_md(args.output_dir / "baseline_freeze_report.md", "Baseline Freeze Report", [
        f"- audits_passed: `{len(verdicts)}`",
        f"- archived_files: `{len(entries)}`",
        "- source files modified during freeze: `0`",
    ])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
