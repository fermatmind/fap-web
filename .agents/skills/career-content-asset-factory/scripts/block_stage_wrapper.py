#!/usr/bin/env python3
"""Infer block and stage from a block skill wrapper script path."""

from __future__ import annotations

import runpy
import sys
from pathlib import Path


def main() -> int:
    invoked = Path(sys.argv[0]).absolute()
    skill_dir = invoked.parents[1]
    block = skill_dir.name.removesuffix("-asset-factory")
    stage = invoked.stem
    shared = skill_dir.parent / "career-content-asset-factory" / "scripts" / "block_stage.py"

    sys.argv = [str(shared), "--block", block, "--stage", stage, *sys.argv[1:]]
    runpy.run_path(str(shared), run_name="__main__")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
