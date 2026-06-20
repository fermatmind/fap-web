#!/usr/bin/env python3
"""Regression smoke for salary/income lexical false positives.

This script is intentionally small and self-contained. It proves that sensitive
salary/income terms are detected with word boundaries while unrelated strings
such as "sewage" do not fail by substring.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


SENSITIVE_PATTERNS = [
    re.compile(r"\bwages?\b", re.IGNORECASE),
    re.compile(r"\bsalar(?:y|ies)\b", re.IGNORECASE),
    re.compile(r"\bincome(?:\s+prediction)?\b", re.IGNORECASE),
    re.compile(r"\bpay\s+prediction\b", re.IGNORECASE),
    re.compile(r"\bjob\s+loss\b", re.IGNORECASE),
    re.compile(r"\bcareer\s+disappearance\b", re.IGNORECASE),
]

FIXTURES = [
    {"text": "wage", "expected_flag": True, "reason": "standalone wage claim"},
    {"text": "salary", "expected_flag": True, "reason": "standalone salary claim"},
    {"text": "income prediction", "expected_flag": True, "reason": "income outcome claim"},
    {"text": "sewage system", "expected_flag": False, "reason": "wage substring inside sewage"},
    {"text": "stormwater and sewer drawings", "expected_flag": False, "reason": "sewer infrastructure term"},
]


def flags_sensitive_claim(text: str) -> bool:
    return any(pattern.search(text) for pattern in SENSITIVE_PATTERNS)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run lexical false-positive regression fixtures.")
    parser.add_argument("--output")
    args = parser.parse_args()

    cases = []
    failures = []
    for fixture in FIXTURES:
        actual = flags_sensitive_claim(fixture["text"])
        passed = actual == fixture["expected_flag"]
        row = {
            **fixture,
            "actual_flag": actual,
            "passed": passed,
        }
        cases.append(row)
        if not passed:
            failures.append(row)

    report = {
        "policy": "lexical_false_positive_policy",
        "word_boundary_matching": True,
        "semantic_context_required_for_ambiguous_cases": True,
        "fixture_count": len(cases),
        "failure_count": len(failures),
        "passed": not failures,
        "cases": cases,
    }

    if args.output:
        out = Path(args.output)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["passed"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
