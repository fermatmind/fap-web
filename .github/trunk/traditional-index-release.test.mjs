import assert from "node:assert/strict";
import test from "node:test";
import { assertPageMetadata, readReleaseScope, verify } from "../../scripts/ops/verify-traditional-index-release.mjs";

const origin = "https://fermatmind.com";
const paths = { "zh-TW": "/zh-TW/business", "zh-CN": "/zh/business", en: "/en/business" };
const peers = Object.fromEntries(Object.entries(paths).map(([locale, path]) => [locale, origin + path]));
const canonical = peers["zh-TW"];
const html = `<link rel="canonical" href="${canonical}">${Object.entries(peers).map(([locale, url]) =>
  `<link rel="alternate" hreflang="${locale}" href="${url}">`).join("")}`;

test("scope includes the declared Traditional page for every sample", () => {
  const { paths: entries, samples } = readReleaseScope("scripts/ops/traditional-index-release.json");
  assert.ok(entries.includes(paths["zh-TW"]));
  assert.ok(samples.some(sample => sample["zh-TW"] === paths["zh-TW"]));
});

test("rejects broken reciprocal links and noindex in public metadata", () => {
  assert.doesNotThrow(() => assertPageMetadata(html, null, canonical, peers, false));
  assert.throws(() => assertPageMetadata(html.replace(peers.en, peers["zh-CN"]), null, canonical, peers, false), /hreflang/u);
  assert.throws(() => assertPageMetadata(html, "noindex, nofollow", canonical, peers, false), /indexing directives/u);
  assert.doesNotThrow(() => assertPageMetadata(html, "noindex, nofollow", canonical, peers, true));
});

test("rejects missing batch members and removed previously public URLs", async t => {
  t.mock.method(globalThis, "fetch", async () => new Response(`<urlset><url><loc>${canonical}</loc></url></urlset>`));
  await assert.rejects(verify(origin, { paths: ["/zh-TW/support"], samples: [] }), /missing=1/u);
  await assert.rejects(verify(origin, { paths: [paths["zh-TW"]], samples: [] }, false, [peers.en]), /removed=1/u);
});
