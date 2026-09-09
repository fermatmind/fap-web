#!/usr/bin/env node

import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import process from "node:process";
import { pathToFileURL } from "node:url";

const EXPECTED_CAREER_JOB_URL_COUNT = 2088;
const EXPECTED_BIG_FIVE_URL_COUNT = 104;
const EXPECTED_ENNEAGRAM_URL_COUNT = 116;
const REQUIRED_PATHS = [
  "/en/science",
  "/en/method-boundaries",
  "/zh/method-boundaries",
  "/en/item-design-notes",
  "/en/reliability-validity",
  "/en/data-privacy",
  "/en/common-misconceptions",
  "/en/tests/mbti-personality-test-16-personality-types",
  "/zh/tests/mbti-personality-test-16-personality-types",
  "/en/tests/big-five-personality-test-ocean-model",
  "/zh/tests/big-five-personality-test-ocean-model",
  "/en/tests/enneagram-personality-test-nine-types",
  "/zh/tests/enneagram-personality-test-nine-types",
  "/en/tests/holland-career-interest-test-riasec",
  "/zh/tests/holland-career-interest-test-riasec",
  "/en/tests/eq-test-emotional-intelligence-assessment",
  "/zh/tests/eq-test-emotional-intelligence-assessment",
];
const FORBIDDEN_PATH = /^\/(?:en|zh)?\/?(?:take|result|results|share|orders?|pay|payment|payments|history)(?:\/|$)/i;
const CAREER_ALIAS_PATH = /^\/(?:en|zh)\/career\/jobs\/(?:librarians-and-media-collections-specialists|preschool-teachers)$/;
const BIG_FIVE_LEGACY_PATH = /^\/(?:en|zh)\/personality\/big-five\/(?:high-|low-|emotional-stability(?:\/|$))/i;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizedUrls(text, siteUrl) {
  const siteOrigin = new URL(siteUrl).origin;
  const matches = text.match(/https?:\/\/[^\s<>)\]]+/g) ?? [];
  const urls = new Map();

  for (const match of matches) {
    const normalized = match.replace(/[.,;:!?]+$/g, "");
    const parsed = new URL(normalized);
    if (parsed.origin !== siteOrigin) {
      throw new Error("NON_CANONICAL_ORIGIN");
    }
    parsed.search = "";
    parsed.hash = "";
    urls.set(`${parsed.origin}${parsed.pathname}`, parsed);
  }

  return [...urls.values()];
}

export function validateLlmsFullArtifact({ text, mode, source, siteUrl }) {
  if (mode !== "complete" || source !== "cache" || text.includes("Mode: degraded")) {
    throw new Error("ARTIFACT_NOT_COMPLETE_CACHE");
  }

  const urls = normalizedUrls(text, siteUrl);
  if (urls.some((url) => FORBIDDEN_PATH.test(url.pathname) || BIG_FIVE_LEGACY_PATH.test(url.pathname) || CAREER_ALIAS_PATH.test(url.pathname))) {
    throw new Error("FORBIDDEN_URL_PRESENT");
  }

  for (const path of REQUIRED_PATHS) {
    if (!urls.some((url) => url.pathname === path)) {
      throw new Error("REQUIRED_URL_MISSING");
    }
  }

  const careerJobUrlCount = urls.filter((url) => /^\/(?:en|zh)\/career\/jobs\/[a-z0-9-]+$/.test(url.pathname)).length;
  const bigFiveUrlCount = urls.filter((url) => /^\/(?:en|zh)\/personality\/big-five(?:\/|$)/.test(url.pathname)).length;
  const enneagramUrlCount = urls.filter((url) => /^\/(?:en|zh)\/personality\/enneagram(?:\/|$)/.test(url.pathname)).length;

  if (careerJobUrlCount !== EXPECTED_CAREER_JOB_URL_COUNT) {
    throw new Error("CAREER_COHORT_MISMATCH");
  }
  if (bigFiveUrlCount !== EXPECTED_BIG_FIVE_URL_COUNT) {
    throw new Error("BIG_FIVE_COHORT_MISMATCH");
  }
  if (enneagramUrlCount !== EXPECTED_ENNEAGRAM_URL_COUNT) {
    throw new Error("ENNEAGRAM_COHORT_MISMATCH");
  }

  return {
    body_sha256: sha256(text),
    bytes: Buffer.byteLength(text, "utf8"),
    counts: {
      career: careerJobUrlCount,
      big_five: bigFiveUrlCount,
      enneagram: enneagramUrlCount,
    },
  };
}

