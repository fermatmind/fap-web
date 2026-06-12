#!/usr/bin/env node
import { createJiti } from "jiti";
import process from "node:process";

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
  const route = await jiti.import("../../app/llms-full.txt/route.ts");
  const text = await route.buildLlmsFullText(siteUrl);
  const missingExpectedUrls = expectedUrls.filter((url) => !text.includes(url));
  if (missingExpectedUrls.length > 0) {
    process.stdout.write(
      `${JSON.stringify(
        {
          ok: false,
          mode: "failed",
          site_url: siteUrl,
          missing_expected_urls: missingExpectedUrls,
        },
        null,
        2
      )}\n`
    );
    process.exit(1);
  }

  const result = await route.buildAndCacheLlmsFullText(siteUrl, text);

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
  process.exitCode = 1;
}
