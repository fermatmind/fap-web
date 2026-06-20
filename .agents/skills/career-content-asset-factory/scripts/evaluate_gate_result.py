#!/usr/bin/env python3
"""Normalize a career content gate report verdict.

This script is read-only. It does not repair rows or advance pipeline state.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_verdict(raw: object) -> str:
    text = str(raw or "").upper()
    if "BLOCKED" in text:
        return "BLOCKED"
    if "REJECT" in text:
        return "REJECT"
    if "REPAIR_REQUIRED" in text or "REPAIR" in text:
        return "REPAIR_REQUIRED"
    if text in {"PASS", "VALIDATION_PASS"} or text.endswith("_PASS") or "FROZEN" in text:
        return "PASS"
    if text in {"READY", "READY_FOR_NEXT"}:
        return "PASS"
    return "UNKNOWN"


def extract_verdict(data: dict) -> object:
    for key in ("final_conclusion", "validation_conclusion", "audit_conclusion", "verdict", "decision", "status"):
        if key in data:
            return data[key]
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Normalize a gate report into PASS/REPAIR_REQUIRED/REJECT/BLOCKED.")
    parser.add_argument("--gate-report", required=True)
    parser.add_argument("--output")
    args = parser.parse_args()

    path = Path(args.gate_report)
    data = load_json(path)
    raw = extract_verdict(data)
    normalized = normalize_verdict(raw)
    report = {
        "gate_report": str(path),
        "raw_verdict": raw,
        "normalized_verdict": normalized,
        "finding_count": data.get("finding_count"),
        "ready": data.get("ready") or data.get("READY"),
        "repair_required": data.get("repair_required") or data.get("REPAIR_REQUIRED"),
        "blocked": data.get("blocked") or data.get("BLOCKED"),
    }

    if args.output:
        out = Path(args.output)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if normalized != "UNKNOWN" else 2


if __name__ == "__main__":
    raise SystemExit(main())
