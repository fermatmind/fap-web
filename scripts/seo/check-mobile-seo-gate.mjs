import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { shouldNoindex, shouldIncludeInSitemap } = require("../../lib/seo/indexingPolicy.cjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const GATE_PATH = path.join(ROOT, "docs/seo/generated/june-seo-p0-mobile-seo-gate.v1.json");
const DOC_PATH = path.join(ROOT, "docs/seo/june-seo-p0-mobile-seo-gate.md");

const REQUIRED_ROUTE_FAMILIES = [
  "home",
  "tests_hub",
  "test_detail",
  "article_detail",
  "topic_detail",
  "personality_detail",
  "career_job_detail",
  "career_recommendation_detail",
];

const PUBLIC_SAMPLE_DENY_RE = /\/(?:api|og|history|result|results|orders|share|payment|pay)(\/|$)|\/tests\/[^/]+\/take(\/|$)/i;
const PRIVATE_FLOW_RE = /\/(?:history|result|results|orders|share|payment|pay)(\/|$)|\/tests\/[^/]+\/take(\/|$)/i;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertArray(value, name) {
  assert(Array.isArray(value), `${name} must be an array`);
  assert(value.length > 0, `${name} must not be empty`);
}

function assertSourceTokens(routeSample) {
  assertArray(routeSample.sourceFiles, `${routeSample.family}.sourceFiles`);

  for (const source of routeSample.sourceFiles) {
    assert(typeof source.path === "string" && source.path.length > 0, `${routeSample.family} source path is missing`);
    assertArray(source.requiredTokens, `${routeSample.family}.${source.path}.requiredTokens`);

    const absoluteSource = path.join(ROOT, source.path);
    assert(fs.existsSync(absoluteSource), `${routeSample.family} source file does not exist: ${source.path}`);
    const sourceText = fs.readFileSync(absoluteSource, "utf8");

    for (const token of source.requiredTokens) {
      assert(sourceText.includes(token), `${routeSample.family} source file ${source.path} is missing token: ${token}`);
    }
  }
}

function assertCoreWebVitalsPolicy(gate) {
  const thresholds = gate.coreWebVitalsPolicy?.thresholds;

  assert(gate.coreWebVitalsPolicy?.device === "mobile", "Core Web Vitals policy must be mobile scoped");
  assert(gate.coreWebVitalsPolicy?.fieldDataRequiredForInp === true, "INP field-data requirement must be explicit");
  assert(String(gate.coreWebVitalsPolicy?.labInpProxy ?? "").toLowerCase().includes("proxy"), "INP lab proxy caveat is missing");
  assert(thresholds?.lcp?.goodMs === 2500, "LCP good threshold must be 2500 ms");
  assert(thresholds?.lcp?.needsImprovementMaxMs === 4000, "LCP needs-improvement max must be 4000 ms");
  assert(thresholds?.cls?.good === 0.1, "CLS good threshold must be 0.1");
  assert(thresholds?.cls?.needsImprovementMax === 0.25, "CLS needs-improvement max must be 0.25");
  assert(thresholds?.inp?.goodMs === 200, "INP good threshold must be 200 ms");
  assert(thresholds?.inp?.needsImprovementMaxMs === 500, "INP needs-improvement max must be 500 ms");
  assert(thresholds?.inp?.requiresFieldData === true, "INP threshold must require field data");
}

function assertRouteSamples(gate) {
  assertArray(gate.requiredRouteFamilies, "requiredRouteFamilies");
  assertArray(gate.routeSamples, "routeSamples");
  assert(gate.routeSamples.length === REQUIRED_ROUTE_FAMILIES.length, "routeSamples must cover every required family exactly once");

  const requiredFamilies = new Set(REQUIRED_ROUTE_FAMILIES);
  const declaredFamilies = new Set(gate.requiredRouteFamilies);
  const sampleFamilies = new Set(gate.routeSamples.map((sample) => sample.family));

  for (const family of REQUIRED_ROUTE_FAMILIES) {
    assert(declaredFamilies.has(family), `requiredRouteFamilies missing ${family}`);
    assert(sampleFamilies.has(family), `routeSamples missing ${family}`);
  }

  assert(sampleFamilies.size === gate.routeSamples.length, "routeSamples must not duplicate route families");

  for (const sample of gate.routeSamples) {
    assert(requiredFamilies.has(sample.family), `unexpected route sample family: ${sample.family}`);
    assert(typeof sample.path === "string" && sample.path.startsWith("/"), `${sample.family} path must be absolute`);
    assert(sample.locale === "en" || sample.locale === "zh", `${sample.family} locale must be supported`);
    assert(!PUBLIC_SAMPLE_DENY_RE.test(sample.path), `${sample.family} public sample must not be a private flow: ${sample.path}`);
    assert(String(sample.sampleAuthority ?? "").trim().length > 0, `${sample.family} sampleAuthority is required`);
    assert(String(sample.indexabilityExpected ?? "").startsWith("public_indexable"), `${sample.family} must be public indexable`);
    assertArray(sample.mobileChecks, `${sample.family}.mobileChecks`);
    assert(sample.mobileChecks.includes("mobile_render_success"), `${sample.family} must require mobile render success`);
    assert(sample.mobileChecks.includes("main_content_present"), `${sample.family} must require main content`);

    if (sample.ctaPolicy !== "not_applicable") {
      assert(sample.mobileChecks.includes("cta_visibility"), `${sample.family} must require CTA visibility`);
    }

    assert(shouldNoindex(sample.path, sample.locale) === false, `${sample.path} must not be noindex by frontend policy`);
    assertSourceTokens(sample);
  }
}

function assertPrivateFlowDenySamples(gate) {
  assertArray(gate.privateFlowIndexingDenySamples, "privateFlowIndexingDenySamples");

  for (const value of gate.privateFlowIndexingDenySamples) {
    assert(PRIVATE_FLOW_RE.test(value), `private-flow deny sample is not a protected family: ${value}`);
    const locale = String(value).startsWith("/zh") ? "zh" : "en";

    assert(shouldNoindex(value, locale) === true, `${value} must be noindex by frontend policy`);
    assert(shouldIncludeInSitemap(value) === false, `${value} must stay out of sitemap eligibility`);
  }
}

function assertRuntimeFetchPolicy(gate) {
  const policy = gate.runtimeFetchPolicy;

  assert(policy?.defaultMode === "static_only", "runtime fetch policy must default to static_only");
  assert(policy?.optionalBaseUrlEnv === "MOBILE_SEO_BASE_URL", "runtime fetch env name must be MOBILE_SEO_BASE_URL");
  assert(policy?.mustNotFetchProductionByDefault === true, "gate must not fetch production by default");
  assert(policy?.mobileUserAgentRequired === true, "runtime fetch policy must require a mobile user agent");
  assertArray(policy?.htmlAssertionsWhenRuntimeEnabled, "runtimeFetchPolicy.htmlAssertionsWhenRuntimeEnabled");
}

function assertDoc() {
  const doc = fs.readFileSync(DOC_PATH, "utf8");

  assert(doc.includes("Runtime behavior changed: no."), "doc must state no runtime behavior change");
  assert(doc.includes("INP requires field data"), "doc must state INP requires field data");
  assert(doc.includes("only a proxy"), "doc must state lab INP measurement is only a proxy");
  assert(doc.includes("pnpm seo:check-mobile"), "doc must document the static gate command");
  assert(doc.includes("MOBILE_SEO_BASE_URL"), "doc must document optional runtime mode");
  assert(doc.includes("SEO/GEO enumeration changed: no."), "doc must state SEO/GEO enumeration is unchanged");
}

function resolveRuntimeBaseUrl(options) {
  const explicit = options?.runtimeBaseUrl;
  const envValue = process.env.MOBILE_SEO_BASE_URL;
  const raw = String(explicit || envValue || "").trim();

  if (!raw) {
    return null;
  }

  const url = new URL(raw);
  const allowedHosts = new Set(["fermatmind.com", "www.fermatmind.com", "localhost", "127.0.0.1"]);
  assert(["http:", "https:"].includes(url.protocol), "runtime base URL must use http or https");
  assert(allowedHosts.has(url.hostname), `runtime base URL host is not allowed: ${url.hostname}`);
  return url.toString().replace(/\/+$/, "");
}

async function assertRuntimeFetches(gate, runtimeBaseUrl) {
  if (!runtimeBaseUrl) {
    return 0;
  }

  let checked = 0;
  const headers = {
    "user-agent":
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36 Googlebot-Compatible-Mobile",
  };

  for (const sample of gate.routeSamples) {
    const response = await fetch(`${runtimeBaseUrl}${sample.path}`, { headers, redirect: "follow" });
    assert(response.status < 400, `${sample.path} returned HTTP ${response.status}`);
    const html = await response.text();

    assert(html.length > 500, `${sample.path} returned a too-small HTML payload`);
    assert(!/<meta\s+[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html), `${sample.path} emitted noindex`);
    checked += 1;
  }

  return checked;
}

export async function validateMobileSeoGate(options = {}) {
  const gate = readJson(GATE_PATH);

  assert(gate.version === "seo.june_p0_mobile_seo_gate.v1", "unexpected gate version");
  assert(gate.scope === "PR-SEO-JUNE-04", "unexpected gate scope");
  assert(gate.trainName === "seo-june-p0-fix-train", "unexpected train name");
  assert(gate.runtimeBehaviorChanged === false, "gate must not change runtime behavior");
  assert(gate.urlSetChanged === false, "gate must not change URL set");
  assert(gate.sitemapChanged === false, "gate must not change sitemap");
  assert(gate.llmsChanged === false, "gate must not change llms exposure");
  assert(gate.publicContentChanged === false, "gate must not change public content");
  assert(gate.measurementMode === "static_contract_plus_optional_runtime_fetch", "unexpected measurement mode");
  assert(gate.mobileViewport?.width === 390, "mobile viewport width must be deterministic");
  assert(gate.mobileViewport?.height === 844, "mobile viewport height must be deterministic");

  assertCoreWebVitalsPolicy(gate);
  assertRouteSamples(gate);
  assertPrivateFlowDenySamples(gate);
  assertRuntimeFetchPolicy(gate);
  assertDoc();

  const runtimeFetches = await assertRuntimeFetches(gate, resolveRuntimeBaseUrl(options));

  return {
    version: gate.version,
    scope: gate.scope,
    routeSamples: gate.routeSamples.length,
    privateFlowDenySamples: gate.privateFlowIndexingDenySamples.length,
    runtimeFetches,
    runtimeBehaviorChanged: gate.runtimeBehaviorChanged,
    urlSetChanged: gate.urlSetChanged,
    sitemapChanged: gate.sitemapChanged,
    llmsChanged: gate.llmsChanged,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const summary = await validateMobileSeoGate();

  if (process.argv.includes("--json")) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  } else {
    process.stdout.write(
      [
        "mobile SEO gate ok",
        `routeSamples=${summary.routeSamples}`,
        `privateFlowDenySamples=${summary.privateFlowDenySamples}`,
        `runtimeFetches=${summary.runtimeFetches}`,
        `runtimeBehaviorChanged=${summary.runtimeBehaviorChanged}`,
        `urlSetChanged=${summary.urlSetChanged}`,
        `sitemapChanged=${summary.sitemapChanged}`,
        `llmsChanged=${summary.llmsChanged}`,
      ].join("\n") + "\n"
    );
  }
}
