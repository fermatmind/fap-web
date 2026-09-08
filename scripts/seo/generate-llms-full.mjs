#!/usr/bin/env node
import { createJiti } from "jiti";
import process from "node:process";
import { llmsGeneratorFingerprint } from "../release/llms-generator-fingerprint.mjs";
process.env.FERMATMIND_LLMS_FULL_GENERATOR_VERSION = llmsGeneratorFingerprint();

const root = process.cwd();
const siteUrl = String(process.env.NEXT_PUBLIC_SITE_URL || process.env.PUBLIC_BASE_URL || "https://fermatmind.com")
  .replace(/\/+$/, "");
const expectedUrls = String(process.env.LLMS_FULL_EXPECTED_URLS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const jiti = createJiti(import.meta.url, {
  alias: {
    "@": root,
  },
});

try {
  const route = await jiti.import("../../lib/seo/llmsFullRoute.ts");
  const result = await route.buildAndCacheLlmsFullText(siteUrl, "", expectedUrls);

  const payload = {
    ok: result.ok === true,
    mode: result.ok === true ? "complete" : "failed",
    site_url: siteUrl,
    cache_path: result.cachePath,
    bytes: result.bytes,
    career_job_url_count: result.careerJobUrlCount,
    expected_urls_checked: expectedUrls.length,
  };

  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);

  if (!payload.ok) {
    process.exitCode = 1;
  }
} catch (error) {
  process.stderr.write(
    `${JSON.stringify(
      {
        ok: false,
        mode: "failed",
        site_url: siteUrl,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2
    )}\n`
  );
  // This is an operator-only artifact process. A fail-closed build deadline must
  // terminate any legacy loader that does not yet consume AbortSignal.
  process.exit(1);
}
