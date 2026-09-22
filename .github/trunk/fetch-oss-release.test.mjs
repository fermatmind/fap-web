import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import test from "node:test";

const script = path.resolve(".github/trunk/fetch-oss-release.sh");
const sha = "a".repeat(40);

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function fixture({ corrupt = false, fail = false } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), "fetch-oss-release-"));
  const bin = path.join(root, "bin");
  const incoming = path.join(root, "incoming");
  mkdirSync(bin);
  mkdirSync(incoming);
  const archiveBytes = Buffer.from("expected immutable release archive\n");
  const source = path.join(root, "source.tar.gz");
  writeFileSync(source, corrupt ? "corrupt archive\n" : archiveBytes);
  const mock = path.join(bin, "ossutil");
  writeFileSync(mock, `#!/usr/bin/env bash\nset -euo pipefail\n${fail ? "exit 42" : 'cp "$MOCK_OSS_SOURCE" "${10}"'}\n`);
  chmodSync(mock, 0o755);
  const curlMock = path.join(bin, "curl");
  writeFileSync(
    curlMock,
    `#!/usr/bin/env bash\nset -euo pipefail\nif [[ "$*" == *'/latest/api/token'* ]]; then printf 'test-token'; else printf '%s' "$OSS_ECS_ROLE_NAME"; fi\n`,
  );
  chmodSync(curlMock, 0o755);
  const archive = path.join(incoming, `fap-web-${sha}.tar.gz`);
  const outcome = path.join(incoming, "deploy-outcome.json");
  const duration = path.join(incoming, "transport-seconds");
  const env = {
    ...process.env,
    PATH: `${bin}:${process.env.PATH}`,
    OSS_BUCKET: "fermatmind-release-test",
    OSS_INTERNAL_ENDPOINT: "https://oss-cn-hangzhou-internal.aliyuncs.com",
    OSS_REGION: "cn-hangzhou",
    OSS_OBJECT_KEY: `fap-web/releases/${sha}/staging/fap-web-${sha}.tar.gz`,
    OSS_ECS_ROLE_NAME: "FermatMindReleaseReadRole",
    DEPLOY_SHA: sha,
    RELEASE_ARCHIVE: archive,
    RELEASE_ARCHIVE_SHA256: digest(archiveBytes),
    DEPLOY_OUTCOME_PATH: outcome,
    TRANSPORT_DURATION_FILE: duration,
    MOCK_OSS_SOURCE: source,
  };
  return { root, archive, outcome, duration, env };
}

function run(item) {
  return spawnSync("bash", [script], { env: item.env, encoding: "utf8" });
}

test("downloads and verifies an OSS release before exposing the archive", () => {
  const item = fixture();
  try {
    const result = run(item);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(digest(readFileSync(item.archive)), item.env.RELEASE_ARCHIVE_SHA256);
    assert.equal(existsSync(`${item.archive}.part`), false);
    assert.match(readFileSync(item.duration, "utf8"), /^\d+\n$/);
    assert.equal(existsSync(item.outcome), false);
  } finally {
    rmSync(item.root, { recursive: true, force: true });
  }
});

test("checksum failure records transport failure and preserves resumable bytes", () => {
  const item = fixture({ corrupt: true });
  try {
    const result = run(item);
    assert.notEqual(result.status, 0);
    assert.equal(existsSync(item.archive), false);
    assert.equal(existsSync(`${item.archive}.part`), true);
    const outcome = JSON.parse(readFileSync(item.outcome, "utf8"));
    assert.equal(outcome.revision, sha);
    assert.equal(outcome.status, "failed");
    assert.equal(outcome.phase, "transport");
    assert.equal(outcome.transport_source, "oss");
    assert.equal(outcome.archive_sha256, item.env.RELEASE_ARCHIVE_SHA256);
  } finally {
    rmSync(item.root, { recursive: true, force: true });
  }
});

test("download failure records transport failure without an activation archive", () => {
  const item = fixture({ fail: true });
  try {
    const result = run(item);
    assert.equal(result.status, 42);
    assert.equal(existsSync(item.archive), false);
    const outcome = JSON.parse(readFileSync(item.outcome, "utf8"));
    assert.equal(outcome.phase, "transport");
    assert.equal(outcome.exit_code, 42);
  } finally {
    rmSync(item.root, { recursive: true, force: true });
  }
});
