import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/philosopher-personality-test.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", mode: "single" | "tie") {
  const runner = page.locator('#take-test[data-stage]');
  for (const [index, question] of quiz.questions.entries()) {
    const option = mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "socrates") ?? question.options[0];
    const radio = runner.getByRole("radio", { name: option.label[locale], exact: true });
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    await expect(runner.locator("[data-archetype-count]")).toHaveCount(0);
    await runner.locator("[data-questionnaire-next]").click();
  }
  await expect(runner.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  await expect(runner.locator("[data-archetype-count]")).toHaveCount(9);
  const matches = mode === "tie" ? quiz.profiles : quiz.profiles.slice(0, 1);
  await expect(runner.locator("[data-archetype-match]")).toHaveCount(matches.length);
  for (const profile of matches) {
    await expect(runner.locator(`[data-archetype-count="${profile.id}"]`)).toContainText(mode === "tie" ? "2 / 8" : "8 / 8");
    const match = runner.locator(`[data-archetype-match="${profile.id}"]`);
    for (const section of profile.sections) await expect(match.locator(`#report-${profile.id}-${section.id} h4`)).toHaveText(section.title[locale]);
    await expect(match.getByRole("link", { name: locale === "zh" ? "预览这份公开阅读指南的分享图（新标签页）" : "Preview this public reading guide’s share card (new tab)" })).toHaveAttribute("href", new RegExp(`portrait=${profile.id}&v=1.1.0-reading`));
  }
  const ids = await runner.locator("[id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) for (const device of ["mobile", "desktop"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/philosopher-personality-test`;
  test(`@release Philosopher ${locale} ${device}: examples, real choices, every tie, share and retake`, async ({ page }) => {
    await page.setViewportSize(device === "mobile" ? { width: 390, height: 844 } : { width: 1280, height: 900 });
    await page.addInitScript(() => {
      localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied" }));
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    const posts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /PHIL_[0-9]{2}/.test(request.postData() ?? "")) posts.push(request.url()); });
    await page.goto(entry);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.locator('link[hreflang="zh-CN"]')).toHaveAttribute("href", `https://fermatmind.com/zh/tests/explore/${quiz.slug}`);
    await page.getByRole("link", { name: zh ? "先看阅读结果示例" : "See sample reading results" }).click();
    for (const [index, count] of [1, 2, 9].entries()) await expect(page.locator(`[data-philosopher-example="${index}"]`).getByRole("link")).toHaveCount(count);
    await page.locator('[data-philosopher-example="1"] summary').click();
    await expect(page.locator('[data-philosopher-example="1"]')).toContainText("BCBBDBBADDCCABCCBA");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect(page).toHaveURL(/\/take(?:\?start=1)?$/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    const runner = page.locator('#take-test[data-stage]');
    await runner.locator("[data-questionnaire-next]").click();
    await expect(runner.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    const mode = device === "mobile" ? "single" : "tie";
    await finish(page, locale, mode);
    await runner.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const shared = await runner.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(shared.split("\n").at(-1)).toBe(`https://fermatmind.com${mode === "single" ? `${entry}/results/socrates` : entry}`);
    for (const profile of mode === "single" ? quiz.profiles.slice(0, 1) : quiz.profiles) expect(shared).toContain(profile.title[locale]);
    expect(shared).not.toMatch(/PHIL_[0-9]{2}|answers|form_code|submission|[?&]score/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:philosopher-personality-test"))).toBeNull();
    await runner.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(runner.locator("[data-archetype-count]")).toHaveCount(0);
    await expect(runner.getByRole("radio").first()).not.toBeChecked();
    await page.getByRole("link", { name: zh ? "返回测评介绍" : "Back to assessment" }).click();
    await expect(page).toHaveURL(new RegExp(`${entry}$`));
    expect(posts).toEqual([]);
  });
}

test("@release Philosopher all18public guides, bilingual share images and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/${quiz.slug}/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
    await expect(page.locator('link[hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${profile.id}`);
    await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/${quiz.slug}#take-test`);
    await expect(page.locator("[data-quiz-artwork]")).toHaveAttribute("data-quiz-artwork", profile.id);
    const imageUrl = new URL((await page.locator('meta[property="og:image"]').getAttribute("content"))!);
    expect(imageUrl.searchParams.get("v")).toBe("1.1.0-art");
    const image = await request.get(imageUrl.pathname + imageUrl.search); expect(image.status()).toBe(200);
    const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/philosopher-personality-test/results/unknown", "/zh/tests/explore/philosopher-personality-test/results/PHIL_01", "/en/tests/play/philosopher-personality-test"]) expect((await request.get(path)).status()).toBe(404);
});
