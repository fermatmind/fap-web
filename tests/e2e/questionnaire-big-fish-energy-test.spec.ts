import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { archetypeStandaloneCases, expectArchetypeGuideAlternates } from "./helpers/archetype-standalone-cases";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/big-fish-energy-test.json", "utf8")) as Questionnaire;
test.beforeEach(async ({ page }) => {
  const session = await page.context().newCDPSession(page);
  await session.send("Network.enable");
  await session.send("Network.setBlockedURLs", { urls: ["*/api/v0.5/seo/attribution/events*", "*/api/track*", "*googletagmanager.com/*", "*google-analytics.com/*", "*hm.baidu.com/*"] });
});
archetypeStandaloneCases(quiz, "Ocean mood", "shark", "OCEAN");

test("@release Ocean mood all12public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const publicPath = `/${locale}/tests/explore/big-fish-energy-test/results/${profile.id}`;
    expect((await page.goto(publicPath, { waitUntil: "domcontentloaded" }))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expectArchetypeGuideAlternates(page, quiz.slug, profile.id);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/big-fish-energy-test#take-test`);
    const image = await request.get(`/og/fun/big-fish-energy-test?locale=${locale}&portrait=${profile.id}&v=${quiz.version}`); expect(image.status()).toBe(200); const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/big-fish-energy-test/results/mastermind", "/zh/tests/explore/big-fish-energy-test/results/OCEAN_01", "/en/tests/play/big-fish-energy-test"]) expect((await request.get(path)).status()).toBe(404);
});
