import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { archetypeStandaloneCases } from "./helpers/archetype-standalone-cases";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/wednesday-addams-character.json", "utf8")) as Questionnaire;
archetypeStandaloneCases(quiz, "Wednesday", "wednesday-addams", "WED");

test("@release Wednesday fan choices all12public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/wednesday-addams-character/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /^noindex, follow(?:,|$)/);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/wednesday-addams-character#take-test`);
    const image = await request.get(`/og/fun/wednesday-addams-character?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/wednesday-addams-character/results/unknown", "/zh/tests/explore/wednesday-addams-character/results/WED_01", "/en/tests/play/wednesday-addams-character"]) expect((await request.get(path)).status()).toBe(404);
});
