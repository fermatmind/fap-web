#!/usr/bin/env node

import { createHash } from "node:crypto";
import process from "node:process";

function parseArgs(argv) {
  const result = { baseUrl: "", expectedRevision: "", enforce: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];
    if (argument === "--base-url" && value) {
      result.baseUrl = value;
      index += 1;
    } else if (argument === "--expected-revision" && value) {
      result.expectedRevision = value;
      index += 1;
    } else if (argument === "--enforce") {
      result.enforce = true;
    } else {
      throw new Error(`Unsupported or incomplete argument: ${argument}`);
    }
  }

  const target = new URL(result.baseUrl);
  if (target.protocol !== "https:" || target.username || target.password || target.search || target.hash) {
    throw new Error("--base-url must be a credential-free HTTPS origin");
  }
  if (result.expectedRevision && !/^[0-9a-f]{40}$/.test(result.expectedRevision)) {
    throw new Error("--expected-revision must be a 40-character lowercase SHA");
  }
  return { ...result, baseUrl: target.origin };
}

function nonceFromCsp(policy) {
  return String(policy || "").match(/'nonce-([^']+)'/)?.[1] || "";
}

function nonceFingerprint(nonce) {
  return nonce ? createHash("sha256").update(nonce).digest("hex") : "";
}

async function read(url, options = {}) {
  return fetch(url, {
    cache: "no-store",
    redirect: options.redirect ?? "follow",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });
}

function htmlSnapshot(response) {
  const cacheControl = response.headers.get("cache-control") || "";
  const proxyCache = response.headers.get("x-proxy-cache") || "";
  const csp = response.headers.get("content-security-policy")
    || response.headers.get("content-security-policy-report-only")
    || "";
  const nonce = nonceFromCsp(csp);
  return {
    status: response.status,
    cache_control: cacheControl,
    proxy_cache: proxyCache,
    nonce_present: Boolean(nonce),
    nonce_fingerprint: nonceFingerprint(nonce),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const failures = [];
  const firstResponse = await read(`${args.baseUrl}/`);
  const first = htmlSnapshot(firstResponse);
  const firstBody = await firstResponse.text();
  const secondResponse = await read(`${args.baseUrl}/`);
  const second = htmlSnapshot(secondResponse);
  await secondResponse.arrayBuffer();

  const cacheControl = first.cache_control.toLowerCase();
  const proxyCache = first.proxy_cache.toLowerCase();
  const nonSharedHtml = (
    cacheControl.includes("no-store")
    && !cacheControl.includes("public")
    && !cacheControl.includes("s-maxage")
    && proxyCache !== "hit"
  );
  const independentNonces = Boolean(
    first.nonce_fingerprint
    && second.nonce_fingerprint
    && first.nonce_fingerprint !== second.nonce_fingerprint
  );

  const staticPath = firstBody.match(/(?:src|href)="(\/_next\/static\/[^"?]+)"/)?.[1] || "";
  let staticAsset = { status: 0, immutable_cache: false };
  if (staticPath) {
    const staticResponse = await read(new URL(staticPath, args.baseUrl).toString());
    const staticCache = (staticResponse.headers.get("cache-control") || "").toLowerCase();
    staticAsset = {
      status: staticResponse.status,
      immutable_cache: staticCache.includes("public") && staticCache.includes("immutable"),
    };
    await staticResponse.arrayBuffer();
  }

  const revisionResponse = await read(`${args.baseUrl}/revision`, { redirect: "manual" });
  let revision;
  try {
    const payload = await revisionResponse.json();
    revision = typeof payload?.revision === "string" && /^[0-9a-f]{40}$/.test(payload.revision)
      ? payload.revision
      : "unknown";
  } catch {
    revision = "unknown";
  }

  if (first.status !== 200 || second.status !== 200) failures.push("public HTML did not return 200 twice");
  if (!first.nonce_present || !second.nonce_present) failures.push("public HTML CSP nonce missing");
  if (!independentNonces) failures.push("independent public HTML responses reused a nonce");
  if (!nonSharedHtml) failures.push("public HTML remained share-cacheable");
  if (!staticPath || staticAsset.status !== 200 || !staticAsset.immutable_cache) {
    failures.push("Next static asset immutable cache contract failed");
  }
  if (revisionResponse.status !== 200) failures.push("revision endpoint did not return direct 200");
  if (args.expectedRevision && revision !== args.expectedRevision) failures.push("revision endpoint SHA mismatch");

  const report = {
    schema_version: "1.0",
    checked_at: new Date().toISOString(),
    expected_revision: args.expectedRevision || "not_asserted",
    observed_revision: revision,
    html_statuses: [first.status, second.status],
    html_private_no_store: cacheControl.includes("private") && cacheControl.includes("no-store"),
    html_proxy_cache_hit: proxyCache === "hit",
    non_shared_html: nonSharedHtml,
    nonce_present: first.nonce_present && second.nonce_present,
    independent_response_nonces: independentNonces,
    static_asset_status: staticAsset.status,
    static_asset_immutable_cache: staticAsset.immutable_cache,
    revision_status: revisionResponse.status,
    health_status: failures.length === 0 ? "healthy" : "unhealthy",
    failures,
  };

  process.stdout.write(`${JSON.stringify(report)}\n`);
  if (args.enforce && failures.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`web-public-ingress probe failed: ${error instanceof Error ? error.message : error}\n`);
  process.exitCode = 1;
});
