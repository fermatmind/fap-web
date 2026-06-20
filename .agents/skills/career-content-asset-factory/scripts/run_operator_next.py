#!/usr/bin/env python3
"""Plan the next safe career content operator action.

The script is dry-run-first and does not generate evidence, synthesis, assets,
search projection, runtime files, CMS writes, staging writes, or imports.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def block_state_key(block: str) -> str:
    return block.replace("-", "_")


def latest_baseline(state_dir: Path, block: str) -> dict | None:
    path = state_dir / "latest_pass_baselines.json"
    if not path.exists():
        return None
    data = read_json(path)
    return data.get(block) or data.get(block_state_key(block))


def block_status(state_dir: Path, block: str) -> dict:
    path = state_dir / "career_block_status.json"
    if not path.exists():
        return {}
    data = read_json(path)
    return data.get(block_state_key(block)) or data.get(block) or {}


def open_failures(state_dir: Path, block: str) -> list:
    path = state_dir / "open_failures.json"
    if not path.exists():
        return []
    data = read_json(path)
    return data.get(block) or data.get(block_state_key(block)) or data.get("failures") or []


def baseline_validation(baseline_path: str | None) -> dict:
    if not baseline_path:
        return {}
    path = Path(baseline_path) / "baseline_validation.json"
    if path.exists():
        return read_json(path)
    report = Path(baseline_path) / "baseline_freeze_report.json"
    if report.exists():
        return read_json(report)
    return {}


def next_manifest_action(block: str, baseline: dict, status: dict, batch_size: int) -> dict:
    control_count = int(baseline.get("control_count") or status.get("latest_control_count") or 0)
    current_batch = int(baseline.get("batch") or status.get("latest_batch") or 0)
    new_count = batch_size
    target_total = control_count + new_count
    return {
        "action": "create_next_manifest",
        "phase": "manifest",
        "block": block,
        "current_batch": current_batch,
        "next_batch_index": current_batch + 1,
        "control_role": f"control_{control_count}",
        "new_role": f"new_{new_count}",
        "target_total_count": target_total,
        "target_batch_label": f"batch {target_total}",
        "suggested_output_dir": f"generated/{block}-batch-{target_total:03d}",
        "reason": "latest PASS frozen baseline exists and no open failures remain",
    }


def render_goal(action: dict) -> str:
    if action.get("action") == "create_next_manifest":
        return (
            f"Goal: Create {action['block']} {action['target_batch_label']} manifest only.\\n\\n"
            "Use career-content-asset-factory.\\n\\n"
            f"Input: latest frozen baseline with {action['control_role']} and canonical 1046 seed.\\n"
            f"Task: create manifest using {action['control_role']} + {action['new_role']}.\\n"
            "Do not generate evidence, synthesis, assets, search_projection, staging, import, runtime, SEO, or CMS changes.\\n"
        )
    return f"Goal: {action.get('action', 'stop')} for {action.get('block', 'career content')}."


def build_report(state_dir: Path, block: str, dry_run: bool, batch_size: int, max_repair_loops: int) -> dict:
    failures = open_failures(state_dir, block)
    baseline = latest_baseline(state_dir, block)
    status = block_status(state_dir, block)
    validation = baseline_validation(baseline.get("baseline_path") if baseline else None)

    if failures:
        action = {
            "action": "repair_failed_rows",
            "phase": "repair",
            "block": block,
            "reason": "open failures exist",
            "failure_count": len(failures),
        }
        hard_stop = False
        requires_human_approval = False
    elif not baseline:
        action = {
            "action": "stop_for_human_approval",
            "phase": "blocked",
            "block": block,
            "reason": "missing latest PASS baseline",
        }
        hard_stop = True
        requires_human_approval = True
    elif validation and validation.get("final_conclusion") not in {None, "BATCH_001_BASELINE_FROZEN"} and "FROZEN" not in str(validation.get("final_conclusion")):
        action = {
            "action": "stop_for_human_approval",
            "phase": "blocked",
            "block": block,
            "reason": "latest baseline validation is not frozen PASS",
            "baseline_final_conclusion": validation.get("final_conclusion"),
        }
        hard_stop = True
        requires_human_approval = True
    else:
        action = next_manifest_action(block, baseline, status, batch_size)
        hard_stop = False
        requires_human_approval = False

    return {
        "operator_mode": True,
        "dry_run": dry_run,
        "state_dir": str(state_dir),
        "block": block,
        "max_repair_loops": max_repair_loops,
        "latest_pass_baseline": baseline,
        "baseline_validation": validation,
        "open_failure_count": len(failures),
        "next_action": action,
        "requires_human_approval": requires_human_approval,
        "hard_stop": hard_stop,
        "execution_performed": False,
        "content_generated": False,
        "evidence_generated": False,
        "synthesis_generated": False,
        "asset_generated": False,
        "search_projection_generated": False,
        "runtime_modified": False,
        "seo_modified": False,
        "cms_modified": False,
        "staging_created": False,
        "production_imported": False,
        "next_goal": render_goal(action),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Plan the next safe career content operator action.")
    parser.add_argument("--state-dir", default="generated/fermatmind-content-agent-state")
    parser.add_argument("--block", required=True)
    parser.add_argument("--batch-size", type=int, default=50)
    parser.add_argument("--max-repair-loops", type=int, default=2)
    parser.add_argument("--dry-run", action="store_true", default=False)
    parser.add_argument("--output")
    args = parser.parse_args()

    report = build_report(Path(args.state_dir), args.block, args.dry_run, args.batch_size, args.max_repair_loops)
    if args.output:
        out = Path(args.output)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if not report["hard_stop"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
