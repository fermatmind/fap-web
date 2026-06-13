#!/usr/bin/env python3
"""Combine pipeline audit verdicts into a summary report."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import read_audit_verdict, write_basic_md, write_json


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audit", action="append", default=[])
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--json-output", type=Path)
    args = parser.parse_args()
    verdicts = [{"path": item, "verdict": read_audit_verdict(Path(item))} for item in args.audit]
    write_basic_md(args.output, "Career Salary Pipeline Report", [f"- `{v['path']}`: `{v['verdict']}`" for v in verdicts])
    if args.json_output:
        write_json(args.json_output, {"audits": verdicts})
    return 0 if all(v["verdict"] == "PASS" for v in verdicts) else 1


if __name__ == "__main__":
    raise SystemExit(main())
