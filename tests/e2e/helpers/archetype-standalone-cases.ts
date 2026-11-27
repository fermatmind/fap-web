import { test, expect, type Page } from "@playwright/test";
import { archiveTopic } from "../../../lib/entertainment/archive90";
import type { Questionnaire } from "../../../lib/questionnaires/types";

export function archetypeStandaloneCases(quiz: Questionnaire, label: string, winner: string, questionIdPrefix: string) {
  const questionId = new RegExp(`${questionIdPrefix}_[0-9]{2}`, "u");

  async function finish(page: Page, locale: "en" | "zh", mode: "unique" | "tie") {
    const engine = page.locator("#take-test");
    for (const [index, question] of quiz.questions.entries()) {
      const option = mode === "tie" ? question.options[0] : question.options.find(option => option.directionId === winner) ?? question.options[0];
      const radio = engine.locator(`input[name="${question.id}"][value="${option.id}"]`);
      await expect(engine.locator("[data-archetype-count]")).toHaveCount(0);
      if (index === 0) {
        await radio.focus();
        await page.keyboard.press("Space");
      } else {
        await radio.click();
      }
      await expect(radio).toHaveCount(0);
    }
    await expect(engine).toHaveAttribute("data-stage", "result");
    await expect(engine.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
    await expect(engine.locator("[data-archetype-count]")).toHaveCount(quiz.directions.length);
    const expected = mode === "tie" ? quiz.profiles.map(profile => profile.id) : [winner];
    await expect(engine.locator("[data-archetype-match]")).toHaveCount(expected.length);
    for (const id of expected) {
      const match = engine.locator(`[data-archetype-match="${id}"]`);
      await expect(match.locator(`a[href="/${locale}/tests/explore/${quiz.slug}/results/${id}"]`)).toBeVisible();
      const opportunities = quiz.questions.filter(question => question.options.some(option => option.directionId === id)).length;
      const selections = mode === "tie" ? quiz.questions.filter(question => question.options[0].directionId === id).length : opportunities;
      await expect(engine.locator(`[data-archetype-count="${id}"]`)).toContainText(`${selections} / ${opportunities}`);
    }
    const ids = await engine.locator("[id]").evaluateAll(nodes => nodes.map(node => node.id));
    expect(new Set(ids).size).toBe(ids.length);
  }

  for (const locale of ["en", "zh"] as const) {
    const zh = locale === "zh";
    const entry = `/${locale}/tests/explore/${quiz.slug}`;
    const firstRadio = (page: Page) => page.locator(`#take-test input[name="${quiz.questions[0].id}"]`);
    const secondRadio = (page: Page) => page.locator(`#take-test input[name="${quiz.questions[1].id}"]`);

    test(`@release ${label} fan choices ${locale}: hub, keyboard, unique match and retake`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const posts: string[] = [];
      page.on("request", request => {
        if (request.method() === "POST" && questionId.test(request.postData() ?? "")) posts.push(request.url());
      });
      await page.goto(`/${locale}/tests`);
      await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
      await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).first().click();
      await expect(page).toHaveURL(new RegExp(`${entry}/take(?:[?]start=1)?$`));
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await page.locator("#take-test [data-questionnaire-next]").click();
      await expect(page.locator("#take-test").getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
      await finish(page, locale, "unique");
      await expect(page.locator('[data-archetype-core-assessment="MBTI"] a')).toHaveAttribute("href", `/${locale}/tests/mbti-personality-test-16-personality-types`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click();
      await expect(firstRadio(page).first()).not.toBeChecked();
      expect(posts).toEqual([]);
    });

    test(`@release ${label} fan choices ${locale}: back and edit, reload and language change start fresh`, async ({ page }) => {
      await page.goto(`${entry}/take`);
      await expect(firstRadio(page).first()).toBeVisible();
      await expect(page.locator("#take-test").getByRole("checkbox")).toHaveCount(0);
      await firstRadio(page).nth(1).click();
      await expect(secondRadio(page).first()).toBeVisible();
      await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
      await expect(firstRadio(page).nth(1)).toBeChecked();
      await firstRadio(page).nth(2).click();
      await expect(secondRadio(page).first()).toBeVisible();
      await page.reload();
      await expect(firstRadio(page).first()).toBeVisible();
      await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
      await firstRadio(page).first().click();
      await expect(secondRadio(page).first()).toBeVisible();
      await page.goto(`/${zh ? "en" : "zh"}/tests/explore/${quiz.slug}/take`);
      await expect(firstRadio(page).first()).toBeVisible();
      await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
      expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
    });

    test(`@release ${label} fan choices ${locale}: tied matches and private-safe clipboard fallback without tab storage`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.addInitScript(() => {
        const get = Storage.prototype.getItem;
        const set = Storage.prototype.setItem;
        Storage.prototype.getItem = function(key) {
          if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial");
          return get.call(this, key);
        };
        Storage.prototype.setItem = function(key, value) {
          if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial");
          return set.call(this, key, value);
        };
        Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
      });
      await page.goto(`${entry}/take`);
      await expect(firstRadio(page).first()).toBeVisible();
      await expect(page.locator("#take-test").getByRole("checkbox")).toHaveCount(0);
      await finish(page, locale, "tie");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true }).click();
      const text = await page.locator("[data-archetype-honor-group] textarea").inputValue();
      for (const profile of quiz.profiles) expect(text).toContain(profile.title[locale]);
      expect(text).not.toMatch(questionId);
      expect(text).not.toMatch(/answers|form_code|submission|\d+\s*\/\s*\d+|[?&]score/);
      const url = new URL(text.split("\n").at(-1)!);
      expect(url.pathname).toBe(entry);
      expect(url.search).toBe("");
      expect(url.hash).toBe("");
    });
  }
}

export async function expectArchetypeGuideAlternates(page: Page, slug: string, profileId: string) {
  if (archiveTopic(slug)) {
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /^noindex, follow(?:,|$)/);
    await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
  } else {
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/${slug}/results/${profileId}`);
  }
}
