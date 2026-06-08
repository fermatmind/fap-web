/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const {
  P0_SITEMAP_ALLOWLIST_PATHS,
  normalizePath,
  resolveSitemapSiteUrl,
} = require("./sitemapAuthorityAdapters.cjs");
const { shouldIncludeInSitemap } = require("./indexingPolicy.cjs");

const FALLBACK_CHANGEFREQ = "weekly";
const FALLBACK_XML_LASTMOD = "2026-06-08T00:00:00.000Z";

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSafeSitemapFallbackPaths() {
  return [...P0_SITEMAP_ALLOWLIST_PATHS]
    .map((path) => normalizePath(path))
    .filter((path) => shouldIncludeInSitemap(path, { indexEligible: true, indexState: "indexed" }))
    .sort((left, right) => {
      if (left === "/") return -1;
      if (right === "/") return 1;
      return left.localeCompare(right);
    });
}

function buildSafeSitemapFallbackEntries() {
  return buildSafeSitemapFallbackPaths().map((loc) => ({
    loc,
    changefreq: FALLBACK_CHANGEFREQ,
    priority: loc === "/" ? 1.0 : 0.7,
  }));
}

function buildAbsoluteSitemapUrl(siteUrl, path) {
  const base = resolveSitemapSiteUrl(siteUrl).replace(/\/$/, "");
  const normalized = normalizePath(path);
  return normalized === "/" ? base : `${base}${normalized}`;
}

function buildSafeSitemapFallbackXml(siteUrl) {
  const urls = buildSafeSitemapFallbackPaths()
    .map((path) => {
      const loc = buildAbsoluteSitemapUrl(siteUrl, path);
      return [
        "  <url>",
        `    <loc>${xmlEscape(loc)}</loc>`,
        `    <lastmod>${FALLBACK_XML_LASTMOD}</lastmod>`,
        `    <changefreq>${FALLBACK_CHANGEFREQ}</changefreq>`,
        `    <priority>${path === "/" ? "1.0" : "0.7"}</priority>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

module.exports = {
  buildSafeSitemapFallbackEntries,
  buildSafeSitemapFallbackPaths,
  buildSafeSitemapFallbackXml,
};
