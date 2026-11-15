import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const locales = ["zh-TW", "zh-CN", "en"];
const safePath = /^\/(?:zh-TW|zh|en)\/[A-Za-z0-9/_-]+$/u;
const excluded = /^\/(?:en\/|zh\/|zh-TW\/)?(?:result|results|orders?|share|payments?|pay|history)(?:\/|$)|\/tests\/.*\/take(?:\/|$)/u;

export function readReleaseScope(filename) {
  const { paths, samples } = JSON.parse(readFileSync(filename, "utf8"));
  if (!Array.isArray(paths) || !paths.length || new Set(paths).size !== paths.length ||
    paths.some(path => !safePath.test(path) || !path.startsWith("/zh-TW/") || excluded.test(path)) ||
    !Array.isArray(samples) || !samples.length ||
    samples.some(sample => locales.some(locale => !safePath.test(sample[locale])) || !paths.includes(sample["zh-TW"]))) {
    throw new Error("Invalid Traditional index release scope");
  }
  return { paths, samples };
}

function attributes(tag) {
  return Object.fromEntries(Array.from(tag.matchAll(/([\w-]+)=(?:"([^"]*)"|'([^']*)')/gu), match =>
    [match[1].toLowerCase(), match[2] ?? match[3]]));
}

export function assertPageMetadata(html, header, canonical, peers, staging) {
  const tags = Array.from(html.matchAll(/<(?:link|meta)\s[^>]*>/giu), ([tag]) => attributes(tag));
  const robots = [
    header ?? "",
    ...tags.filter(tag => ["robots", "googlebot"].includes(tag.name?.toLowerCase())).map(tag => tag.content ?? ""),
  ];
  if (robots.some(value => /\bnoindex\b/iu.test(value)) !== staging) {
    throw new Error(`Unexpected indexing directives for ${new URL(canonical).pathname}`);
  }
  if (staging) return;
  const links = tags.filter(tag => tag.rel === "canonical");
  const alternates = tags.filter(tag => tag.rel === "alternate");
  const matches = (href, expected) => typeof href === "string" && new URL(href, canonical).href === expected;
  if (links.length !== 1 || !matches(links[0].href, canonical) ||
    locales.some(locale => {
      const localized = alternates.filter(tag => tag.hreflang?.toLowerCase() === locale.toLowerCase());
      return localized.length !== 1 || !matches(localized[0].href, peers[locale]);
    })) {
    throw new Error(`Canonical or reciprocal hreflang mismatch for ${new URL(canonical).pathname}`);
  }
}

async function get(url, status = 200) {
  const response = await fetch(url, {
    redirect: "error",
    headers: { "user-agent": "facebookexternalhit/1.1", "cache-control": "no-cache" },
    signal: AbortSignal.timeout(30_000),
  });
  if (response.status !== status) {
    await response.body?.cancel();
    throw new Error(`Expected HTTP ${status} for ${new URL(url).pathname}, got ${response.status}`);
  }
  return response;
}

async function readSitemap(origin) {
  const sitemap = await (await get(origin + "/sitemap.xml")).text();
  const entries = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu), ([, url]) => url);
  if (!entries.length || new Set(entries).size !== entries.length || entries.some(url => {
    const parsed = new URL(url);
    return parsed.origin !== origin || parsed.search || parsed.hash || excluded.test(parsed.pathname);
  })) {
    throw new Error("Sitemap contains invalid, duplicate, or non-public entries");
  }
  return entries;
}

export async function verify(origin, scope, staging = false, before = []) {
  if (staging) {
    await (await get(origin + "/sitemap.xml", 410)).body?.cancel();
  } else {
    const active = new Set(await readSitemap(origin));
    const missing = scope.paths.filter(path => !active.has(origin + path));
    const removed = before.filter(url => !active.has(url));
    if (missing.length || removed.length) {
      throw new Error(`Sitemap delta rejected: missing=${missing.length}, removed=${removed.length}; first=${missing[0] ?? removed[0]}`);
    }
    const previous = new Set(before);
    const opened = scope.paths.filter(path => !previous.has(origin + path));
    console.log(`Sitemap contains all ${scope.paths.length} approved paths; opened ${opened.length} since the pre-deploy snapshot`);
  }

  const samples = scope.samples.flatMap(paths => {
    const peers = Object.fromEntries(locales.map(locale => [locale, origin + paths[locale]]));
    return Object.values(peers).map(url => ({ url, peers }));
  });
  for (let offset = 0; offset < samples.length; offset += 6) {
    await Promise.all(samples.slice(offset, offset + 6).map(async ({ url, peers }) => {
      const page = await get(url);
      assertPageMetadata(await page.text(), page.headers.get("x-robots-tag"), url, peers, staging);
    }));
  }
  console.log(`Verified indexing directives and HTTP status for ${samples.length} pages${staging ? "" : ", including canonical and reciprocal hreflang"}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [, , origin, filename, environment, snapshotFile] = process.argv;
  if (!["https://fermatmind.com", "https://staging.fermatmind.com"].includes(origin) ||
    (origin.endsWith("://staging.fermatmind.com") ? environment !== "staging" : !["production", "snapshot"].includes(environment))) {
    throw new Error("Unrecognized Traditional index verification environment");
  }
  const scope = readReleaseScope(filename);
  if (environment === "snapshot") {
    writeFileSync(snapshotFile, JSON.stringify(await readSitemap(origin)), { flag: "wx" });
  } else {
    const before = snapshotFile ? JSON.parse(readFileSync(snapshotFile, "utf8")) : [];
    await verify(origin, scope, environment === "staging", before);
  }
}