function parseArgs(argv) {
  const values = new Map();
  for (const argument of argv) {
    const match = argument.match(/^--([a-z-]+)=(.+)$/);
    if (!match) throw new Error("INVALID_ARGUMENT");
    values.set(match[1], match[2]);
  }

  const url = values.get("url") ?? "";
  const siteUrl = values.get("site-url") ?? "";
  const expectedRevision = values.get("expected-revision") ?? "";
  const receiptPath = values.get("receipt") ?? "";
  const revisionUrl = values.get("revision-url") ?? `${siteUrl.replace(/\/$/, "")}/revision`;
  if (!/^https?:\/\//.test(revisionUrl)) throw new Error("INVALID_REVISION_URL");
  const timeoutMs = Number.parseInt(values.get("timeout-ms") ?? "330000", 10);
  const pollIntervalMs = Number.parseInt(values.get("poll-interval-ms") ?? "3000", 10);

  if (!/^https?:\/\//.test(url) || !/^https:\/\//.test(siteUrl)) throw new Error("INVALID_URL");
  if (!/^[0-9a-f]{40}$/.test(expectedRevision)) throw new Error("INVALID_REVISION");
  if (!receiptPath.startsWith("/")) throw new Error("INVALID_RECEIPT_PATH");
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 330000) throw new Error("INVALID_TIMEOUT");
  if (!Number.isInteger(pollIntervalMs) || pollIntervalMs < 250 || pollIntervalMs > 10000) {
    throw new Error("INVALID_POLL_INTERVAL");
  }

  return { url, siteUrl, revisionUrl, expectedRevision, receiptPath, timeoutMs, pollIntervalMs };
}

async function delay(milliseconds) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function verifyLlmsFullArtifact(options) {
  const startedAtMs = Date.now();
  const deadlineMs = startedAtMs + options.timeoutMs;
  let lastError = "ARTIFACT_NOT_READY";
  let lastProgressMs = 0;

  while (Date.now() < deadlineMs) {
    try {
      const artifactRequestTimeoutMs = Math.min(60_000, Math.max(1, deadlineMs - Date.now()));
      const response = await fetch(options.url, {
        cache: "no-store",
        signal: AbortSignal.timeout(artifactRequestTimeoutMs),
      });
      if (!response.ok) throw new Error("HTTP_STATUS_MISMATCH");
      const text = await response.text();
      const validation = validateLlmsFullArtifact({
        text,
        mode: response.headers.get("x-fermatmind-llms-full-mode") ?? "",
        source: response.headers.get("x-fermatmind-llms-full-source") ?? "",
        siteUrl: options.siteUrl,
      });
      const revisionRequestTimeoutMs = Math.min(20_000, Math.max(1, deadlineMs - Date.now()));
      const revisionResponse = await fetch(options.revisionUrl ?? `${options.siteUrl.replace(/\/$/, "")}/revision`, {
        cache: "no-store",
        signal: AbortSignal.timeout(revisionRequestTimeoutMs),
      });
      if (!revisionResponse.ok) throw new Error("REVISION_STATUS_MISMATCH");
      const revisionPayload = await revisionResponse.json();
      if (
        !revisionPayload ||
        typeof revisionPayload !== "object" ||
        Object.keys(revisionPayload).join(",") !== "revision" ||
        revisionPayload.revision !== options.expectedRevision
      ) {
        throw new Error("REVISION_MISMATCH");
      }
      const receipt = {
        schema_version: "fermatmind.llms-full-artifact-receipt.v1",
        revision: options.expectedRevision,
        mode: "complete",
        source: "cache",
        ...validation,
        duration_ms: Date.now() - startedAtMs,
        verified_at: new Date().toISOString(),
      };
      await writeFile(options.receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 });
      return receipt;
    } catch (error) {
      lastError = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name)
        ? "REQUEST_TIMEOUT"
        : error instanceof Error ? error.message : "ARTIFACT_VERIFICATION_FAILED";
    }

    if (Date.now() - lastProgressMs >= 15_000) {
      process.stderr.write(`[verify-llms-full-artifact] pending elapsed_ms=${Date.now() - startedAtMs} reason=${lastError.replace(/[^A-Z_]/g, "").slice(0, 80)}\n`);
      lastProgressMs = Date.now();
    }
    const remainingMs = deadlineMs - Date.now();
    if (remainingMs > 0) {
      await delay(Math.min(options.pollIntervalMs, remainingMs));
    }
  }

  throw new Error(lastError);
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const receipt = await verifyLlmsFullArtifact(options);
    process.stdout.write(`${JSON.stringify(receipt)}\n`);
  } catch (error) {
    process.stderr.write(`[verify-llms-full-artifact] ${error instanceof Error ? error.message : "FAILED"}\n`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
