#!/usr/bin/env python3
"""Guard autonomous career content operator actions."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


AUTONOMOUS_ALLOWED = {
    "inspect_state",
    "restore_baseline_preflight",
    "restore_baseline",
    "create_next_manifest",
    "generate_evidence",
    "repair_evidence",
    "generate_synthesis_asset",
    "repair_asset",
    "freeze_baseline",
    "render_next_goal",
}

HUMAN_APPROVAL_REQUIRED = {
    "schema_change",
    "runtime_change",
    "seo_change",
    "cms_import",
    "staging_preview_write",
    "approved_transition",
    "production_import",
    "modify_frozen_baseline",
    "expand_beyond_current_batch",
}

CONTENT_ACTIONS = {
    "generate_evidence",
    "repair_evidence",
    "generate_synthesis_asset",
    "repair_asset",
    "freeze_baseline",
}


def main() -> int:
    parser = argparse.ArgumentParser(description="Check whether an operator action is allowed.")
    parser.add_argument("--action", required=True)
    parser.add_argument("--dry-run", action="store_true", default=False)
    parser.add_argument("--allow-content-generation", action="store_true", default=False)
    parser.add_argument("--output")
    args = parser.parse_args()

    action = args.action
    requires_human_approval = action in HUMAN_APPROVAL_REQUIRED
    allowed = action in AUTONOMOUS_ALLOWED and not requires_human_approval
    reason = "autonomous_allowed" if allowed else "human_approval_required_or_unknown_action"

    if action in CONTENT_ACTIONS and args.dry_run:
        reason = "dry_run_blocks_execution"
    elif action in CONTENT_ACTIONS and not args.allow_content_generation:
        allowed = False
        reason = "content_generation_requires_explicit_non_dry_run_authorization"

    report = {
        "action": action,
        "allowed": allowed,
        "requires_human_approval": requires_human_approval or not allowed,
        "dry_run": args.dry_run,
        "execution_allowed": allowed and not args.dry_run,
        "content_generation_action": action in CONTENT_ACTIONS,
        "reason": reason,
    }

    if args.output:
        out = Path(args.output)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if allowed or args.dry_run else 2


if __name__ == "__main__":
    raise SystemExit(main())
