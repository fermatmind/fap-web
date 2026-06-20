#!/usr/bin/env python3
"""Normalize a career content gate report verdict.

This script is read-only. It does not repair rows or advance pipeline state.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

STOP_CLASSES = {
    "gate_policy_review_needed",
    "source_availability_issue",
    "evidence_insufficient",
    "asset_repair_needed",
    "schema_change_needed",
}


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


def text_blob(data: dict) -> str:
    return json.dumps(data, ensure_ascii=False).lower()


def classify_stop(
    data: dict,
    normalized: str,
    repair_loop_count: int,
    max_repair_loops: int,
    source_status: str,
    cache_status: str,
    phase: str,
) -> str | None:
    blob = text_blob(data)
    phase_text = phase.lower()
    source_text = source_status.lower()
    cache_text = cache_status.lower()

    if normalized in {"REJECT", "BLOCKED"}:
        if "schema" in blob:
            return "schema_change_needed"
        if "source" in blob or "timeout" in blob or "captcha" in blob or "paywall" in blob:
            return "source_availability_issue"
        if "evidence" in blob or "insufficient" in blob:
            return "evidence_insufficient"
        return "gate_policy_review_needed"

    if source_text in {"source_removed", "source_changed", "cache_missing"}:
        return "source_availability_issue"
    if source_text == "transient_source_timeout" and cache_text != "cache_available":
        return "source_availability_issue"
    if source_text == "transient_source_timeout" and phase_text in {"evidence", "evidence_repair", "trust_audit"}:
        return "source_availability_issue"

    if normalized == "REPAIR_REQUIRED" and repair_loop_count >= max_repair_loops:
        if "military" in blob and ("55-" in blob or "duties" in blob):
            return "gate_policy_review_needed"
        if "source" in blob or "timeout" in blob:
            return "source_availability_issue"
        if "evidence" in blob or "workflow" in blob:
            return "evidence_insufficient"
        if "asset" in blob or "reader" in blob or phase_text == "asset":
            return "asset_repair_needed"
        return "gate_policy_review_needed"

    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Normalize a gate report into PASS/REPAIR_REQUIRED/REJECT/BLOCKED.")
    parser.add_argument("--gate-report", required=True)
    parser.add_argument("--phase", default="unknown")
    parser.add_argument("--repair-loop-count", type=int, default=0)
    parser.add_argument("--max-repair-loops", type=int, default=2)
    parser.add_argument(
        "--source-status",
        default="unknown",
        choices=[
            "unknown",
            "transient_source_timeout",
            "cache_available",
            "cache_missing",
            "source_removed",
            "source_changed",
            "source_required_for_evidence",
            "source_not_required_for_asset_reaudit_if_evidence_pass",
        ],
    )
    parser.add_argument("--cache-status", default="unknown", choices=["unknown", "cache_available", "cache_missing"])
    parser.add_argument("--output")
    args = parser.parse_args()

    path = Path(args.gate_report)
    data = load_json(path)
    raw = extract_verdict(data)
    normalized = normalize_verdict(raw)
    stop_classification = classify_stop(
        data,
        normalized,
        args.repair_loop_count,
        args.max_repair_loops,
        args.source_status,
        args.cache_status,
        args.phase,
    )
    cache_only_allowed = (
        args.source_status == "transient_source_timeout"
        and args.cache_status == "cache_available"
        and args.phase in {"synthesis", "asset", "asset_reaudit", "synthesis_reaudit"}
        and normalized != "REJECT"
        and stop_classification is None
    )
    report = {
        "gate_report": str(path),
        "raw_verdict": raw,
        "normalized_verdict": normalized,
        "finding_count": data.get("finding_count"),
        "ready": data.get("ready") or data.get("READY"),
        "repair_required": data.get("repair_required") or data.get("REPAIR_REQUIRED"),
        "blocked": data.get("blocked") or data.get("BLOCKED"),
        "phase": args.phase,
        "repair_loop_count": args.repair_loop_count,
        "max_repair_loops": args.max_repair_loops,
        "max_repair_loops_exceeded": args.repair_loop_count >= args.max_repair_loops and normalized == "REPAIR_REQUIRED",
        "source_status": args.source_status,
        "cache_status": args.cache_status,
        "cache_only_allowed": cache_only_allowed,
        "stop_classification": stop_classification,
        "known_stop_classes": sorted(STOP_CLASSES),
    }

    if args.output:
        out = Path(args.output)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if normalized != "UNKNOWN" else 2


if __name__ == "__main__":
    raise SystemExit(main())
