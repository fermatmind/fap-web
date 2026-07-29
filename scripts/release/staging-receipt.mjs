#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";

const SCHEMA = "fermatmind.web.staging-receipt.v1";
const SHA_PATTERN = /^[0-9a-f]{40}$/;
const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/;
const POSITIVE_INTEGER_PATTERN = /^[1-9][0-9]*$/;
const EXPECTED_KEYS = [
  "artifact_digest",
  "ci_run_attempt",
  "ci_run_id",
  "deploy_run_attempt",
  "deploy_run_id",
  "environment",
  "release_manifest_digest",
  "result",
  "schema",
  "source_sha",
].sort();

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const [command, ...tokens] = argv;
  const options = {};
  for (const token of tokens) {
    const separator = token.indexOf("=");
    if (!token.startsWith("--") || separator < 3) {
      fail(`unexpected argument: ${token}`);
    }
    options[token.slice(2, separator)] = token.slice(separator + 1);
  }
  return { command, options };
}

function requireOption(options, name) {
  const value = options[name];
  if (typeof value !== "string" || value.length === 0) {
    fail(`missing required option: --${name}=...`);
  }
  return value;
}

function readReceipt(receiptPath) {
  try {
    return JSON.parse(readFileSync(path.resolve(receiptPath), "utf8"));
  } catch (error) {
    fail(`staging receipt is not valid JSON: ${error.message}`);
  }
}

function verifyReceipt(options) {
  const receipt = readReceipt(requireOption(options, "receipt"));
  const expectedSha = requireOption(options, "expected-sha");
  const expectedRunId = requireOption(options, "expected-staging-run-id");
  const expectedRunAttempt = requireOption(options, "expected-staging-run-attempt");

  if (
    !receipt ||
    typeof receipt !== "object" ||
    Array.isArray(receipt) ||
    JSON.stringify(Object.keys(receipt).sort()) !== JSON.stringify(EXPECTED_KEYS)
  ) {
    fail("staging receipt fields do not match the supported fail-closed schema");
  }
  if (!SHA_PATTERN.test(expectedSha) || receipt.source_sha !== expectedSha) {
    fail("staging receipt source SHA does not match the requested exact SHA");
  }
  if (
    !POSITIVE_INTEGER_PATTERN.test(expectedRunId) ||
    !POSITIVE_INTEGER_PATTERN.test(expectedRunAttempt) ||
    receipt.deploy_run_id !== expectedRunId ||
    receipt.deploy_run_attempt !== expectedRunAttempt
  ) {
    fail("staging receipt deploy run identity does not match the successful staging workflow");
  }
  if (receipt.schema !== SCHEMA || receipt.environment !== "staging" || receipt.result !== "success") {
    fail("staging receipt is not a supported staging success receipt");
  }
  if (!DIGEST_PATTERN.test(receipt.artifact_digest)) {
    fail("staging receipt artifact digest is missing or malformed");
  }
  if (!DIGEST_PATTERN.test(receipt.release_manifest_digest)) {
    fail("staging receipt release manifest digest is missing or malformed");
  }
  if (
    !POSITIVE_INTEGER_PATTERN.test(receipt.ci_run_id) ||
    !POSITIVE_INTEGER_PATTERN.test(receipt.ci_run_attempt)
  ) {
    fail("staging receipt CI run identity is missing or malformed");
  }

  process.stdout.write(`${JSON.stringify(receipt)}\n`);
}

try {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (command !== "verify") {
    fail("usage: staging-receipt.mjs verify --receipt=... --expected-sha=... --expected-staging-run-id=... --expected-staging-run-attempt=...");
  }
  verifyReceipt(options);
} catch (error) {
  console.error(`staging receipt error: ${error.message}`);
  process.exit(1);
}
