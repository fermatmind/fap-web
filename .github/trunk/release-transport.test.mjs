import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
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
