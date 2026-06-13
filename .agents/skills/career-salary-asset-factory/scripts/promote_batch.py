#!/usr/bin/env python3
"""Promote a PASS batch into a frozen baseline directory."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import copy_with_sha, read_audit_verdict, write_json


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audit", required=True, type=Path)
    parser.add_argument("--artifact", action="append", default=[])
    parser.add_argument("--output-dir", required=True, type=Path)
    args = parser.parse_args()
    verdict = read_audit_verdict(args.audit)
    if verdict != "PASS":
        write_json(args.output_dir / "promotion_blocked.json", {"status": "BLOCKED", "audit_verdict": verdict})
        return 2
    entries = [copy_with_sha(Path(item), args.output_dir / Path(item).name) for item in args.artifact]
    write_json(args.output_dir / "promotion_manifest.json", {"audit": str(args.audit), "files": entries})
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
