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
  test(`@release standalone questionnaire ${locale}: no save or exit controls, reload starts fresh`, async ({ page }) => {
    const path = `/${locale}/tests/explore/${dog.slug}/take`;
    await page.goto(path);
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Exit and clear|退出并清除/ })).toHaveCount(0);
    await page.getByRole("radio").first().check();
    await expect(page.locator("#take-test h2")).toHaveText(dog.questions[1].prompt[locale]);
    await page.getByRole("button", { name: locale === "zh" ? "上一题" : "Back", exact: true }).click();
    await expect(page.getByRole("radio").first()).toBeChecked();
    // Clicking the same selection after Back also advances, without changing its value.
    await page.getByRole("radio").first().click();
    await expect(page.locator("#take-test h2")).toHaveText(dog.questions[1].prompt[locale]);
    await page.reload();
    await expect(page.locator("#take-test h2")).toHaveText(dog.questions[0].prompt[locale]);
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
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

for (const locale of ["en", "zh"] as const) {
  test(`@release automatic scale ${locale}: seven sins completes all 28 questions without Next`, async ({ page }) => {
    await page.goto(`/${locale}/tests/explore/seven-sins-virtues-test/take`);
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Exit and clear|退出并清除/ })).toHaveCount(0);
    for (let question = 1; question <= 28; question++) {
      await expect(page.locator("#take-test")).toContainText(locale === "zh" ? `第 ${question} 题 / 共 28 题` : `Question ${question} of 28`);
      await page.getByRole("radio").last().check();
    }
    await expect(page.locator('#take-test[data-stage="result"]')).toBeVisible();
    await expect(page.getByRole("button", { name: locale === "zh" ? "重新测试" : "Retake test", exact: true })).toBeVisible();
    expect(await page.evaluate(() => Object.keys(sessionStorage).filter(key => key.startsWith("fm_questionnaire_draft:")))).toEqual([]);
  });
}

for (const locale of ["en", "zh"] as const) {
  test(`@release automatic multi-part ${locale}: Most and Least must both be answered`, async ({ page }) => {
    await page.goto(`/${locale}/tests/explore/caliper-style-assessment-test/take`);
    const most = page.locator('input[name$="-most"]'), least = page.locator('input[name$="-least"]');
    const firstName = await most.first().getAttribute("name");
    await most.first().check();
    await expect(least.first()).toBeDisabled();
    await expect(page.locator('input[name$="-most"]').first()).toHaveAttribute("name", firstName!);
    await least.nth(1).check();
    await expect(page.locator('input[name$="-most"]').first()).not.toHaveAttribute("name", firstName!);
    await page.getByRole("button", { name: locale === "zh" ? "上一组" : "Back", exact: true }).click();
    await expect(most.first()).toBeChecked(); await expect(least.nth(1)).toBeChecked();
    await expect(page.getByRole("button", { name: /Clear and exit|清空并退出/ })).toHaveCount(0);
    await most.first().click();
    await expect(most.first()).not.toHaveAttribute("name", firstName!);
  });
}

for (const locale of ["en", "zh"] as const) {
  test(`@release automatic branching story ${locale}: complete ending and restart`, async ({ page }) => {
    await page.goto(`/${locale}/tests/play/story-ending/take`);
    for (const question of ["q1", "q2", "q4"]) await page.locator(`input[name="${question}"]`).first().check();
    await expect(page.locator('#play[data-stage="result"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /Exit and clear|退出并清除/ })).toHaveCount(0);
    await page.getByRole("button", { name: locale === "zh" ? "重新测试" : "Retake quiz", exact: true }).click();
    await page.locator('input[name="q1"]').last().check();
    await page.locator('input[name="q3"]').last().check();
    await page.locator('input[name="q6"]').last().check();
    await expect(page.locator('#play[data-stage="result"]')).toBeVisible();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_fun_draft:story-ending"))).toBeNull();
  });
}
