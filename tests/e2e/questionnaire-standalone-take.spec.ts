import { test, expect } from "@playwright/test";
import dog from "../../lib/questionnaires/data/what-dog-breed-am-i.json";

for (const locale of ["en", "zh"] as const) for (const viewport of [{name: "desktop", width: 1440, height: 1000}, {name: "mobile", width: 390, height: 844}]) {
  test(`@release standalone questionnaire ${locale} ${viewport.name}: introduction, direct answering, complete result and retake`, async ({ page }) => {
    const zh = locale === "zh", landing = `/${locale}/tests/explore/${dog.slug}`;
    await page.setViewportSize(viewport);
    await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
    await page.goto(landing);
    await expect(page.locator("h1")).toHaveText(dog.title[locale]);
    await expect(page.locator("#dog-breed-library")).toBeAttached();
    await expect(page.locator("[data-stage]")).toHaveCount(0);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${landing}/take(?:\\?|$)`));
    await expect(page.locator("[data-questionnaire-take]")).toBeVisible();
    await expect(page.locator("#dog-breed-library")).toHaveCount(0);
    await expect(page.locator(".explore-intro")).toHaveCount(0);
    await expect(page.getByRole("link", { name: zh ? "返回测评介绍" : "Back to assessment" })).toHaveAttribute("href", landing);
    for (let i = 0; i < dog.questions.length; i++) {
      const question = dog.questions[i];
      await expect(page.locator("#take-test h2")).toHaveText(question.prompt[locale]);
      await page.locator(`input[name="${question.id}"]`).first().check();
      await page.getByRole("button", { name: i === dog.questions.length - 1 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一题" : "Next"), exact: true }).click();
    }
    await expect(page.locator('#take-test[data-stage="result"]')).toBeVisible();
    await expect(page.locator("#take-test")).toContainText(dog.profiles[0].title[locale]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`dog-result-${locale}-${viewport.name}.png`), fullPage: true });
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.locator("#take-test input:checked")).toHaveCount(0);
    await expect(page.locator("#take-test h2")).toHaveText(dog.questions[0].prompt[locale]);
    await page.screenshot({ path: test.info().outputPath(`dog-answer-${locale}-${viewport.name}.png`), fullPage: true });
  });
}

for (const locale of ["en", "zh"] as const) {
  test(`@release standalone questionnaire ${locale}: optional draft survives refresh and clears on explicit exit`, async ({ page }) => {
    const zh = locale === "zh", path = `/${locale}/tests/explore/${dog.slug}/take?start=1`;
    await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
    await page.goto(path);
    await page.getByRole("radio").first().check();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.reload();
    await page.locator("[data-questionnaire-resume]").click();
    await expect(page.locator("#take-test h2")).toHaveText(dog.questions[1].prompt[locale]);
    await page.getByRole("button", { name: zh ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click();
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), dog.slug)).toBeNull();
    expect(new URL(page.url()).searchParams.has("answers")).toBe(false);
  });
}

for (const locale of ["en", "zh"] as const) for (const width of [390, 1440]) {
  test(`@release shared answering templates ${locale} ${width}: scale, pair and scenario retain their responsive layouts`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
    for (const entry of [
      { slug: "cognitive-functions-test", edition: "ratings32", template: "scale", options: 5 },
      { slug: "disc", edition: "", template: "pair", options: 2 },
      { slug: dog.slug, edition: "", template: "scenario", options: 4 },
    ]) {
      await page.goto(`/${locale}/tests/explore/${entry.slug}/take?start=1${entry.edition ? `&edition=${entry.edition}` : ""}`);
      const first = page.locator("[data-questionnaire-take] input[type=radio]").first();
      await expect(first).toBeEnabled();
      await expect(page.locator('[data-preparing="true"]')).toHaveCount(0);
      const group = page.locator(`[data-take-template="${entry.template}"]`);
      const labels = group.locator(":scope > label:not([data-unscored])");
      await expect(labels).toHaveCount(entry.options);
      const layout = await labels.evaluateAll(nodes => {
        const rectangles = nodes.map(node => node.getBoundingClientRect());
        return { columns: rectangles.filter(rect => Math.abs(rect.top - rectangles[0].top) < 1).length, colors: nodes.map(node => getComputedStyle(node).backgroundColor) };
      });
      expect(layout.columns).toBe(width < 640 ? 1 : entry.template === "scale" ? 5 : 2);
      if (entry.template === "scale") expect(new Set(layout.colors).size).toBe(5);
      await first.check();
      await expect(first).toBeChecked();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  });
}
