import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const FIXTURE_PATH = path.join(
  ROOT,
  "tests/contracts/fixtures/discoverability-foundation/canonical-hreflang-jsonld-parity.v1.json"
);
const ALLOWED_SCOPES = new Set(["PR-DF-05", "PR-UG-06"]);
const SITEMAP_PATH = path.join(ROOT, "public/sitemap.xml");
const PRIVATE_FLOW_RE = /\/(?:tests\/[^/]+\/take|test\/[^/]+\/take|result\/|orders\/|share\/)/i;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function resolveCliFixturePath(argv = process.argv) {
  const fixtureIndex = argv.indexOf("--fixture");
  if (fixtureIndex < 0) {
    return FIXTURE_PATH;
  }

  const value = argv[fixtureIndex + 1];
  assert(value, "--fixture requires a file path");
  return path.resolve(ROOT, value);
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

function assertAbsoluteCanonicalUrl(value, siteUrl, label) {
  assert(
    typeof value === "string" && (value === siteUrl || value.startsWith(`${siteUrl}/`)),
    `${label} must use ${siteUrl}: ${value}`
  );
  const url = new URL(value);
  assert(!url.search && !url.hash, `${label} must not include query/hash: ${value}`);
}

function readSitemapLocs() {
  const xml = fs.readFileSync(SITEMAP_PATH, "utf8");
  return new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
}

function assertSourceContracts(fixture) {
  assertArray(fixture.sourceContracts, "sourceContracts");

  for (const contract of fixture.sourceContracts) {
    const sourcePath = path.join(ROOT, contract.source);
    assert(fs.existsSync(sourcePath), `source file does not exist: ${contract.source}`);
    const source = fs.readFileSync(sourcePath, "utf8");

    for (const token of contract.requiredTokens ?? []) {
      assert(source.includes(token), `${contract.source} is missing required token: ${token}`);
    }

    for (const token of contract.forbiddenTokens ?? []) {
      assert(!source.includes(token), `${contract.source} contains forbidden token: ${token}`);
    }
  }
}

function assertGeneratedParity(fixture) {
  const sitemapLocs = readSitemapLocs();
  assertArray(fixture.samples, "samples");

  for (const sample of fixture.samples) {
    assert(typeof sample.path === "string" && sample.path.startsWith("/"), `${sample.id} path must be absolute`);
    assert(!PRIVATE_FLOW_RE.test(sample.path), `${sample.id} must not be a private flow`);
    assert(sample.canonicalUrl === `${fixture.siteUrl}${sample.path}`, `${sample.id} canonicalUrl must match path`);
    assertAbsoluteCanonicalUrl(sample.canonicalUrl, fixture.siteUrl, `${sample.id}.canonicalUrl`);

    if (sample.expectedInSitemap) {
      assert(sitemapLocs.has(sample.canonicalUrl), `${sample.id} canonicalUrl missing from generated sitemap`);
    }

    for (const [hreflang, href] of Object.entries(sample.alternates ?? {})) {
      assertAbsoluteCanonicalUrl(href, fixture.siteUrl, `${sample.id}.alternates.${hreflang}`);
    }

    assert(sample.alternates?.["x-default"] === fixture.siteUrl, `${sample.id} x-default must be site root`);

    for (const reference of sample.jsonLdReferences ?? []) {
      assert(
        reference === sample.canonicalUrl || reference.startsWith(`${sample.canonicalUrl}#`),
        `${sample.id} JSON-LD reference must align with canonicalUrl: ${reference}`
      );
    }
  }
}

function assertHreflangReciprocity(fixture) {
  const pairs = new Map();
  for (const sample of fixture.samples) {
    const group = pairs.get(sample.pairKey) ?? {};
    group[sample.locale] = sample;
    pairs.set(sample.pairKey, group);
  }

  for (const [pairKey, group] of pairs) {
    assert(group.en, `${pairKey} is missing en sample`);
    assert(group["zh-CN"], `${pairKey} is missing zh-CN sample`);

    for (const sample of [group.en, group["zh-CN"]]) {
      assert(sample.alternates.en === group.en.canonicalUrl, `${sample.id} en alternate is not reciprocal`);
      assert(sample.alternates["zh-CN"] === group["zh-CN"].canonicalUrl, `${sample.id} zh-CN alternate is not reciprocal`);
    }
  }
}

function assertPrivateFlowsExcluded(fixture) {
  assertArray(fixture.privateFlowSamples, "privateFlowSamples");
  const sitemapLocs = readSitemapLocs();

  for (const sample of fixture.privateFlowSamples) {
    assert(PRIVATE_FLOW_RE.test(sample), `private flow sample is not protected: ${sample}`);
    assert(!sitemapLocs.has(`${fixture.siteUrl}${sample}`), `private flow appears in sitemap: ${sample}`);
  }
}

function parseAttributes(raw) {
  const attrs = {};
  for (const match of raw.matchAll(/([a-zA-Z:-]+)=["']([^"']*)["']/g)) {
    attrs[match[1].toLowerCase()] = match[2];
  }
  return attrs;
}

function extractLinks(html) {
  const links = [];
  for (const match of html.matchAll(/<link\b([^>]*)>/gi)) {
    links.push(parseAttributes(match[1]));
  }
  return links;
}

function extractJsonLdPayloads(html) {
  const payloads = [];
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      payloads.push(JSON.parse(match[1]));
    } catch {
      // Invalid JSON-LD is handled by the missing-reference assertion below.
    }
  }
  return payloads;
}

