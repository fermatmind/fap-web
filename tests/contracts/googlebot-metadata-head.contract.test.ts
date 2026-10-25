import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { HTML_LIMITED_BOT_UA_RE: defaultBots } = require(
  "next/dist/shared/lib/router/utils/html-bots.js",
) as { HTML_LIMITED_BOT_UA_RE: RegExp };
const configUrl = pathToFileURL(path.join(process.cwd(), "next.config.mjs")).href;
const configured = JSON.parse(
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `const { default: config } = await import(${JSON.stringify(configUrl)});
       console.log(JSON.stringify({ source: config.htmlLimitedBots.source, flags: config.htmlLimitedBots.flags }));`,
    ],
    { encoding: "utf8" },
  ),
) as { source: string; flags: string };
const blockingBots = new RegExp(configured.source, configured.flags);

describe("Googlebot metadata head delivery", () => {
  it.each([
    "Googlebot",
    "googlebot/2.1",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  ])("waits for metadata before sending the head to %s", (userAgent) => {
    expect(blockingBots.test(userAgent)).toBe(true);
  });

  it.each([
    "Google-InspectionTool",
    "Mediapartners-Google",
    "AdsBot-Google",
    "Bingbot/2.0",
    "Twitterbot/1.0",
    "facebookexternalhit/1.1",
    "Slackbot-LinkExpanding",
    "Chrome-Lighthouse",
    "DuckDuckBot/1.1",
  ])("preserves Next's blocking behavior for %s", (userAgent) => {
    expect(defaultBots.test(userAgent)).toBe(true);
    expect(blockingBots.test(userAgent)).toBe(true);
  });

  it("retains the installed Next default pattern and flags", () => {
    expect(blockingBots.source).toContain(defaultBots.source);
    expect(blockingBots.flags).toBe(defaultBots.flags);
  });

  it.each([
    "Mozilla/5.0 Chrome/131.0.0.0 Safari/537.36",
    "Mozilla/5.0 Version/18.0 Safari/605.1.15",
    "curl/8.7.1",
  ])("keeps streaming available to ordinary clients such as %s", (userAgent) => {
    expect(blockingBots.test(userAgent)).toBe(false);
  });
});
