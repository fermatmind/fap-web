import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
import { archetypeResultCopy } from "../../lib/questionnaires/archetypeResultShare";
import { seedAnalyticsConsent } from "./helpers/consent";

const slugs = ["aura-color", "moon-phase", "chiikawa", "bleach", "philosopher-personality-test"];

for (const slug of slugs) {
  const quiz = JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
  for (const locale of ["en", "zh"] as const) for (const mode of slug === "aura-color" ? ["tie", "single"] : ["tie"]) {
    test(`${slug} ${locale} ${mode}: share copies the public quiz URL and all matched names`, async ({ page }) => {
      const copy = archetypeResultCopy[locale];
      await seedAnalyticsConsent(page);
      const entry = `/${locale}/tests/explore/${slug}`;
      await page.addInitScript(() => {
        let copied = "";
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: async (text: string) => { copied = text; },
            readText: async () => copied,
          },
        });
      });
      await page.goto(entry);
      await page.locator("#take-test [data-explore-start]").click();
      const runner = page.locator("#take-test[data-stage]");
      const winner = quiz.profiles[0];
      for (const question of quiz.questions) {
        const option = (mode === "single" && question.options.find(item => item.directionId === winner.id)) || question.options[0];
        await runner.locator(`input[name="${question.id}"][value="${option.id}"]`).check();
        await runner.locator("[data-questionnaire-next]").click();
      }
      await expect(runner).toHaveAttribute("data-stage", "result");
      const card = runner.locator("[data-archetype-honor-group]");
      const matches = ((await card.locator("[data-archetype-honor-card]").getAttribute("aria-label")) ?? "").split(" · ");
      expect(matches).toHaveLength(mode === "single" ? 1 : quiz.profiles.length);
      expect(matches.every(name => name.trim().length > 0)).toBe(true);
      await card.getByRole("button", { name: copy.share, exact: true }).click();
      await expect(card.getByRole("status")).toHaveText(copy.copied);
      const text = await page.evaluate(() => navigator.clipboard.readText());
      for (const name of matches) expect(text).toContain(name);
      expect(text.split("\n").at(-1)).toBe(`https://fermatmind.com${entry}`);
      expect(text).not.toMatch(/AURA_\d|MOON_PHASE_|CHIIKAWA_\d|BLEACH_\d|PHIL_\d|answers|form_code|submission|[?&]score/);
    });
  }
}
