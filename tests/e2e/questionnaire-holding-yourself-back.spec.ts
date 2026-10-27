import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { HoldingBack35Questionnaire } from "../../lib/questionnaires/holdingBack35";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/holding-yourself-back.json", "utf8")) as HoldingBack35Questionnaire;
test.beforeEach(async ({ page }) => { await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() }))); });
async function visibleQuestion(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    const h = document.querySelector("#take-test h2"), p = document.querySelector("#take-test progress"), c = p?.previousElementSibling;
    const bottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    return !!h && !!p && !!c && [h, p, c].every(e => e.getBoundingClientRect().top >= bottom) && document.documentElement.scrollWidth <= innerWidth;
  })).toBe(true);
}
async function finish(page: Page, locale: "en" | "zh", mode: "minimum" | "maximum" | "mixed" | "one-na" | "all-na") {
  for (const [i, q] of quiz.questions.entries()) {
    if (i === 1) await visibleQuestion(page);
    const value = mode === "all-na" || mode === "one-na" && i === 0 ? "na" : mode === "minimum" ? "1" : mode === "maximum" ? "5" : String(i % 5 + 1);
    const radio = page.locator(`input[name="${q.id}"][value="${value}"]`);
    if (i === 0) { await radio.focus(); await radio.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    if (i < 34) await expect(page.locator("[data-holding-back35-result]")).toHaveCount(0);
    await page.getByRole("button", { name: i === 34 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-holding-back35-result]")).toBeVisible();
  expect(await page.locator("[data-holding-back35-part]").evaluateAll(nodes => nodes.map(n => n.getAttribute("data-holding-back35-part"))))
    .toEqual(quiz.directions.map(d => d.id));
  for (const [j, d] of quiz.directions.entries()) {
    const mean = page.locator(`[data-holding-back35-part="${d.id}"] [data-holding-back35-mean]`);
    if (mode === "all-na" || mode === "one-na" && j === 0) await expect(mean).toContainText(locale === "zh" ? "资料不足" : "Insufficient information");
    else await expect(mean).toContainText(mode === "minimum" ? "1.0 / 5" : mode === "maximum" ? "5.0 / 5" : "3.0 / 5");
  }
  await expect(page.locator("[data-holding-back35-guide]")).toHaveCount(7);
  for (const p of quiz.profiles) {
    const guide = page.locator(`[data-holding-back35-guide="${p.id}"]`);
    await expect(guide.locator("h3")).toHaveText(p.title[locale]);
    for (const s of p.sections) for (const paragraph of s.paragraphs) await expect(guide).toContainText(paragraph[locale]);
  }
  await expect(page.locator("[data-holding-back35-next-steps] h3")).toContainText(locale === "zh" ? "本次作答已结束" : "This attempt is finished");
  await expect(page.locator('[data-holding-back35-next-steps] a[href*="mbti"]')).toHaveCount(0);
  await expect(page.locator("[data-facet-score], [data-pps-facet], [data-spq92-total]")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(new URL(page.url()).search).toBe("");
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/holding-yourself-back`;
  test(`@release holding-back35 ${locale}: directory and real35numeric choices, minmaxmixed, seven full6guides and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaked: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /emotion-recovery-[1-5]|self-doubt-[1-5]|direction-attention-[1-5]|outward-actions-[1-5]|rigid-standards-[1-5]|imagined-scenarios-[1-5]|interest-engagement-[1-5]|holdingBack35.*domains/.test(r.postData() ?? "")) leaked.push(r.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page).toHaveTitle(`${quiz.seoTitle[locale]} | FermatMind`);
    await expect(page.getByText(quiz.instructions![locale], { exact: true })).toBeVisible();
    const method = page.locator("#questionnaire-method").locator("..");
    await expect(page.locator("#questionnaire-results").locator("..")).not.toContainText(/tied combination|并列组合/);
    for (const s of quiz.guide) for (const p of s.paragraphs) await expect(method).toContainText(p[locale]);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await visibleQuestion(page);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    for (const mode of ["minimum", "maximum", "mixed"] as const) {
      if (mode !== "minimum") { await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.locator("[data-holding-back35-result]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); }
      await finish(page, locale, mode);
    }
    expect(leaked).toEqual([]); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:holding-yourself-back"))).toBeNull();
  });
  test(`@release holding-back35 ${locale}: optional tabdraft survives reload/language, edit and explicit clearing`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.locator('input[name="emotion-recovery-1"][value="2"]').check(); await page.getByRole("checkbox").check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="2"]')).toBeChecked(); await page.locator('input[value="4"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/holding-yourself-back`); await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="4"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:holding-yourself-back"))).toBeNull();
  });
  test(`@release holding-back35 ${locale}: storage denial, oneNAandallNA still full guides, public-only copy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw Error("synthetic denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw Error("synthetic denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await visibleQuestion(page); await page.getByRole("checkbox").check(); await expect(page.getByRole("status")).toContainText(zh ? "无法保存" : "could not save"); await finish(page, locale, "one-na");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const copied = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(copied.split("\n")).toEqual([quiz.title[locale], `https://fermatmind.com${entry}`]); expect(copied).not.toMatch(/answers|3\.0|4\/5|emotion-recovery-[1-5]|[?&]score/);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await finish(page, locale, "all-na");
    for (const mean of await page.locator("[data-holding-back35-mean]").all()) await expect(mean).toContainText("0/5");
  });
}
test("@release holding-back35 all16nativepages and images, fullbody/SEO/alternates, closed IDs and ignored private projection", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    for (const p of quiz.profiles) {
      const path = `/${locale}/tests/explore/holding-yourself-back/results/${p.id}`;
      expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title[locale]); await expect(page).toHaveTitle(`${p.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", p.seo!.description[locale]);
      for (const s of p.sections) { const own = page.locator(`#report-${s.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(s.title[locale]); for (const text of s.paragraphs) await expect(own).toContainText(text[locale]); }
      await expect(page.locator("[data-holding-back35-mean]")).toHaveCount(0);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
      for (const [lang, l] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]]) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com/${l}/tests/explore/holding-yourself-back/results/${p.id}`);
      await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/holding-yourself-back#take-test`);
    }
    for (const p of [null, ...quiz.profiles]) {
      const path = `/og/fun/holding-yourself-back?locale=${locale}${p ? `&portrait=${p.id}` : ""}`;
      const r = await request.get(path); expect(r.status()).toBe(200); expect(r.headers()["content-type"]).toContain("image/png"); const bytes = await r.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
      const privateQuery = await request.get(path+"&score=5&answers=SYNTHETIC_PRIVATE"); expect(privateQuery.status()).toBe(200); expect(await privateQuery.body()).toEqual(bytes);
    }
  }
  for (const p of ["/en/tests/explore/holding-yourself-back/results/dominant", "/zh/tests/explore/holding-yourself-back/results/negative-urgency-reading", "/og/fun/holding-yourself-back?portrait=clinical", "/og/fun/holding-yourself-back?locale=fr", "/en/tests/play/holding-yourself-back"])
    expect((await request.get(p)).status()).toBe(404);
});
