import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const characterTests = [
  "anime-character-archetype-test", "blue-lock", "chiikawa", "cyberpunk-edgerunners",
  "dexter", "gilmore-girls", "naruto-character", "south-park", "tsundere-dere-type",
];
const otherQuestionnaires = [
  "8-values-political", "aura-color", "dungeons-dragons-class", "friendship-compatibility",
  "overthinking-screener", "philosopher-personality-test", "space-marine-chapter", "spirit-animal",
  "which-tarot-card-are-you",
];
const symbolTests = new Set([
  "aura-color", "dungeons-dragons-class", "philosopher-personality-test",
  "space-marine-chapter", "spirit-animal", "which-tarot-card-are-you",
]);
type Quiz = { profiles: { id: string; title: { en: string; zh: string } }[]; questions: { id: string; options: { id: string }[] }[] };

for (const locale of ["en", "zh"] as const) {
  for (const slug of [...characterTests, ...otherQuestionnaires]) {
    test(`${locale} ${slug} completes and fits the result`, async ({ page }) => {
      const quiz = JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Quiz;
      const zh = locale === "zh";
      const pilot = slug === "anime-character-archetype-test" || slug === "cyberpunk-edgerunners";
      await page.setViewportSize({ width: 390, height: 844 });
      await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
      if (pilot) await page.addInitScript(() => {
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Synthetic clipboard denial"); } } });
      });
      await page.goto(`/${locale}/tests/explore/${slug}`);
      await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();

      for (const question of quiz.questions) {
        const option = slug === "overthinking-screener" ? "2" : slug === "friendship-compatibility" ? "3" : question.options[0].id;
        const choice = page.locator(`#take-test input[name="${question.id}"][value="${option}"]`);
        await choice.click({ timeout: 12000 });
      }

      const result = page.locator('#take-test[data-stage="result"]');
      await expect(result).toBeVisible();
      if (symbolTests.has(slug)) {
        await expect(result.locator("[data-quiz-artwork]")).toHaveCount(quiz.profiles.length, { timeout: 20000 });
        for (const profile of quiz.profiles) {
          await expect(result.locator(`[data-archetype-match="${profile.id}"] [data-quiz-artwork="${profile.id}"]`)).toBeVisible();
        }
      }
      if (slug === "8-values-political") await expect(result.locator("[data-eight-values-axis]")).toHaveCount(4);
      if (slug === "friendship-compatibility") {
        await expect(result.locator("[data-friendfit-mean]")).toHaveText(Array(5).fill("3.0 / 5"));
        await expect(result.locator("[data-friendfit-track]")).toHaveCount(5);
      }
      if (slug === "overthinking-screener") {
        await expect(result.locator("[data-ptq15-overview] li")).toHaveCount(4);
        await expect(result.locator("[data-ptq15-score]")).toHaveCount(4);
        await expect(result.locator('[data-ptq15-score="total-reading"]')).toContainText("30");
      }

      if (symbolTests.has(slug) || characterTests.includes(slug)) {
        const disclosure = result.locator("[data-archetype-counts-details]");
        const report = result.locator("[data-choice-chart-placement]");
        const placement = await report.getAttribute("data-choice-chart-placement");
        const firstMatch = report.locator("[data-archetype-match]").first();
        const lead = firstMatch.locator("header").first();
        const comparison = report.locator("#choice-counts");
        if (placement === "after") await disclosure.locator("summary").click();
        const chart = comparison.locator("[data-archetype-count]");
        await expect(chart).toHaveCount(quiz.profiles.length);
        await expect(chart.first().locator("dd[aria-hidden] > div")).toHaveAttribute("style", /width: [\d.]+%/);
        const leadTop = (await lead.boundingBox())!.y;
        const comparisonTop = (await comparison.boundingBox())!.y;
        if (placement === "before") expect(comparisonTop).toBeLessThan(leadTop);
        else expect(comparisonTop).toBeGreaterThan(leadTop);
        if (placement === "between") {
          const readingTop = (await firstMatch.getByRole("heading", { level: 4 }).first().boundingBox())!.y;
          expect(comparisonTop).toBeLessThan(readingTop);
        }
        if (slug === "anime-character-archetype-test") await expect(comparison.locator("[data-choice-radar-shape]")).toBeVisible();
        if (placement === "after") await disclosure.locator("summary").click();
      }

      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: width === 1440 ? 960 : 844 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        if (width === 320) continue;
        if (width === 390 && symbolTests.has(slug)) {
          const lead = result.locator("[data-portrait-lead]").first();
          const art = await lead.locator("[data-quiz-artwork]").boundingBox();
          const title = await lead.getByRole("heading", { level: 3 }).boundingBox();
          expect(art!.y).toBeGreaterThanOrEqual(title!.y + title!.height);
          expect(art!.y - title!.y - title!.height).toBeLessThan(24);
        }
        if (characterTests.includes(slug)) {
          const cards = result.locator("[data-archetype-match]");
          await expect(cards).toHaveCount(quiz.profiles.length, { timeout: 20000 });
          for (const profile of quiz.profiles) {
            const card = cards.and(page.locator(`[data-archetype-match="${profile.id}"]`));
            await expect(card.getByRole("heading", { name: profile.title[locale], exact: true })).toBeVisible();
            const art = card.locator(`[data-portrait-art="${profile.id}"] img`);
            await expect(art).toHaveAttribute("src", `/images/quiz-portraits/${slug}/${profile.id}.webp`);
            await art.scrollIntoViewIfNeeded();
            await expect.poll(() => art.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(640);
            const box = await art.boundingBox();
            expect(box).not.toBeNull();
            expect(box!.width).toBeGreaterThan(80);
            expect(Math.abs(box!.width - box!.height)).toBeLessThan(1);
            expect(box!.x + box!.width).toBeLessThanOrEqual(width);
          }
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: test.info().outputPath(`local-${locale}-${slug}-${width}.png`), animations: "disabled" });
      }
      if (pilot) {
        await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
        const shared = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
        expect(shared.trim().split("\n").at(-1)).toBe(`https://fermatmind.com/${locale}/tests/explore/${slug}`);
        expect(shared).not.toMatch(/(?:ANI|EDGE)_\d{2}|[?&]score=|\d+\s*\/\s*12/);
        await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
        const answer = page.locator('#take-test[data-stage="answer"]');
        await expect(answer.getByRole("radio").first()).toBeVisible();
        await expect(answer.locator("input:checked")).toHaveCount(0);
      }
    });
  }
}
