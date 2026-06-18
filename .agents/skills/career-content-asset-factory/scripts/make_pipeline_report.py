#!/usr/bin/env python3
"""Create a compact pipeline report from audit JSON files."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Create a career content pipeline report.")
    parser.add_argument("--inputs", nargs="+", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    rows = []
    for item in args.inputs:
        path = Path(item)
        data = json.loads(path.read_text(encoding="utf-8"))
        rows.append({
            "path": str(path),
            "verdict": data.get("verdict") or data.get("final_conclusion") or data.get("decision"),
            "ready": data.get("ready") or data.get("READY") or data.get("ready_count"),
            "repair_required": data.get("repair_required") or data.get("REPAIR_REQUIRED"),
            "blocked": data.get("blocked") or data.get("BLOCKED"),
        })

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({"reports": rows}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

