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
    "dispatch_exact_package_promotion",
}

V2_PROMOTION_ACTIONS = {
    "dispatch_exact_package_promotion",
}

DIRECT_ACTIONS_FORBIDDEN = {
    "cms_import",
    "staging_preview_write",
    "approved_transition",
    "production_import",
}

SEPARATELY_CONTROLLED_ACTIONS = {
    "schema_change",
    "runtime_change",
    "seo_change",
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
    allowed = action in AUTONOMOUS_ALLOWED
    blocker_kind = None
    reason = "autonomous_allowed" if allowed else "unknown_action"

    if action in V2_PROMOTION_ACTIONS:
        reason = "trusted_backend_promotion_dispatch_allowed"
    elif action in DIRECT_ACTIONS_FORBIDDEN:
        allowed = False
        reason = "direct_action_forbidden"
        blocker_kind = "direct_action_forbidden"
    elif action in SEPARATELY_CONTROLLED_ACTIONS:
        allowed = False
        reason = "separately_controlled_scope_required"
        blocker_kind = "separately_controlled_action"
    elif not allowed:
        blocker_kind = "unknown_action"

    if action in CONTENT_ACTIONS and args.dry_run:
        reason = "dry_run_blocks_execution"
    elif action in CONTENT_ACTIONS and not args.allow_content_generation:
        allowed = False
        reason = "content_generation_requires_execution_goal"
        blocker_kind = "execution_goal_required"

    report = {
        "action": action,
        "allowed": allowed,
        # Kept for historical report/schema compatibility. V2 execution must use
        # machine-gate and scope classifications rather than approval prompts.
        "requires_human_approval": False,
        "dry_run": args.dry_run,
        "execution_allowed": allowed and not args.dry_run,
        "content_generation_action": action in CONTENT_ACTIONS,
        "trusted_backend_promotion_dispatch": action in V2_PROMOTION_ACTIONS,
        "reason": reason,
        "blocker_kind": blocker_kind,
    }

    if args.output:
        out = Path(args.output)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if allowed or args.dry_run else 2


if __name__ == "__main__":
    raise SystemExit(main())
