import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/space-marine-chapter.json", "utf8")) as Questionnaire;
test.beforeEach(async ({page}) => { await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({analytics: "denied"})); }); });
const twoWay = ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "B", "A", "A", "D", "D", "D", "C"];
async function finish(page: Page, locale: "en" | "zh", mode: "single" | "tie" | "two") {
  for (const [index, question] of quiz.questions.entries()) {
    const option = mode === "two" ? question.options.find(o => o.id === twoWay[index])! : mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "ultramarines") ?? question.options[0];
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    await page.getByRole("button", { name: index === 17 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  const matched = mode === "tie" ? 6 : mode === "two" ? 2 : 1;
  await expect(page.locator("[data-archetype-match]")).toHaveCount(matched);
  await expect(page.locator("[data-archetype-match] h4")).toHaveCount(matched * 9);
  await expect(page.locator("[data-space-marine-reveal] li")).toHaveCount(matched);
  if (mode === "tie") for (const theme of quiz.directions) await expect(page.locator(`[data-archetype-count="${theme.id}"]`)).toContainText("3 / 12");
  else await expect(page.locator('[data-archetype-count="ultramarines"]')).toContainText(mode === "two" ? "5 / 12" : "12 / 12");
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/space-marine-chapter`;
  for (const width of [390, 1440]) for (const mode of ["single", "tie"] as const) {
    test(`@release Space Marine ${locale} ${width}: ${mode}, full readings, public card, clipboard fallback and retake`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const privatePosts: string[] = [];
      page.on("request", r => { if (r.method() === "POST" && /SMC_[0-9]{2}/.test(r.postData() ?? "")) privatePosts.push(r.url()); });
      await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({analytics: "denied", updatedAt: new Date().toISOString()})); Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic denial"); } } }); });
      await page.goto(entry);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
      await expect(page.getByText(zh ? "这个测试怎样回答“我属于哪个星际战士战团”？" : "What Space Marine Chapter am I in this quiz?", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${entry}/take$`));
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
      await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
      await page.getByRole("radio").first().check();
      await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
      await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
      await expect(page.getByRole("radio").first()).toBeChecked();
      // Reset first choice so keyboard toggling in finish selects it in either mode.
      await page.reload();
      await finish(page, locale, mode);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const reveal = page.locator("[data-space-marine-reveal]");
      await reveal.getByRole("button", { name: new RegExp(zh ? "预览公开分享卡" : "Preview public share card") }).first().click();
      const image = page.locator("[data-space-marine-share-card] img");
      await expect(image).toBeVisible();
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1200);
      const download = page.waitForEvent("download");
      await page.getByRole("button", { name: zh ? "下载公开分享卡" : "Download public share card", exact: true }).click();
      expect((await download).suggestedFilename()).toBe(`fermatmind-ultramarines-${locale}.png`);
      await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
      const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
      expect(text).not.toMatch(/SMC_[0-9]{2}|answers|submission|3\s*\/\s*12|[?&]score/);
      if (mode === "tie") for (const profile of quiz.profiles) expect(text).toContain(profile.title[locale]);
      expect(new URL(text.split("\n").at(-1)!).pathname).toBe(mode === "single" ? `${entry}/results/ultramarines` : entry);
      await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
      await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
      await expect(page.getByRole("radio").first()).not.toBeChecked();
      await page.getByRole("link", { name: zh ? "返回测评介绍" : "Back to assessment" }).click();
      await expect(page).toHaveURL(new RegExp(`${entry}$`));
      const other = zh ? "en" : "zh";
      if (width === 390) {
        await expect(page.locator("[data-site-header-ready]")).toHaveAttribute("data-site-header-ready", "true");
        await page.getByRole("button", {name: zh ? "菜单" : "Menu", exact: true}).click();
        await page.locator(`a[href="/${other}/tests/explore/space-marine-chapter"]`).first().click();
      } else {
        const alternate = await page.locator(`link[hreflang="${zh ? "en" : "zh-CN"}"]`).getAttribute("href");
        await page.goto(new URL(alternate!).pathname);
      }
      await expect(page.getByRole("heading", {level: 1})).toHaveText(quiz.title[other]);
      expect(privatePosts).toEqual([]);
    });
  }
  test(`@release Space Marine ${locale}: two highest and failed card download remain usable`, async ({ page }) => {
    await page.goto(`${entry}/take`); await finish(page, locale, "two");
    await page.locator("[data-space-marine-reveal]").getByRole("button").first().click();
    await page.route("**/og/fun/space-marine-chapter?**", route => route.fulfill({ status: 503, body: "unavailable" }));
    await page.getByRole("button", { name: zh ? "下载公开分享卡" : "Download public share card", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "暂时无法下载" : "Download is unavailable");
    await expect(page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true })).toBeEnabled();
  });
}

test("@release Space Marine: all twelve public guides, bilingual cards and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/space-marine-chapter/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    await expect(page.locator('[data-space-marine-chapter-result-reading] h2')).toHaveCount(9);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/space-marine-chapter/results/${profile.id}`);
    await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href", `https://fermatmind.com/zh/tests/explore/space-marine-chapter/results/${profile.id}`);
    if (locale === "zh") await expect(page.locator("body")).not.toContainText("别站九");
    const image = await request.get(`/og/fun/space-marine-chapter?locale=${locale}&portrait=${profile.id}&v=${quiz.version}-craft`);
    expect(image.status()).toBe(200); const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/space-marine-chapter/results/unknown", "/zh/tests/explore/space-marine-chapter/results/SMC_01", "/en/tests/play/space-marine-chapter"]) expect((await request.get(path)).status()).toBe(404);
});

for (const locale of ["en", "zh"] as const) test(`@release Space Marine ${locale}: directory card opens the same test`, async ({page}) => {
  await page.goto(`/${locale}/tests`);
  const card = page.locator("#more-tests").getByRole("link", {name: quiz.title[locale], exact: true});
  await expect(card).toHaveAttribute("href", `/${locale}/tests/explore/space-marine-chapter`);
  await card.click();
  await expect(page.getByRole("heading", {level: 1})).toHaveText(quiz.title[locale]);
});
