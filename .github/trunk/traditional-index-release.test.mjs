import assert from "node:assert/strict";
import test from "node:test";
import { assertPageMetadata, readReleaseScope, verify } from "../../scripts/ops/verify-traditional-index-release.mjs";

const origin = "https://fermatmind.com";
const paths = { "zh-TW": "/zh-TW/business", "zh-CN": "/zh/business", en: "/en/business" };
const peers = Object.fromEntries(Object.entries(paths).map(([locale, path]) => [locale, origin + path]));
const canonical = peers["zh-TW"];
const html = `<link rel="canonical" href="${canonical}">${Object.entries(peers).map(([locale, url]) =>
  `<link rel="alternate" hreflang="${locale}" href="${url}">`).join("")}`;

test("scope retires only the former test category pages in each locale", () => {
  const { paths: entries, samples, retiredPaths } = readReleaseScope("scripts/ops/traditional-index-release.json");
  assert.deepEqual(entries, []);
  assert.deepEqual(samples, []);
  assert.deepEqual(retiredPaths, ["zh-TW", "zh", "en"].flatMap(locale =>
    ["personality", "career"].map(slug => `/${locale}/tests/category/${slug}`)));
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

test("allows only declared removals and requires retired URLs to return 404", async t => {
  const retiredPath = "/zh/tests/category/personality";
  const retiredUrl = origin + retiredPath;
  let listed = false;
  let retiredStatus = 404;
  t.mock.method(globalThis, "fetch", async url => {
    if (url !== origin + "/sitemap.xml") {
      assert.equal(url, retiredUrl);
      return new Response(null, { status: retiredStatus });
    }
    return new Response(`<urlset><url><loc>${canonical}</loc></url>${
      listed ? `<url><loc>${retiredUrl}</loc></url>` : ""
    }</urlset>`);
  });
  const scope = { paths: [], samples: [], retiredPaths: [retiredPath] };
  const previous = [canonical, retiredUrl];
  await verify(origin, scope, false, previous);
  await assert.rejects(verify(origin, scope), /pre-deploy snapshot/u);
  await assert.rejects(verify(origin, scope, false, [...previous, peers.en]), /removed=1/u);
  listed = true;
  await assert.rejects(verify(origin, scope, false, previous), /still_listed=1/u);
  listed = false;
  retiredStatus = 200;
  await assert.rejects(verify(origin, scope, false, previous), /Expected HTTP 404/u);
});
