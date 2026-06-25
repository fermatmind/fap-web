#!/usr/bin/env python3
"""Shared helpers for career content baseline artifact registry scripts."""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import shutil
from pathlib import Path
from urllib.parse import urlparse


STATE_FILE = Path("generated/fermatmind-content-agent-state/latest_pass_baselines.json")


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()


def read_json(path: str | Path) -> dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_json(path: str | Path, payload: dict) -> None:
    out = Path(path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def write_markdown(path: str | Path, body: str) -> None:
    out = Path(path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(body.rstrip() + "\n", encoding="utf-8")


def sha256_file(path: str | Path) -> str:
    h = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def safe_id(value: str) -> str:
    return "".join(ch if ch.isalnum() else "-" for ch in value.lower()).strip("-")


def file_uri(path: Path) -> str:
    return path.resolve().as_uri()


def local_path_from_uri(uri: str | None) -> Path | None:
    if not uri:
        return None
    parsed = urlparse(uri)
    if parsed.scheme == "file":
        return Path(parsed.path)
    if parsed.scheme == "":
        return Path(uri)
    return None


def artifact_type(uri: str | None) -> str:
    if not uri:
        return "missing"
    parsed = urlparse(uri)
    if parsed.scheme == "file":
        return "file_uri"
    if parsed.scheme == "":
        return "local_path"
    if parsed.scheme in {"s3", "oss", "gs"}:
        return "object_storage"
    if "github" in parsed.netloc:
        return "github_actions_artifact"
    if parsed.scheme in {"http", "https"}:
        return "release_asset"
    return "unknown"


def load_state_baselines(state_file: str | Path = STATE_FILE) -> list[dict]:
    payload = read_json(state_file)
    rows = payload.get("baselines")
    if not isinstance(rows, list):
        raise ValueError(f"{state_file} must contain a baselines array")
    return rows


def discover_artifact_uri(row: dict, artifact_root: str | Path | None = None) -> str | None:
    explicit = row.get("artifact_uri")
    if explicit:
        return explicit
    baseline_dir = Path(str(row.get("baseline_directory") or ""))
    if baseline_dir.is_dir():
        return file_uri(baseline_dir)
    if artifact_root:
        root = Path(artifact_root)
        candidates = [
            root / baseline_dir.name,
            root / str(row.get("block_name") or "") / baseline_dir.name,
            root / str(row.get("block_name") or ""),
        ]
        for candidate in candidates:
            if candidate.is_dir():
                return file_uri(candidate)
    return None


def build_registry_entry(row: dict, artifact_root: str | Path | None = None) -> dict:
    baseline_directory = str(row.get("baseline_directory") or "")
    sha_manifest = str(row.get("sha256_manifest") or "")
    baseline_path = Path(baseline_directory)
    manifest_path = Path(sha_manifest)
    local_exists = baseline_path.is_dir()
    manifest_exists = manifest_path.is_file()
    manifest_sha = sha256_file(manifest_path) if manifest_exists else None
    artifact_uri = discover_artifact_uri(row, artifact_root)
    inferred_type = artifact_type(artifact_uri)

    if local_exists and manifest_exists:
        status = "LOCAL_READY"
        restorable = True
    elif local_exists and not manifest_exists:
        status = "SHA_MANIFEST_MISSING"
        restorable = False
    elif artifact_uri:
        status = "RESTORABLE_FROM_ARTIFACT"
        restorable = True
    else:
        status = "MISSING_LOCAL_NO_RESTORABLE_ARTIFACT"
        restorable = False

    block_name = str(row.get("block_name") or "unknown")
    block_version = str(row.get("block_version") or "unknown")
    return {
        "registry_entry_id": row.get("artifact_registry_entry_id") or f"{safe_id(block_name)}-{safe_id(block_version)}",
        "block_name": block_name,
        "block_version": block_version,
        "slug_count": int(row.get("slug_count") or 0),
        "baseline_directory": baseline_directory,
        "local_baseline_exists": local_exists,
        "sha256_manifest": sha_manifest,
        "sha256_manifest_exists": manifest_exists,
        "sha256_manifest_sha256": row.get("sha256_manifest_sha256") or manifest_sha,
        "artifact_uri": artifact_uri,
        "artifact_type": inferred_type,
        "restorable": restorable,
        "status": status,
        "final_conclusion": str(row.get("final_conclusion") or ""),
        "created_at": row.get("created_at"),
        "source_run_id": row.get("source_run_id"),
        "notes": [],
    }


def registry_summary(entries: list[dict]) -> dict:
    counts: dict[str, int] = {}
    for entry in entries:
        counts[entry["status"]] = counts.get(entry["status"], 0) + 1
    blocked = counts.get("MISSING_LOCAL_NO_RESTORABLE_ARTIFACT", 0) + counts.get("SHA_MANIFEST_MISSING", 0) + counts.get("SHA_MANIFEST_MISMATCH", 0)
    if blocked:
        conclusion = "BASELINE_ARTIFACT_RESTORE_BLOCKED"
    elif counts.get("RESTORABLE_FROM_ARTIFACT", 0):
        conclusion = "BASELINE_ARTIFACT_RESTORE_READY"
    else:
        conclusion = "BASELINE_ARTIFACT_REGISTRY_READY"
    return {
        "artifact_count": len(entries),
        "local_ready_count": counts.get("LOCAL_READY", 0),
        "restorable_count": counts.get("RESTORABLE_FROM_ARTIFACT", 0),
        "blocked_count": blocked,
        "missing_local_no_restorable_artifact_count": counts.get("MISSING_LOCAL_NO_RESTORABLE_ARTIFACT", 0),
        "final_conclusion": conclusion,
    }


def copy_local_artifact(entry: dict, destination_root: str | Path, *, overwrite: bool = False) -> dict:
    source = local_path_from_uri(entry.get("artifact_uri"))
    if not source or not source.is_dir():
        return {"restored": False, "reason": "artifact_uri_is_not_local_directory"}
    destination = Path(destination_root) / Path(entry["baseline_directory"]).name
    if destination.exists():
        if not overwrite:
            return {"restored": False, "reason": "destination_exists", "destination": str(destination)}
        shutil.rmtree(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(source, destination)
    return {"restored": True, "source": str(source), "destination": str(destination)}
