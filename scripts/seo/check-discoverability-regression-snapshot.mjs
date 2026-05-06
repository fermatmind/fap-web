import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SNAPSHOT_PATH = path.join(
  ROOT,
  "tests/contracts/fixtures/discoverability-foundation/regression-snapshot.v1.json"
);

const PRIVATE_FLOW_RE = /\/(?:tests\/[^/]+\/take|result\/|orders\/|share\/)/i;
const REQUIRED_SURFACES = [
  "sitemap.xml",
  "llms.txt",
  "llms-full.txt",
  "canonical",
  "metadata",
  "JSON-LD",
  "robots/noindex",
  "hreflang",
  "Evidence Container",
  "URL truth",
  "SEO authority ownership",
];

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

function assertSourceTokens(snapshot) {
  for (const [surface, tokens] of Object.entries(snapshot.sourceTokenSnapshot ?? {})) {
    assertArray(tokens, `sourceTokenSnapshot.${surface}`);
    const relPath = snapshot.sourceFiles?.[surface];
    assert(typeof relPath === "string" && relPath.length > 0, `sourceFiles.${surface} is missing`);
    const absPath = path.join(ROOT, relPath);
    assert(fs.existsSync(absPath), `source file does not exist: ${relPath}`);
    const source = fs.readFileSync(absPath, "utf8");

    for (const token of tokens) {
      assert(source.includes(token), `${relPath} is missing snapshot token: ${token}`);
    }
  }
}

function assertNoPrivateFlowExposure(urls, name) {
  for (const value of urls) {
    assert(!PRIVATE_FLOW_RE.test(String(value)), `${name} includes protected private flow: ${value}`);
  }
}

function assertPrivateFlowProtections(snapshot) {
  assertArray(snapshot.privateFlowExposureSnapshot, "privateFlowExposureSnapshot");

  for (const entry of snapshot.privateFlowExposureSnapshot) {
    assert(PRIVATE_FLOW_RE.test(entry.path), `private flow fixture path is not protected: ${entry.path}`);
    for (const key of ["noindex", "nofollow", "xRobotsTag", "excludedFromSitemap", "excludedFromLlms"]) {
      assert(entry.protections?.[key] === true, `${entry.path} must set ${key}=true`);
    }
  }
}

function assertCanonicalSamples(snapshot) {
  assertArray(snapshot.canonicalSnapshot?.samples, "canonicalSnapshot.samples");

  for (const sample of snapshot.canonicalSnapshot.samples) {
    assert(sample.canonicalUrl === `${snapshot.siteUrl}${sample.path}`, `canonical mismatch for ${sample.path}`);
  }
}

function assertHreflangSamples(snapshot) {
  assertArray(snapshot.hreflangSnapshot?.samples, "hreflangSnapshot.samples");

  for (const sample of snapshot.hreflangSnapshot.samples) {
    assert(sample.alternates?.en, `hreflang sample missing en alternate for ${sample.path}`);
    assert(sample.alternates?.["zh-CN"], `hreflang sample missing zh-CN alternate for ${sample.path}`);
    assert(sample.alternates?.["x-default"] === snapshot.siteUrl, `hreflang x-default mismatch for ${sample.path}`);
  }
}

function assertJsonLdSamples(snapshot) {
  assertArray(snapshot.jsonLdSnapshot?.samples, "jsonLdSnapshot.samples");

  for (const sample of snapshot.jsonLdSnapshot.samples) {
    assertArray(sample.expectedTypes, `jsonLdSnapshot expectedTypes for ${sample.path}`);
    assert(
      sample.canonicalUrl === `${snapshot.siteUrl}${sample.path}`,
      `JSON-LD canonical mismatch for ${sample.path}`
    );
  }
}

export function validateDiscoverabilityRegressionSnapshot(snapshot = readJson(SNAPSHOT_PATH)) {
  assert(snapshot.version === "discoverability.regression.snapshot.v1", "unexpected snapshot version");
  assert(snapshot.scope === "PR-DF-01", "unexpected snapshot scope");
  assert(snapshot.siteUrl === "https://fermatmind.com", "unexpected siteUrl");

  for (const surface of REQUIRED_SURFACES) {
    assert(snapshot.surfaces?.includes(surface), `missing surface: ${surface}`);
  }

  assertSourceTokens(snapshot);
  assertArray(snapshot.sitemapSnapshot?.mustIncludeSamples, "sitemapSnapshot.mustIncludeSamples");
  assertArray(snapshot.sitemapSnapshot?.mustExcludeSamples, "sitemapSnapshot.mustExcludeSamples");
  assertArray(snapshot.llmsSnapshot?.mustIncludeSamples, "llmsSnapshot.mustIncludeSamples");
  assertArray(snapshot.llmsSnapshot?.mustExcludeSamples, "llmsSnapshot.mustExcludeSamples");
  assertNoPrivateFlowExposure(snapshot.sitemapSnapshot.mustIncludeSamples, "sitemapSnapshot.mustIncludeSamples");
  assertNoPrivateFlowExposure(snapshot.llmsSnapshot.mustIncludeSamples, "llmsSnapshot.mustIncludeSamples");
  assertPrivateFlowProtections(snapshot);
  assertCanonicalSamples(snapshot);
  assertHreflangSamples(snapshot);
  assertJsonLdSamples(snapshot);
  assertArray(snapshot.generatedLiveParityFixtures?.samplePages, "generatedLiveParityFixtures.samplePages");

  return {
    version: snapshot.version,
    surfaces: snapshot.surfaces.length,
    privateFlowSamples: snapshot.privateFlowExposureSnapshot.length,
    canonicalSamples: snapshot.canonicalSnapshot.samples.length,
    hreflangSamples: snapshot.hreflangSnapshot.samples.length,
    jsonLdSamples: snapshot.jsonLdSnapshot.samples.length,
    generatedLiveParitySamples: snapshot.generatedLiveParityFixtures.samplePages.length,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const summary = validateDiscoverabilityRegressionSnapshot();
  if (process.argv.includes("--json")) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  } else {
    process.stdout.write(
      [
        "discoverability regression snapshot ok",
        `surfaces=${summary.surfaces}`,
        `privateFlowSamples=${summary.privateFlowSamples}`,
        `canonicalSamples=${summary.canonicalSamples}`,
        `hreflangSamples=${summary.hreflangSamples}`,
        `jsonLdSamples=${summary.jsonLdSamples}`,
        `generatedLiveParitySamples=${summary.generatedLiveParitySamples}`,
      ].join("\n") + "\n"
    );
  }
}
