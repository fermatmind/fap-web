#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const SHA = /^[0-9a-f]{40}$/;
const DIGEST = /^sha256:[0-9a-f]{64}$/;
const HEX_DIGEST = /^[0-9a-f]{64}$/;
const SAFE_NAME = /^[A-Za-z0-9._/-]+$/;

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const values = {};
  for (const argument of argv) {
    if (!argument.startsWith("--") || !argument.includes("=")) fail(`Invalid argument: ${argument}`);
    const [name, ...rest] = argument.slice(2).split("=");
    values[name] = rest.join("=");
  }
  return values;
}

function requireValue(values, name) {
  const value = values[name];
  if (!value) fail(`Missing --${name}`);
  return value;
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function manifestDigest(archive, sha) {
  const body = execFileSync("tar", ["-xOzf", archive, `fap-web-${sha}/RELEASE_MANIFEST.json`], {
    encoding: null,
    maxBuffer: 16 * 1024 * 1024,
  });
  return `sha256:${createHash("sha256").update(body).digest("hex")}`;
}

function cleanPrefix(value) {
  const prefix = value.replace(/^\/+|\/+$/g, "");
  if (!prefix || !SAFE_NAME.test(prefix) || prefix.includes("..") || prefix.includes("//")) {
    fail("Invalid OSS prefix");
  }
  return prefix;
}

function buildObject({ variant, archive, sha, prefix, artifactDigest }) {
  if (!DIGEST.test(artifactDigest)) fail(`Invalid ${variant} artifact digest`);
  const archiveSha256 = sha256(archive);
  const bytes = statSync(archive).size;
  if (!Number.isSafeInteger(bytes) || bytes <= 0) fail(`Invalid ${variant} archive size`);
  return {
    variant,
    object_key: `${prefix}/${sha}/${variant}/fap-web-${sha}.tar.gz`,
    archive_sha256: archiveSha256,
    release_manifest_digest: manifestDigest(archive, sha),
    github_artifact_digest: artifactDigest,
    bytes,
  };
}

export function createReceipt(values) {
  const sha = requireValue(values, "sha");
  const ciRunId = requireValue(values, "ci-run-id");
  const ciRunAttempt = requireValue(values, "ci-run-attempt");
  if (!SHA.test(sha)) fail("Invalid release SHA");
  if (!/^[1-9][0-9]*$/.test(ciRunId) || ciRunAttempt !== "1") fail("Invalid CI run identity");
  const prefix = cleanPrefix(requireValue(values, "prefix"));
  return {
    schema_version: "fermatmind.release-transport.v1",
    sha,
    ci_run_id: ciRunId,
    ci_run_attempt: 1,
    prefix,
    objects: {
      staging: buildObject({
        variant: "staging",
        archive: requireValue(values, "staging-archive"),
        sha,
        prefix,
        artifactDigest: requireValue(values, "staging-artifact-digest"),
      }),
      production: buildObject({
        variant: "production",
        archive: requireValue(values, "production-archive"),
        sha,
        prefix,
        artifactDigest: requireValue(values, "production-artifact-digest"),
      }),
    },
  };
}

export function validateReceipt(receipt, expected = {}) {
  if (!receipt || receipt.schema_version !== "fermatmind.release-transport.v1") fail("Invalid transport schema");
  if (!SHA.test(receipt.sha)) fail("Invalid transport SHA");
  if (!/^[1-9][0-9]*$/.test(String(receipt.ci_run_id)) || receipt.ci_run_attempt !== 1) fail("Invalid transport CI identity");
  if (expected.sha && receipt.sha !== expected.sha) fail("Transport SHA mismatch");
  if (expected.ciRunId && String(receipt.ci_run_id) !== String(expected.ciRunId)) fail("Transport CI run mismatch");
  const prefix = cleanPrefix(receipt.prefix);
  if (expected.prefix && prefix !== cleanPrefix(expected.prefix)) fail("Transport prefix mismatch");
  for (const variant of ["staging", "production"]) {
    const item = receipt.objects?.[variant];
    if (!item || item.variant !== variant) fail(`Missing ${variant} transport object`);
    const expectedKey = `${prefix}/${receipt.sha}/${variant}/fap-web-${receipt.sha}.tar.gz`;
    if (item.object_key !== expectedKey || !SAFE_NAME.test(item.object_key) || item.object_key.includes("..")) {
      fail(`Invalid ${variant} object key`);
    }
    if (!HEX_DIGEST.test(item.archive_sha256)) fail(`Invalid ${variant} archive digest`);
    if (!DIGEST.test(item.release_manifest_digest) || !DIGEST.test(item.github_artifact_digest)) {
      fail(`Invalid ${variant} bound digest`);
    }
    if (!Number.isSafeInteger(item.bytes) || item.bytes <= 0) fail(`Invalid ${variant} object size`);
    if (expected[`${variant}ArtifactDigest`] && item.github_artifact_digest !== expected[`${variant}ArtifactDigest`]) {
      fail(`${variant} GitHub artifact digest mismatch`);
    }
  }
  return receipt;
}

function writeOutputs(receipt, outputPath) {
  const lines = [];
  for (const variant of ["staging", "production"]) {
    const item = receipt.objects[variant];
    const prefix = variant === "production" ? "release" : "staging_release";
    lines.push(`${prefix}_object_key=${item.object_key}`);
    lines.push(`${prefix}_archive_sha256=${item.archive_sha256}`);
    lines.push(`${prefix}_manifest_digest=${item.release_manifest_digest}`);
    lines.push(`${prefix}_bytes=${item.bytes}`);
    lines.push(`${prefix}_artifact_digest=${item.github_artifact_digest}`);
  }
  writeFileSync(outputPath, `${lines.join("\n")}\n`, { flag: "a" });
}

function cli() {
  const [command, ...argv] = process.argv.slice(2);
  const values = parseArgs(argv);
  if (command === "create") {
    const receipt = createReceipt(values);
    writeFileSync(requireValue(values, "output"), `${JSON.stringify(receipt, null, 2)}\n`);
    return;
  }
  if (command === "verify") {
    const receipt = validateReceipt(JSON.parse(readFileSync(requireValue(values, "receipt"), "utf8")), {
      sha: requireValue(values, "sha"),
      ciRunId: requireValue(values, "ci-run-id"),
      prefix: requireValue(values, "prefix"),
      stagingArtifactDigest: requireValue(values, "staging-artifact-digest"),
      productionArtifactDigest: requireValue(values, "production-artifact-digest"),
    });
    if (values["github-output"]) writeOutputs(receipt, values["github-output"]);
    return;
  }
  fail("Expected create or verify command");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    cli();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
