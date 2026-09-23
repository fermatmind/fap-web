import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { createReceipt, validateReceipt } from "./release-transport.mjs";

const sha = "a".repeat(40);
const artifactDigest = `sha256:${"b".repeat(64)}`;

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), "release-transport-"));
  const release = path.join(root, `fap-web-${sha}`);
  mkdirSync(release);
  writeFileSync(path.join(release, "RELEASE_MANIFEST.json"), '{"ok":true}\n');
  const archive = path.join(root, "release.tar.gz");
  execFileSync("tar", ["-czf", archive, "-C", root, `fap-web-${sha}`]);
  return { root, archive };
}

test("creates and validates an exact-SHA two-variant transport receipt", () => {
  const { root, archive } = fixture();
  try {
    const receipt = createReceipt({
      sha,
      "ci-run-id": "123",
      "ci-run-attempt": "1",
      prefix: "fap-web/releases",
      "staging-archive": archive,
      "production-archive": archive,
      "staging-artifact-digest": artifactDigest,
      "production-artifact-digest": artifactDigest,
    });
    assert.equal(receipt.objects.staging.object_key, `fap-web/releases/${sha}/staging/fap-web-${sha}.tar.gz`);
    assert.equal(receipt.objects.production.object_key, `fap-web/releases/${sha}/production/fap-web-${sha}.tar.gz`);
    assert.equal(receipt.objects.staging.archive_sha256.length, 64);
    assert.equal(validateReceipt(receipt, { sha, ciRunId: "123", prefix: "fap-web/releases" }), receipt);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("rejects drift in identity, prefix, key, and digests", () => {
  const { root, archive } = fixture();
  try {
    const base = createReceipt({
      sha,
      "ci-run-id": "123",
      "ci-run-attempt": "1",
      prefix: "fap-web/releases",
      "staging-archive": archive,
      "production-archive": archive,
      "staging-artifact-digest": artifactDigest,
      "production-artifact-digest": artifactDigest,
    });
    assert.throws(() => validateReceipt(base, { sha: "c".repeat(40), ciRunId: "123", prefix: "fap-web/releases" }), /SHA mismatch/);
    assert.throws(() => validateReceipt(base, { sha, ciRunId: "124", prefix: "fap-web/releases" }), /run mismatch/);
    assert.throws(() => validateReceipt(base, { sha, ciRunId: "123", prefix: "other" }), /prefix mismatch/);
    assert.throws(() => validateReceipt({ ...base, objects: { ...base.objects, staging: { ...base.objects.staging, object_key: "../escape" } } }), /object key/);
    assert.throws(() => validateReceipt({ ...base, objects: { ...base.objects, production: { ...base.objects.production, archive_sha256: "bad" } } }), /archive digest/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("bounded OSS publishing verifies exact objects after success or an ambiguous PUT", () => {
  const mockSource = `#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const args = process.argv.slice(2);
const operation = args[args.indexOf("api") + 1];
const key = args[args.indexOf("--key") + 1];
const variant = key.includes("/staging/") ? "staging" : "production";
const marker = path.join(process.env.MOCK_OSS_ROOT, variant);
const attempts = marker + ".puts";
const receipt = JSON.parse(fs.readFileSync(process.env.RELEASE_TRANSPORT_RECEIPT, "utf8"));
const object = receipt.objects[variant];
if (operation === "head-object") {
  if (!fs.existsSync(marker) && process.env.MOCK_OSS_MODE !== "wrong_existing") process.exit(1);
  process.stdout.write(JSON.stringify({
    ContentLength: object.bytes,
    Metadata: {
      sha256: process.env.MOCK_OSS_MODE === "wrong_existing" ? "wrong" : object.archive_sha256,
      "release-sha": receipt.sha,
      "release-variant": variant,
    },
  }));
  process.exit(0);
}
if (operation !== "put-object") process.exit(2);
const count = (fs.existsSync(attempts) ? Number(fs.readFileSync(attempts, "utf8")) : 0) + 1;
fs.writeFileSync(attempts, String(count));
if (process.env.MOCK_OSS_MODE === "transient_put" && count === 1) process.exit(124);
if (process.env.MOCK_OSS_MODE !== "missing_after_failure") fs.writeFileSync(marker, "committed");
process.exit(["ambiguous_put", "missing_after_failure"].includes(process.env.MOCK_OSS_MODE) ? 42 : 0);
`;
  for (const [mode, success] of [["normal", true], ["ambiguous_put", true], ["transient_put", true], ["wrong_existing", false], ["missing_after_failure", false]]) {
    const { root, archive } = fixture();
    try {
      const receipt = createReceipt({
        sha,
        "ci-run-id": "123",
        "ci-run-attempt": "1",
        prefix: "fap-web/releases",
        "staging-archive": archive,
        "production-archive": archive,
        "staging-artifact-digest": artifactDigest,
        "production-artifact-digest": artifactDigest,
      });
      const receiptPath = path.join(root, "receipt.json");
      writeFileSync(receiptPath, JSON.stringify(receipt));
      const bin = path.join(root, "bin");
      mkdirSync(bin);
      const mock = path.join(bin, "ossutil");
      writeFileSync(mock, mockSource);
      chmodSync(mock, 0o755);
      const result = spawnSync("bash", [".github/trunk/publish-release-transport.sh"], {
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: `${bin}:${process.env.PATH}`,
          GITHUB_SHA: sha,
          GITHUB_RUN_ID: "123",
          RUNNER_TEMP: root,
          RELEASE_TRANSPORT_RECEIPT: receiptPath,
          STAGING_RELEASE_ARCHIVE: archive,
          PRODUCTION_RELEASE_ARCHIVE: archive,
          OSS_BUCKET: "fermatmind-release-test",
          OSS_PUBLIC_ENDPOINT: "https://oss-cn-shanghai.aliyuncs.com",
          OSS_REGION: "cn-shanghai",
          OSS_PREFIX: "fap-web/releases",
          MOCK_OSS_ROOT: root,
          MOCK_OSS_MODE: mode,
        },
      });
      assert.equal(result.status === 0, success, `${mode}: ${result.stderr}`);
      if (success) assert.match(result.stdout, /oss_publish_seconds=\d+/);
      if (mode === "transient_put") {
        assert.match(result.stderr, /oss_transport_status=retry_unverified variant=staging/);
        assert.equal(Number(readFileSync(path.join(root, "staging.puts"), "utf8")), 2);
      }
      if (mode === "ambiguous_put") {
        assert.equal(Number(readFileSync(path.join(root, "staging.puts"), "utf8")), 1);
      }
      if (mode === "missing_after_failure") {
        assert.equal(Number(readFileSync(path.join(root, "staging.puts"), "utf8")), 2);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});
