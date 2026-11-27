import { isArchivedEntertainmentPath } from "../../lib/seo/discoverabilityExposurePolicy";
import { expectStandaloneObservationPrivacy } from "./helpers/standalone-observation-flow";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "@/lib/questionnaires/types";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/perfectionism.json", "utf8")) as Questionnaire;
async function finish(page: Page, locale: "en" | "zh", value: "1" | "4" | "7") {
  for (const [index, item] of quiz.questions.entries()) {
    await expect(page.getByRole("heading", { level: 2, name: item.prompt[locale], exact: true })).toBeVisible();
    await expect(page.getByRole("radio")).toHaveCount(7);
    const radio = page.locator(`input[name="${item.id}"][value="${value}"]`);
    if (index === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  await expect(page.locator("[data-saps-result]")).toBeVisible();
  for (const id of ["standards", "discrepancy"]) await expect(page.locator(`[data-saps-mean="${id}"]`)).toContainText(Number(value).toFixed(2));
  for (const profile of quiz.profiles) {
    await expect(page.locator(`[data-saps-result] a[href="/${locale}/tests/explore/${quiz.slug}/results/${profile.id}"]`)).toBeVisible();
  }
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/perfectionism`;
  test(`@release SAPS ${locale}: seven anchors, complete two-dimensional results, retake and public guides`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const privatePosts: string[] = [];
    page.on("request", request => { if (request.method() === "POST" && /saps-0[1-8]/.test(request.postData() ?? "")) privatePosts.push(request.url()); });
    await page.goto(entry); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.locator("[data-saps-attribution]")).toBeVisible();
    const method = page.locator('section[aria-labelledby="questionnaire-method"]');
    await expect(method.getByRole("heading", { level: 2 })).toBeVisible();
    for (const profile of quiz.profiles) await expect(page.getByRole("link", { name: profile.title[locale], exact: true })).toBeVisible();
    await page.locator("[data-explore-start]:visible").first().click();
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 });
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    await finish(page, locale, "4"); expect(privatePosts).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click();
    await expect(page.getByRole("radio").first()).not.toBeChecked();
    await finish(page, locale, "7");
    await page.getByRole("link", { name: zh ? "阅读这一维度的完整公开指南" : "Read this dimension’s complete public guide", exact: true }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.profiles[0].title[locale]);
    const guidePath = new URL(page.url()).pathname;
    if (isArchivedEntertainmentPath(guidePath)) {
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /^noindex, follow(?:,|$)/u);
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
    } else {
      await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href", "https://fermatmind.com/zh/tests/explore/perfectionism/results/standards-reading");
    }
  });

  test(`@release SAPS ${locale}: edit locally, then clear answers when refreshing, changing language or leaving`, async ({ page }) => {
    await expectStandaloneObservationPrivacy(page, entry, quiz);
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/${quiz.slug}/take`);
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator("#take-test").getByRole("radio", { checked: true })).toHaveCount(0);
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
  });

  test(`@release SAPS ${locale}: storage and clipboard denial preserve completion and a safe public share`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(key) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic denial"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (key.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic denial"); return set.call(this, key, value); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic denial"); } } });
    });
    await page.goto(entry); await page.locator("[data-explore-start]:visible").first().click();
    await expect(page.locator("#take-test").getByRole("radio").first()).toBeVisible({ timeout: 30000 }); await expect(page.locator("#take-test").getByRole("checkbox")).toHaveCount(0); await finish(page, locale, "1");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click();
    const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(text).not.toMatch(/saps-0[1-8]|answers|mean|sum|[?&]score/); const url = new URL(text.split("\n").at(-1)!);
    expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
  });
}
test("@release SAPS six local public images and closed profile identities", async ({ request }, testInfo) => {
  expect((await request.get("/en/tests/explore/perfectionism/results/unknown")).status()).toBe(404);
  for (const locale of ["en", "zh"]) for (const profile of [null, ...quiz.profiles]) {
    const response = await request.get(`/og/fun/perfectionism?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`);
    expect(response.status()).toBe(200); const png = await response.body(); expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
    if (locale === "zh") await testInfo.attach(`SAPS-Chinese-${profile?.id ?? "entry"}`, { body: png, contentType: "image/png" });
  }
});