function collectJsonValues(value, out = []) {
  if (typeof value === "string") {
    out.push(value);
    return out;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectJsonValues(item, out);
    return out;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectJsonValues(item, out);
  }

  return out;
}

async function assertLiveParity(fixture) {
  for (const sample of fixture.samples) {
    const response = await fetch(sample.canonicalUrl, { headers: { Accept: "text/html" } });
    assert(response.ok, `${sample.id} live fetch failed: ${response.status}`);
    const html = await response.text();
    const links = extractLinks(html);
    const canonical = links.find((link) => String(link.rel ?? "").toLowerCase() === "canonical")?.href;
    assert(canonical === sample.canonicalUrl, `${sample.id} live canonical mismatch: ${canonical}`);

    for (const [hreflang, href] of Object.entries(sample.alternates ?? {})) {
      const alternate = links.find((link) => {
        const rel = String(link.rel ?? "").toLowerCase();
        return rel.includes("alternate") && String(link.hreflang ?? "") === hreflang;
      });
      assert(alternate?.href === href, `${sample.id} live hreflang ${hreflang} mismatch`);
    }

    const jsonValues = extractJsonLdPayloads(html).flatMap((payload) => collectJsonValues(payload));
    for (const reference of sample.jsonLdReferences ?? []) {
      assert(jsonValues.includes(reference), `${sample.id} live JSON-LD missing canonical reference: ${reference}`);
    }
  }
}

export async function validateCanonicalHreflangJsonLdParity({
  fixture = readJson(FIXTURE_PATH),
  live = false,
} = {}) {
  assert(fixture.version === "discoverability.canonical_hreflang_jsonld_parity.v1", "unexpected fixture version");
  assert(ALLOWED_SCOPES.has(fixture.scope), `unexpected fixture scope: ${fixture.scope}`);
  assert(fixture.siteUrl === "https://fermatmind.com", "unexpected siteUrl");

  assertSourceContracts(fixture);
  assertGeneratedParity(fixture);
  assertHreflangReciprocity(fixture);
  assertPrivateFlowsExcluded(fixture);

  if (live) {
    await assertLiveParity(fixture);
  }

  return {
    version: fixture.version,
    scope: fixture.scope,
    samples: fixture.samples.length,
    hreflangPairs: new Set(fixture.samples.map((sample) => sample.pairKey)).size,
    privateFlowSamples: fixture.privateFlowSamples.length,
    live: Boolean(live),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const live = process.argv.includes("--live");
  const fixture = readJson(resolveCliFixturePath());
  const summary = await validateCanonicalHreflangJsonLdParity({ fixture, live });
  if (process.argv.includes("--json")) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  } else {
    process.stdout.write(
      [
        "canonical/hreflang/jsonld parity ok",
        `samples=${summary.samples}`,
        `hreflangPairs=${summary.hreflangPairs}`,
        `privateFlowSamples=${summary.privateFlowSamples}`,
        `live=${summary.live}`,
      ].join("\n") + "\n"
    );
  }
}
