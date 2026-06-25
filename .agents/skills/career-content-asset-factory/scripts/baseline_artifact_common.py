#!/usr/bin/env python3
"""Shared helpers for career content baseline artifact registry scripts."""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import shutil
import tarfile
from pathlib import Path
from urllib.parse import urlparse


STATE_FILE = Path("generated/fermatmind-content-agent-state/latest_pass_baselines.json")
ARTIFACT_ROOT_ENV = "CAREER_CONTENT_ARTIFACT_ROOT"
CAREER_ARTIFACT_SCHEME = "career-artifact"
CAREER_ARTIFACT_NAMESPACE = "career-content-baselines"

JSONL_KINDS = {
    "evidence": ("evidence",),
    "synthesis": ("synthesis",),
    "assets": ("asset", "assets", "page_assembly"),
}


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


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


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
    if parsed.scheme == CAREER_ARTIFACT_SCHEME:
        return "server_path"
    if parsed.scheme in {"s3", "oss", "gs"}:
        return "object_storage"
    if "github" in parsed.netloc:
        return "github_actions_artifact"
    if parsed.scheme in {"http", "https"}:
        return "release_asset"
    return "unknown"


def career_artifact_uri(block_name: str, artifact_sha: str) -> str:
    return f"{CAREER_ARTIFACT_SCHEME}://{CAREER_ARTIFACT_NAMESPACE}/{block_name}/{artifact_sha}/baseline.tar.gz"


def artifact_path_from_uri(uri: str, artifact_root: str | Path | None) -> Path | None:
    parsed = urlparse(uri)
    if parsed.scheme in {"", "file"}:
        return local_path_from_uri(uri)
    if parsed.scheme != CAREER_ARTIFACT_SCHEME:
        return None
    if parsed.netloc != CAREER_ARTIFACT_NAMESPACE:
        return None
    if not artifact_root:
        return None
    relative = parsed.path.lstrip("/")
    return Path(artifact_root) / parsed.netloc / relative


def iter_manifest_entries(manifest_payload: dict) -> dict[str, str]:
    if "files" in manifest_payload and isinstance(manifest_payload["files"], list):
        entries: dict[str, str] = {}
        for row in manifest_payload["files"]:
            if isinstance(row, dict) and row.get("path") and row.get("sha256"):
                entries[str(row["path"])] = str(row["sha256"])
        return entries
    return {
        str(path): str(digest)
        for path, digest in manifest_payload.items()
        if isinstance(path, str) and isinstance(digest, str)
    }


def verify_sha_manifest(baseline_dir: str | Path, sha_manifest: str | Path) -> dict:
    baseline = Path(baseline_dir)
    manifest = Path(sha_manifest)
    if not baseline.is_dir():
        return {"ok": False, "reason": "baseline_directory_missing", "checked_files": 0, "failures": []}
    if not manifest.is_file():
        return {"ok": False, "reason": "sha_manifest_missing", "checked_files": 0, "failures": []}

    entries = iter_manifest_entries(read_json(manifest))
    failures = []
    checked = 0
    for relative, expected_sha in sorted(entries.items()):
        relative_path = Path(relative)
        if relative_path.is_absolute():
            try:
                relative_path = relative_path.relative_to(baseline.resolve())
            except ValueError:
                pass
        else:
            baseline_parts = baseline.as_posix().rstrip("/")
            relative_posix = relative_path.as_posix()
            if relative_posix.startswith(baseline_parts + "/"):
                relative_path = Path(relative_posix[len(baseline_parts) + 1 :])
            elif baseline.name in relative_path.parts:
                parts = relative_path.parts
                start = parts.index(baseline.name) + 1
                relative_path = Path(*parts[start:])
        candidate = baseline / relative_path
        if not candidate.is_file():
            failures.append({"path": relative, "reason": "missing_file"})
            continue
        actual = sha256_file(candidate)
        checked += 1
        if actual != expected_sha:
            failures.append({"path": relative, "reason": "sha_mismatch", "expected": expected_sha, "actual": actual})
    return {"ok": not failures, "reason": "pass" if not failures else "sha_manifest_mismatch", "checked_files": checked, "failures": failures}


def classify_jsonl_kind(path: Path) -> str | None:
    name = path.name.lower()
    if "search_projection" in name:
        return None
    if name.endswith(".jsonl"):
        for kind, markers in JSONL_KINDS.items():
            if any(marker in name for marker in markers):
                return kind
    return None


def scan_jsonl_file(path: Path) -> dict:
    rows = 0
    slugs: set[str] = set()
    locales: dict[str, int] = {}
    malformed_rows = 0
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        rows += 1
        try:
            payload = json.loads(line)
        except json.JSONDecodeError:
            malformed_rows += 1
            continue
        slug = payload.get("slug")
        if isinstance(slug, str) and slug:
            slugs.add(slug)
        locale = payload.get("locale")
        if isinstance(locale, str) and locale:
            locales[locale] = locales.get(locale, 0) + 1
    return {
        "path": str(path),
        "rows": rows,
        "unique_slugs": len(slugs),
        "locales": locales,
        "malformed_rows": malformed_rows,
    }


