import { entertainmentGuideProfile } from "../../lib/questionnaires/entertainmentGuideSeo";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/space-marine-chapter.json", "utf8")) as Questionnaire;
test.beforeEach(async ({page}) => { await page.addInitScript(() => {
  localStorage.setItem("fm_consent_v1", JSON.stringify({analytics: "denied"}));
  Object.defineProperty(navigator, "share", {configurable: true, value: undefined});
  const original = CanvasRenderingContext2D.prototype.fillText;
  (window as unknown as {chapterDrawnText: string[]}).chapterDrawnText = [];
  CanvasRenderingContext2D.prototype.fillText = function(value, x, y, maxWidth) {
    (window as unknown as {chapterDrawnText: string[]}).chapterDrawnText.push(value);
    if (maxWidth === undefined) return original.call(this, value, x, y);
    return original.call(this, value, x, y, maxWidth);
  };
}); });
const twoWay = ["A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "A", "B", "A", "A", "D", "D", "D", "C"];
async function finish(page: Page, locale: "en" | "zh", mode: "single" | "tie" | "two") {
  const chosen: Record<string, string> = {};
  for (const [index, question] of quiz.questions.entries()) {
    const option = mode === "two" ? question.options.find(o => o.id === twoWay[index])! : mode === "tie" ? question.options[0] : question.options.find(o => o.directionId === "ultramarines") ?? question.options[0];
    chosen[question.id] = option.id;
    const radio = page.locator(`input[name="${question.id}"][value="${option.id}"]`);
    if (index === 0) { await radio.focus(); await page.keyboard.press("Space"); }
    else await radio.click();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    await expect(radio).toHaveCount(0);
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![locale], exact: true })).toBeFocused();
  const matched = mode === "tie" ? 6 : mode === "two" ? 2 : 1;
  await expect(page.locator("[data-archetype-match]")).toHaveCount(matched);
  await expect(page.locator("[data-archetype-match] h4").first()).toBeVisible();
  await expect(page.locator("[data-space-marine-reveal] > ul > li")).toHaveCount(matched);
  if (mode === "tie") for (const theme of quiz.directions) await expect(page.locator(`[data-archetype-count="${theme.id}"]`)).toContainText("3 / 12");
  else await expect(page.locator('[data-archetype-count="ultramarines"]')).toContainText(mode === "two" ? "5 / 12" : "12 / 12");
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(node => node.id));
  expect(new Set(ids).size).toBe(ids.length);
  const matchedIds = await page.locator("[data-archetype-match]").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-archetype-match")!));
  for (const id of matchedIds) {
    const reasons = page.locator(`[data-space-marine-reasons="${id}"]`);
    await reasons.locator("summary").click();
    const expected = quiz.questions.flatMap(q => {const option = q.options.find(o => o.id === chosen[q.id] && o.directionId === id);return option ? [{q, option}] : [];}).slice(0,2);
    await expect(reasons.locator("q")).toHaveCount(expected.length);
    for (const {q, option} of expected) {await expect(reasons).toContainText(q.prompt[locale]);await expect(reasons).toContainText(option.label[locale]);}
  }
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/space-marine-chapter`;
  for (const width of [390, 1440]) for (const mode of ["single", "tie"] as const) {
    test(`@release Space Marine ${locale} ${width}: ${mode}, choice readings, personal card, clipboard fallback and retake`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const privatePosts: string[] = [];
      page.on("request", r => { if (r.method() === "POST" && /SMC_[0-9]{2}/.test(r.postData() ?? "")) privatePosts.push(r.url()); });
      await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({analytics: "denied", updatedAt: new Date().toISOString()})); Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic denial"); } } }); });
      await page.goto(entry);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
      await expect(page.getByText(zh ? "这个测试怎样回答“我属于哪个星际战士战团”？" : "What Space Marine Chapter am I in this quiz?", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${entry}/take(?:[?]start=1)?$`));
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
      await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
      await page.getByRole("radio").first().click();
      await expect(page.locator(`input[name="${quiz.questions[1].id}"]`).first()).toBeVisible();
      await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
      await expect(page.getByRole("radio").first()).toBeChecked();
      // Reset first choice so keyboard toggling in finish selects it in either mode.
      await page.reload();
      await finish(page, locale, mode);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const honor = page.locator("[data-archetype-honor-group]");
      const [file] = await Promise.all([
        page.waitForEvent("download"),
        honor.getByRole("button", { name: zh ? "保存高清图卡" : "Save PNG Card", exact: true }).click(),
      ]);
      expect(file.suggestedFilename()).toBe(`fermatmind-space-marine-chapter-${locale}.png`);
      const png = readFileSync(await file.path());
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1080, 1440]);
      const drawn = await page.evaluate(() => (window as unknown as {chapterDrawnText: string[]}).chapterDrawnText.join(" "));
      for (const profile of quiz.profiles.filter(profile => mode === "tie" || profile.id === "ultramarines")) {
        expect(drawn.replace(/\s/g, "")).toContain(profile.title[locale].replace(/\s/g, ""));
      }
      expect(drawn).not.toMatch(/SMC_[0-9]{2}|3\s*\/\s*12|12\s*\/\s*12/);
      await honor.getByRole("button", { name: zh ? "打开图片 / 长按保存" : "Open image to save", exact: true }).click();
      await expect(honor.getByRole("dialog").getByRole("img")).toHaveAttribute("src", /^blob:/);
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true }).click();
      const text = await page.locator("[data-archetype-honor-group] textarea").inputValue();
      expect(text).not.toMatch(/SMC_[0-9]{2}|answers|submission|3\s*\/\s*12|[?&]score/);
      if (mode === "tie") for (const profile of quiz.profiles) expect(text).toContain(profile.title[locale]);
      expect(new URL(text.split("\n").at(-1)!).pathname).toBe(entry);
      await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click();
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
  test(`@release Space Marine ${locale}: two highest and image generation failure preserve the result`, async ({ page }) => {
    await page.goto(`${entry}/take`);
    await finish(page, locale, "two");
    const honor = page.locator("[data-archetype-honor-group]");
    await page.evaluate(() => { HTMLCanvasElement.prototype.getContext = () => null; });
    await honor.getByRole("button", { name: zh ? "保存高清图卡" : "Save PNG Card", exact: true }).click();
    await expect(honor.getByRole("status")).toContainText(zh ? "图卡暂时无法生成" : "The card couldn’t be generated");
    await expect(honor.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true })).toBeEnabled();
    await expect(page.locator("[data-archetype-match]")).toHaveCount(2);
  });

}

