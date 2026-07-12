import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { performance } from "node:perf_hooks";
import { resolveApprovedPerformanceTarget } from "./public-performance-target-policy.mjs";

const args = new Set(process.argv.slice(2));
const valueAfter = (flag, fallback) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : fallback;
};
const configPath = path.resolve(valueAfter("--config", "scripts/performance/public-performance-targets.json"));
const outputPath = path.resolve(valueAfter("--output", "generated/performance/public-performance-audit.json"));
const enforce = args.has("--enforce");
const config = JSON.parse(await fs.readFile(configPath, "utf8"));

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function publicCacheable(value) {
  return /(?:^|,)\s*public\b/i.test(value) && !/(?:^|,)\s*(?:private|no-store)\b/i.test(value);
}

async function sample(target) {
  const requestUrl = resolveApprovedPerformanceTarget(target);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeout_ms);
  const started = performance.now();
  try {
    const response = await fetch(requestUrl, {
      method: "GET",
      headers: { accept: target.kind === "api" ? "application/json" : "text/html", "user-agent": "FermatMind-ReadOnly-Performance-Audit/1.0" },
      redirect: "follow",
      signal: controller.signal,
    });
    const body = await response.arrayBuffer();
    return {
      ok: response.ok,
      status: response.status,
      duration_ms: Math.round((performance.now() - started) * 10) / 10,
      bytes: body.byteLength,
      cache_control: response.headers.get("cache-control") ?? "",
      etag: response.headers.get("etag") ?? "",
      age: response.headers.get("age") ?? "",
      framework_cache: response.headers.get("x-nextjs-cache") ?? response.headers.get("x-vercel-cache") ?? "",
      error: null,
    };
  } catch (error) {
    return { ok: false, status: 0, duration_ms: Math.round((performance.now() - started) * 10) / 10, bytes: 0, cache_control: "", etag: "", age: "", framework_cache: "", error: error instanceof Error ? error.name : "request_failed" };
  } finally {
    clearTimeout(timer);
  }
}

const results = [];
for (const target of config.targets) {
  const samples = [];
  for (let index = 0; index < config.samples; index += 1) samples.push(await sample(target));
  const durations = samples.map((item) => item.duration_ms);
  const representative = samples.at(-1);
  const failures = [];
  if (samples.some((item) => !item.ok)) failures.push("http_or_timeout");
  if (median(durations) > target.budget_ms) failures.push("latency_budget");
  if (target.expect_public_cache && !publicCacheable(representative.cache_control)) failures.push("public_cache_header");
  results.push({ ...target, median_ms: Math.round(median(durations) * 10) / 10, worst_ms: Math.max(...durations), bytes: representative.bytes, cache_control: representative.cache_control, etag: representative.etag, age: representative.age, framework_cache: representative.framework_cache, failures, samples });
}

const slowest = (kind) => results.filter((item) => item.kind === kind).sort((a, b) => b.median_ms - a.median_ms).slice(0, config.top_n).map(({ id, median_ms, worst_ms, bytes, failures }) => ({ id, median_ms, worst_ms, bytes, failures }));
const report = {
  schema_version: 1,
  evidence_class: "A-production-read-only",
  generated_at: new Date().toISOString(),
  config: { samples: config.samples, timeout_ms: config.timeout_ms, top_n: config.top_n },
  summary: { target_count: results.length, failing_target_count: results.filter((item) => item.failures.length).length, slow_pages_top_n: slowest("page"), slow_apis_top_n: slowest("api") },
  results,
};
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary, null, 2));
console.log(`wrote ${outputPath}`);
if (enforce && report.summary.failing_target_count > 0) process.exitCode = 1;
