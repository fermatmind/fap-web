import { entertainmentGuideProfile, entertainmentGuideStartLabel } from "../../lib/questionnaires/entertainmentGuideSeo";
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/adult-age-preferences.json", "utf8")) as Questionnaire;
const source = JSON.parse(readFileSync("tests/fixtures/questionnaires/age-preference-reference.json", "utf8")) as {
  source_count_vectors: { option_codes: string; counts: number[] }[];
};
const root = "https://fermatmind.com";
const path = (locale: "en" | "zh") => `/${locale}/tests/explore/${quiz.slug}`;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
  await page.route(url => /attribution\/events|\/api\/track|googletagmanager|google-analytics|hm\.baidu\.com/.test(url.href), route => route.abort());
});

async function answer(page: Page, locale: "en" | "zh", profileIndex: number, checkBack = false) {
  const zh = locale === "zh";
  const profile = quiz.profiles[profileIndex];
  const ids = quiz.directions.map(direction => direction.id);
  const witness = source.source_count_vectors.find(({ counts }) =>
    ids.filter((_, i) => counts[i] === Math.max(...counts)).join("|") === profile.directionIds.join("|"),
  )!;
  const option = (index: number) => page.locator(`input[name="${quiz.questions[index].id}"][value="${witness.option_codes[index]}"]`);
  const counts = page.getByRole("region", { name: zh ? "本次原始选择次数" : "Raw choice counts for this attempt", exact: true });
  await expect(counts).toHaveCount(0);
  await expect(option(0)).not.toBeChecked();
  if (checkBack) {
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await option(0).focus();
    await page.keyboard.press("Space");
    await expect(option(1)).toBeVisible();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(option(0)).toBeChecked();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
  }
  for (let i = checkBack ? 1 : 0; i < quiz.questions.length; i++) {
    await option(i).check();
  }
  await expect(page.getByRole("heading", { level: 2, name: profile.title[locale], exact: true })).toBeFocused();
  await expect(counts).toBeVisible();
  await expect(counts.locator("dd")).toHaveText(witness.counts.map(value => `${value} / 12`));
  await expect(counts).toContainText(profileIndex === 6 ? (zh ? "三项各选 6 次" : "All three were chosen 6 times") :
    profile.directionIds.length === 2 ? (zh ? "两项同为最高" : "Two contexts share the highest count") :
      (zh ? "最高项是你" : "The highest count"));
  const card = page.getByRole("link", { name: zh ? "打开结果分享图" : "Open result share card", exact: true });
  const image = new URL((await card.getAttribute("href"))!, root);
  expect(image.pathname).toBe(`/og/fun/${quiz.slug}`);
  expect(Object.fromEntries(image.searchParams)).toEqual({ locale, portrait: profile.id, v: quiz.version + "-art" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  return profile;
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh";
  const entry = path(locale);
  for (const viewport of ["mobile", "desktop"] as const) {
    test(`@release ${locale} ${viewport}: entry, sample counts, private result, share and retake`, async ({ page }) => {
      await page.setViewportSize(viewport === "mobile" ? { width: 390, height: 844 } : { width: 1440, height: 900 });
      await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } }));
      const posts: string[] = [];
      page.on("request", request => {
        if (request.method() === "POST" && /AGE_FC_/.test(request.postData() ?? "")) posts.push(request.url());
      });
      await page.goto(entry);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", root + entry);
      await expect(page.locator('link[hreflang="zh-CN"]')).toHaveAttribute("href", root + path("zh"));
      await expect(page.locator('link[hreflang="en"]')).toHaveAttribute("href", root + path("en"));
      await page.getByRole("link", { name: zh ? "先看结果示例" : "See a sample result" }).click();
      await expect(page.locator("#age-result-examples dd")).toHaveText(["8", "7", "3", "8", "8", "2", "6", "6", "6"]);
      await page.getByRole("button", { name: zh ? "开始免费测试" : "Start the free test" }).click();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", root + entry);
      const indices = viewport === "mobile" ? [0, 3, 6] : [1, 2, 4, 5];
      for (const [i, index] of indices.entries()) {
        if (i) await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
        await answer(page, locale, index, i === 0);
      }
      const profile = quiz.profiles[indices.at(-1)!];
      await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link" }).click();
      const copied = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
      expect(copied).toBe(`${quiz.title[locale]}\n${profile.title[locale]}\n${root}${entry}/results/${profile.id}`);
      expect([...new URL(page.url()).searchParams]).toEqual(new URL(page.url()).search ? [["start", "1"]] : []);
      expect(posts).toEqual([]);
      await page.getByRole("link", { name: zh ? "返回测试介绍" : "Back to quiz introduction" }).click();
      await expect(page).toHaveURL(url => url.pathname === entry, { timeout: 20_000 });
    });
  }

  test(`@release ${locale}: all seven guides and public cards`, async ({ page, request }) => {
    for (const profile of quiz.profiles) {
      const guide = `${entry}/results/${profile.id}`;
      expect((await page.goto(guide))?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(entertainmentGuideProfile(quiz.slug, locale, profile).title[locale]);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", root + guide);
      await expect(page.getByRole("region", { name: zh ? "本次原始选择次数" : "Raw choice counts for this attempt" })).toHaveCount(0);
      for (const section of profile.sections) {
        for (const p of section.paragraphs) await expect(page.locator(`#report-${section.id}`)).toContainText(p[locale]);
      }
      const image = new URL((await page.locator('meta[property="og:image"]').first().getAttribute("content"))!);
      expect(image.searchParams.get("portrait")).toBe(profile.id);
      const response = await request.get(image.pathname + image.search);
      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("image/png");
      const bytes = await response.body();
      expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)]).toEqual([1200, 630]);
    }
    await page.getByRole("link", { name: entertainmentGuideStartLabel(quiz.slug, locale), exact: true }).first().click();
    await expect(page).toHaveURL(url => url.pathname === entry, { timeout: 20_000 });
    expect((await request.get(`${entry}/results/SINGLE_OLDER`)).status()).toBe(404);
    expect((await request.get(`/og/fun/${quiz.slug}?portrait=SINGLE_OLDER`)).status()).toBe(404);
  });
}
