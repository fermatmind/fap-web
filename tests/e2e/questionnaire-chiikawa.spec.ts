import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/chiikawa.json", "utf8")) as Questionnaire;

async function finish(page: Page, locale: "en" | "zh", mode: "single" | "tie") {
  const runner = page.locator('#take-test[data-stage]');
  for (const [index, question] of quiz.questions.entries()) {
    const option = mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "chiikawa") ?? question.options[0];
    const radio = runner.getByRole("radio", { name: option.label[locale], exact: true });
    if (index === 0) {
      await radio.focus();
      await page.keyboard.press("Space");
      await expect(radio).toBeChecked();
    } else {
      await radio.check();
    }
    await expect(runner.locator("[data-archetype-count]")).toHaveCount(0);
    await runner.locator("[data-questionnaire-next]").click();
  }
  await expect(runner.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(runner.locator("[data-archetype-count]")).toHaveCount(6);
  const ids = await runner.locator("[id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  const matches = mode === "tie" ? quiz.profiles : [quiz.profiles.find(p => p.id === "chiikawa")!];
  await expect(runner.locator("[data-archetype-match]")).toHaveCount(matches.length);
  for (const profile of matches) {
    await expect(runner.locator(`[data-archetype-count="${profile.id}"]`)).toContainText(mode === "tie" ? "3 / 12" : "12 / 12");
    const match = runner.locator(`[data-archetype-match="${profile.id}"]`);
    for (const section of profile.sections) {
      await expect(match.locator(`#report-${profile.id}-${section.id} h4`)).toHaveText(section.title[locale]);
    }
    await expect(match.locator(`[data-portrait-art="${profile.id}"] img`)).toHaveAttribute("src", `/images/quiz-portraits/chiikawa/${profile.id}.webp`);
  }
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/chiikawa`;
  for (const device of ["mobile", "desktop"] as const) {
    test(`@release Chiikawa ${locale} ${device}: real choices, result, share, guide, and retake`, async ({ page }) => {
      const mode = device === "mobile" ? "single" : "tie";
      await page.setViewportSize(device === "mobile" ? { width: 390, height: 844 } : { width: 1280, height: 900 });
      await page.addInitScript(() => {
        localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied" }));
        Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
      });
      const answerPosts: string[] = [];
      page.on("request", request => { if (request.method() === "POST" && /CHIIKAWA_[0-9]{2}/.test(request.postData() ?? "")) answerPosts.push(request.url()); });
      await page.goto(entry);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
      await page.getByRole("link", { name: zh ? "先看角色结果示例" : "See sample character results" }).click();
      const examples = page.locator("#chiikawa-examples");
      await expect(examples.locator("article").first().getByRole("link")).toHaveCount(1);
      await expect(examples.locator("article").last().getByRole("link")).toHaveCount(2);
      await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
      await expect(page).toHaveURL(/\/take\?start=1$/);
      const runner = page.locator('#take-test[data-stage]');
      const first = runner.getByRole("radio").first();
      await expect(first).toBeVisible();
      await runner.locator("[data-questionnaire-next]").click();
      await expect(runner.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
      await first.check();
      await runner.locator("[data-questionnaire-next]").click();
      await runner.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
      await expect(first).toBeChecked();
      await page.reload();
      await expect(first).not.toBeChecked();
      await finish(page, locale, mode);
      if (mode === "tie") {
        await runner.getByRole("navigation", { name: zh ? "跳到匹配结果" : "Jump to a match" }).getByRole("link").last().click();
        await expect(page).toHaveURL(/#animal-title-rakko$/);
      }
      await runner.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
      const shared = await runner.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
      const sharePath = mode === "single" ? `${entry}/results/chiikawa` : entry;
      expect(shared.split("\n").at(-1)).toBe(`https://fermatmind.com${sharePath}`);
      for (const profile of mode === "tie" ? quiz.profiles : quiz.profiles.slice(0, 1)) expect(shared).toContain(profile.title[locale]);
      expect(shared).not.toMatch(/CHIIKAWA_[0-9]{2}|answers|form_code|submission|\d+\s*\/\s*12|[?&]score/);
      const guide = runner.locator(`a[href="${entry}/results/chiikawa"]`);
      await expect(guide).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await runner.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
      await expect(runner.locator("[data-archetype-count]")).toHaveCount(0);
      await expect(first).not.toBeChecked();
      await page.getByRole("link", { name: zh ? "返回测评介绍" : "Back to assessment" }).click();
      await expect(page).toHaveURL(new RegExp(`${entry}$`));
      expect(answerPosts).toEqual([]);
    });
  }
}

test("@release Chiikawa fan choices all12public full guides, bilingual images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/chiikawa/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("#take-test [data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/chiikawa/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/chiikawa#take-test`);
    const portrait = page.locator(`main img[src="/images/quiz-portraits/chiikawa/${profile.id}.webp"]`);
    await expect(portrait).toBeVisible();
    await expect.poll(() => portrait.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBe(640);
    const ogUrl = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogUrl).toContain(`/og/fun/chiikawa?locale=${locale}&portrait=${profile.id}&v=1.0.0-art`);
    const image = await request.get(new URL(ogUrl!).pathname + new URL(ogUrl!).search); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/chiikawa/results/unknown", "/zh/tests/explore/chiikawa/results/CHIIKAWA_01", "/en/tests/play/chiikawa"]) expect((await request.get(path)).status()).toBe(404);
});