def baseline_content_profile(baseline_dir: str | Path) -> dict:
    baseline = Path(baseline_dir)
    files: dict[str, list[dict]] = {kind: [] for kind in JSONL_KINDS}
    files["other_jsonl"] = []
    search_projection_files = []
    if not baseline.is_dir():
        return {
            "baseline_exists": False,
            "jsonl_files": files,
            "search_projection_files": search_projection_files,
            "slug_count_max": 0,
            "locale_counts_max": {},
            "malformed_rows": 0,
        }

    for path in sorted(baseline.rglob("*.jsonl")):
        relative_path = path.relative_to(baseline)
        if "search_projection" in str(relative_path).lower():
            search_projection_files.append(str(relative_path))
            continue
        scan = scan_jsonl_file(path)
        scan["path"] = str(relative_path)
        kind = classify_jsonl_kind(path) or "other_jsonl"
        files.setdefault(kind, []).append(scan)

    slug_count_max = 0
    locale_counts_max: dict[str, int] = {}
    malformed_rows = 0
    for rows in files.values():
        for scan in rows:
            slug_count_max = max(slug_count_max, int(scan["unique_slugs"]))
            malformed_rows += int(scan["malformed_rows"])
            for locale, count in scan["locales"].items():
                locale_counts_max[locale] = max(locale_counts_max.get(locale, 0), int(count))

    return {
        "baseline_exists": True,
        "jsonl_files": files,
        "search_projection_files": search_projection_files,
        "slug_count_max": slug_count_max,
        "locale_counts_max": locale_counts_max,
        "malformed_rows": malformed_rows,
    }


def validate_baseline_directory(
    baseline_dir: str | Path,
    sha_manifest: str | Path | None = None,
    *,
    expected_slugs: int | None = None,
    require_no_search_projection: bool = True,
) -> dict:
    baseline = Path(baseline_dir)
    profile = baseline_content_profile(baseline)
    manifest_result = {"ok": True, "reason": "not_requested", "checked_files": 0, "failures": []}
    if sha_manifest:
        manifest_result = verify_sha_manifest(baseline, sha_manifest)

    failures = []
    if not profile["baseline_exists"]:
        failures.append("baseline_directory_missing")
    if expected_slugs is not None and profile["slug_count_max"] not in {0, expected_slugs}:
        failures.append("slug_count_mismatch")
    if require_no_search_projection and profile["search_projection_files"]:
        failures.append("search_projection_present")
    if profile["malformed_rows"]:
        failures.append("malformed_jsonl_rows")
    if not manifest_result["ok"]:
        failures.append(manifest_result["reason"])

    return {
        "ok": not failures,
        "failures": failures,
        "baseline_directory": str(baseline),
        "content_profile": profile,
        "sha_manifest_result": manifest_result,
    }


def create_deterministic_tar(source_dir: str | Path, tar_path: str | Path) -> None:
    source = Path(source_dir)
    target = Path(tar_path)
    target.parent.mkdir(parents=True, exist_ok=True)

    def reset_info(info: tarfile.TarInfo) -> tarfile.TarInfo:
        info.uid = 0
        info.gid = 0
        info.uname = ""
        info.gname = ""
        info.mtime = 0
        return info

    with tarfile.open(target, "w:gz", format=tarfile.PAX_FORMAT) as tar:
        for path in sorted(source.rglob("*")):
            arcname = Path(source.name) / path.relative_to(source)
            tar.add(path, arcname=str(arcname), filter=reset_info)


def safe_extract_tar(tar_path: str | Path, destination_root: str | Path, *, overwrite: bool = False) -> Path:
    target_root = Path(destination_root)
    target_root.mkdir(parents=True, exist_ok=True)
    with tarfile.open(tar_path, "r:gz") as tar:
        members = tar.getmembers()
        if not members:
            raise ValueError("artifact tar is empty")
        top_names = {Path(member.name).parts[0] for member in members if member.name and Path(member.name).parts}
        if len(top_names) != 1:
            raise ValueError("artifact tar must contain exactly one top-level baseline directory")
        top_name = next(iter(top_names))
        destination = target_root / top_name
        root_resolved = target_root.resolve()
        for member in members:
            member_path = (target_root / member.name).resolve()
            if root_resolved not in {member_path, *member_path.parents}:
                raise ValueError(f"unsafe tar member path: {member.name}")
        if destination.exists():
            if not overwrite:
                raise FileExistsError(f"destination exists: {destination}")
            shutil.rmtree(destination)
        tar.extractall(target_root)
    return destination


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
        block_name = str(row.get("block_name") or "")
        package_sha = row.get("package_sha256") or row.get("artifact_sha256")
        candidates = [
            root / baseline_dir.name,
            root / block_name / baseline_dir.name,
            root / block_name,
        ]
        if block_name and package_sha:
            candidates.insert(0, root / CAREER_ARTIFACT_NAMESPACE / block_name / str(package_sha) / "baseline.tar.gz")
        for candidate in candidates:
            if candidate.is_dir():
                return file_uri(candidate)
            if candidate.is_file() and candidate.name == "baseline.tar.gz":
                return career_artifact_uri(block_name, str(package_sha)) if package_sha else file_uri(candidate)
        if block_name:
            package_candidates = sorted((root / CAREER_ARTIFACT_NAMESPACE / block_name).glob("*/baseline.tar.gz"))
            if package_candidates:
                package_sha = package_candidates[-1].parent.name
                return career_artifact_uri(block_name, package_sha)
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
        "package_sha256": row.get("package_sha256") or row.get("artifact_sha256"),
        "restorable": restorable,
        "status": status,
        "final_conclusion": str(row.get("final_conclusion") or ""),
        "created_at": row.get("created_at"),
        "source_run_id": row.get("source_run_id"),
        "created_by_run_id": row.get("created_by_run_id"),
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