test("@release Space Marine: all twelve public guides, bilingual cards and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of quiz.profiles) {
    const path = `/${locale}/tests/explore/space-marine-chapter/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(entertainmentGuideProfile(quiz.slug, locale, profile).title[locale]);
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    await expect(page.locator('[data-space-marine-chapter-result-reading] h2')).toHaveCount(9);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/space-marine-chapter/results/${profile.id}`);
    await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href", `https://fermatmind.com/zh/tests/explore/space-marine-chapter/results/${profile.id}`);
    if (locale === "zh") await expect(page.locator("body")).not.toContainText("别站九");
    const image = await request.get(`/og/fun/space-marine-chapter?locale=${locale}&portrait=${profile.id}&v=${quiz.version}-studio`);
    expect(image.status()).toBe(200); const bytes = await image.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
  }
  for (const path of ["/en/tests/explore/space-marine-chapter/results/unknown", "/zh/tests/explore/space-marine-chapter/results/SMC_01", "/en/tests/play/space-marine-chapter"]) expect((await request.get(path)).status()).toBe(404);
});

for (const locale of ["en", "zh"] as const) test(`@release Space Marine ${locale}: directory card opens the same test`, async ({page}) => {
  await page.goto(`/${locale}/tests`);
  const card = page.locator("#more-tests").getByRole("link", {name: quiz.title[locale], exact: true});
  await expect(card).toHaveAttribute("href", `/${locale}/tests/explore/space-marine-chapter`);
  const tile = card.locator("xpath=ancestor::article[1]");
  await expect(tile).toContainText(locale === "zh" ? "战锤40K纸模型情境" : "Warhammer 40K Chapter themes in paper-model scenarios");
  await expect(tile).toContainText(locale === "zh" ? "18 题" : "18 questions");
  await expect(tile.locator("img")).toHaveAttribute("src", "/images/quiz-portraits/space-marine-chapter/ultramarines-studio.webp");
  await card.click();
  await expect(page.getByRole("heading", {level: 1})).toHaveText(quiz.title[locale]);
});

for (const locale of ["en", "zh"] as const) test(`@release Space Marine ${locale}: two-way native share cancellation and clipboard fallback`, async ({ page }) => {
  const zh = locale === "zh";
  const entry = `/${locale}/tests/explore/space-marine-chapter`;
  const unsafe: string[] = [];
  page.on("request", request => {
    if (/SMC_[0-9]{2}|[?&](?:answers|counts|score)=/.test(request.url())) unsafe.push(request.url());
  });
  await page.addInitScript(() => {
    const matchMedia = window.matchMedia.bind(window);
    window.matchMedia = query => {
      const result = matchMedia(query);
      if (query === "(pointer: coarse)") Object.defineProperty(result, "matches", { value: true });
      return result;
    };
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("denied"); } } });
  });
  await page.goto(`${entry}/take`);
  await finish(page, locale, "two");
  const honor = page.locator("[data-archetype-honor-group]");
  const share = honor.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true });
  for (const outcome of ["AbortError", "NotAllowedError", "success"] as const) {
    await page.evaluate(({ outcome, entry }) => {
      Object.defineProperty(navigator, "share", { configurable: true, value: async ({ url, text }: ShareData) => {
        if (url !== `https://fermatmind.com${entry}` || /SMC_[0-9]{2}|answers|score=/u.test(text ?? "")) throw new Error("Unsafe payload");
        if (outcome !== "success") throw new DOMException("Synthetic sharing outcome", outcome);
      } });
    }, { outcome, entry });
    await share.click();
    const caption = honor.locator("textarea");
    if (outcome === "NotAllowedError") {
      await expect(caption).toBeVisible();
      expect((await caption.inputValue()).split("\n").at(-1)).toBe(`https://fermatmind.com${entry}`);
    } else {
      await expect(caption).toHaveCount(0);
      if (outcome === "success") await expect(honor.getByRole("status")).toContainText(zh ? "已打开系统分享" : "Opened system sharing");
    }
  }
  expect(unsafe).toEqual([]);
});
