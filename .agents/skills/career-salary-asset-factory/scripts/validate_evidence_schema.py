#!/usr/bin/env python3
"""Validate evidence JSONL against the skill evidence schema."""

from __future__ import annotations

import argparse
from pathlib import Path

from pipeline_lib import read_json, read_jsonl, validation_error, write_json


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--schema", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--control-baseline", type=Path, help="trusted control evidence JSONL; unchanged control rows are regression-checked instead of rejudged against the current schema")
    args = parser.parse_args()

    rows, parse_errors = read_jsonl(args.input)
    schema = read_json(args.schema)
    control_by_slug = {}
    control_parse_errors = []
    if args.control_baseline:
        control_rows, control_parse_errors = read_jsonl(args.control_baseline)
        control_by_slug = {row.get("slug"): row for row in control_rows}
    schema_errors = []
    control_checked_count = 0
    control_changed_count = 0
    schema_validated_count = 0
    for idx, row in enumerate(rows, 1):
        slug = row.get("slug")
        if slug in control_by_slug:
            control_checked_count += 1
            if row != control_by_slug[slug]:
                control_changed_count += 1
                schema_errors.append(f"line {idx}: $.control: row changed from trusted baseline for slug {slug!r}")
            continue
        schema_validated_count += 1
        schema_errors.extend(f"line {idx}: {err}" for err in validation_error(row, schema))
    result = {
        "valid": not parse_errors and not control_parse_errors and not schema_errors,
        "total_lines": len(rows) + len(parse_errors),
        "valid_json_lines": len(rows),
        "parse_error_count": len(parse_errors),
        "control_parse_error_count": len(control_parse_errors),
        "control_rows_checked": control_checked_count,
        "control_changed_count": control_changed_count,
        "schema_validated_count": schema_validated_count,
        "schema_error_count": len(schema_errors),
        "errors": parse_errors + [f"control: {error}" for error in control_parse_errors] + schema_errors[:200],
    }
    write_json(args.output, result)
    print(result)
    return 0 if result["valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
