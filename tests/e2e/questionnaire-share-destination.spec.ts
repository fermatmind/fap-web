import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const slugs = ["aura-color", "moon-phase", "chiikawa", "bleach", "philosopher-personality-test"];

for (const slug of slugs) {
  const quiz = JSON.parse(readFileSync(`lib/questionnaires/data/${slug}.json`, "utf8")) as Questionnaire;
  for (const locale of ["en", "zh"] as const) for (const mode of slug === "aura-color" ? ["tie", "single"] : ["tie"]) {
    test(`${slug} ${locale} ${mode}: copy confirmation identifies the destination`, async ({ page }) => {
      const zh = locale === "zh";
      const entry = `/${locale}/tests/explore/${slug}`;
      await page.addInitScript(() => {
        localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied" }));
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
      await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
      const runner = page.locator("#take-test[data-stage]");
      const winner = quiz.profiles[0];
      for (const question of quiz.questions) {
        const option = (mode === "single" && question.options.find(item => item.directionId === winner.id)) || question.options[0];
        await runner.locator(`input[name="${question.id}"][value="${option.id}"]`).check();
        await runner.locator("[data-questionnaire-next]").click();
      }
      await expect(runner).toHaveAttribute("data-stage", "result");
      await runner.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
      const text = await page.evaluate(() => navigator.clipboard.readText());
      expect(text.split("\n")).toEqual([
        quiz.title[locale],
        mode === "single" ? winner.title[locale] : quiz.profiles.map(profile => profile.title[locale]).join(zh ? "、" : ", "),
        `https://fermatmind.com${entry}${mode === "single" ? `/results/${winner.id}` : ""}`,
      ]);
      const confirmation = mode === "single"
        ? (zh ? "已复制结果名称与该结果的公开指南链接，不含答案或次数。" : "Copied the result name and its public guide link, without answers or counts.")
        : (zh ? "已复制所有并列结果名称与测试入口链接，不含答案或次数。" : "Copied all tied result names and the quiz link, without answers or counts.");
      await expect(runner.getByText(confirmation, { exact: true })).toHaveAttribute("role", "status");
    });
  }
}
