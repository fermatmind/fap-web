#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { buildSafeSitemapFallbackXml } = require("../../lib/seo/sitemapFallback.cjs");

const sitemapPath = path.join(process.cwd(), "public/sitemap.xml");
const buildManifestPath = path.join(process.cwd(), ".next/build-manifest.json");
const privateSitemapPathPattern =
  /<loc>\s*https:\/\/fermatmind\.com(?:\/(?:en|zh))?(?:\/(?:result|results|orders?|share|pay|payment|history)(?:\/|[?#<\s])|\/tests\/[^/<]+\/take(?:\/|[?#<\s]))/i;

function hasSafeUsableSitemapXml(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const xml = fs.readFileSync(filePath, "utf8");
  return (
    /<urlset[\s>]/i.test(xml) &&
    /<loc>\s*https:\/\/fermatmind\.com(?:\/[^<]*)?\s*<\/loc>/i.test(xml) &&
    !privateSitemapPathPattern.test(xml)
  );
}

function writeSafeFallbackSitemap(reason) {
  fs.mkdirSync(path.dirname(sitemapPath), { recursive: true });
  fs.writeFileSync(sitemapPath, buildSafeSitemapFallbackXml(process.env.NEXT_PUBLIC_SITE_URL), "utf8");
  console.warn(`[seo] wrote safe fallback sitemap: ${reason}`);
}

function ensureSafeFallbackSitemap(reason) {
  if (hasSafeUsableSitemapXml(sitemapPath)) {
    console.warn(`[seo] kept existing safe sitemap: ${reason}`);
    return;
  }

  writeSafeFallbackSitemap(reason);
}

if (!fs.existsSync(buildManifestPath)) {
  ensureSafeFallbackSitemap("Next build manifest missing; run next build before dynamic sitemap generation");
  process.exit(0);
}

const cliModuleUrl = pathToFileURL(path.join(process.cwd(), "node_modules/next-sitemap/dist/esm/cli.js")).href;
const { CLI } = await import(cliModuleUrl);
const cli = new CLI();
const originalExit = process.exit;
let cliFailed = false;
try {
  process.exit = ((code) => {
    throw new Error(`next-sitemap requested process exit ${code ?? 0}`);
  });
  await cli.execute();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  ensureSafeFallbackSitemap(`next-sitemap failed: ${message}`);
  cliFailed = true;
} finally {
  process.exit = originalExit;
}

if (cliFailed) {
  process.exit(0);
}

if (!hasSafeUsableSitemapXml(sitemapPath)) {
  writeSafeFallbackSitemap("generated sitemap was missing or empty");
}
