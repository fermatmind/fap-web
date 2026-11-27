import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { archetypeStandaloneCases, expectArchetypeGuideAlternates } from "./helpers/archetype-standalone-cases";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/jujutsu-kaisen-character.json", "utf8")) as Questionnaire;
archetypeStandaloneCases(quiz, "Jujutsu Kaisen", "yuji-itadori", "JJK");

test("@release Jujutsu Kaisen fan choices all12public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/jujutsu-kaisen-character/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expectArchetypeGuideAlternates(page, quiz.slug, profile.id);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/jujutsu-kaisen-character#take-test`);
    const image = await request.get(`/og/fun/jujutsu-kaisen-character?locale=${locale}&portrait=${profile.id}&v=1.0.0`); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/jujutsu-kaisen-character/results/unknown", "/zh/tests/explore/jujutsu-kaisen-character/results/JJK_01", "/en/tests/play/jujutsu-kaisen-character"]) expect((await request.get(path)).status()).toBe(404);
});
