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
    args = parser.parse_args()

    rows, parse_errors = read_jsonl(args.input)
    schema = read_json(args.schema)
    schema_errors = []
    for idx, row in enumerate(rows, 1):
        schema_errors.extend(f"line {idx}: {err}" for err in validation_error(row, schema))
    result = {
        "valid": not parse_errors and not schema_errors,
        "total_lines": len(rows) + len(parse_errors),
        "valid_json_lines": len(rows),
        "parse_error_count": len(parse_errors),
        "schema_error_count": len(schema_errors),
        "errors": parse_errors + schema_errors[:200],
    }
    write_json(args.output, result)
    print(result)
    return 0 if result["valid"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
