import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/annoying-person-test.json", "utf8")) as Questionnaire;
const reverse = new Set<number>([]), methodIds = ["friction-scoring", "friction-complete", "friction-source"];
test.beforeEach(async ({ page }) => { await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })); }); });
async function headingBelowHeader(page: Page) {
  await page.locator("#take-test h2").waitFor({ state: "visible" });
  await expect.poll(() => page.evaluate(() => {
    const h = document.querySelector("#take-test h2"), p = document.querySelector("#take-test progress"), c = p?.previousElementSibling, header = document.querySelector("header"), bottom = header?.getBoundingClientRect().bottom ?? 0;
    return !!h && !!p && !!c && h.getBoundingClientRect().top >= bottom && p.getBoundingClientRect().top >= bottom && c.getBoundingClientRect().top >= bottom && document.documentElement.scrollWidth <= innerWidth;
  })).toBe(true);
}
async function finish(page: Page, locale: "en" | "zh", keyed: number) {
  for (let i = 0; i < quiz.questions.length; i++) {
    const value = String(reverse.has(i + 1) ? 5 + 1 - keyed : keyed), radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${value}"]`);
    await expect(page.locator("[data-mini-friction-result]")).toHaveCount(0);
    if (i === 0) { await radio.focus(); await radio.press("Space"); } else await radio.check(); if (i === 1) await headingBelowHeader(page);
    await expect(page.getByRole("radio")).toHaveCount(5);
    await page.getByRole("button", { name: i === quiz.questions.length - 1 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-mini-friction-result]")).toBeVisible(); await expect(page.locator("[data-mini-friction-part]")).toHaveCount(5);
  for (const direction of quiz.directions) await expect(page.locator(`[data-mini-friction-score="${direction.id}"]`)).toContainText(keyed.toFixed(2));
  for (const profile of quiz.profiles) for (const s of profile.sections) for (const t of s.paragraphs) await expect(page.locator("[data-mini-friction-result]")).toContainText(t[locale]);
  await expect(page.getByRole("link", { name: locale === "zh" ? "回看五份完整指南" : "Reread all five full guides", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/annoying-person-test#questionnaire-results`);
  await expect(page.getByRole("link", { name: locale === "zh" ? "了解MBTI与题本选择" : "Explore MBTI and its versions", exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:annoying-person-test"))).toBeNull();
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/annoying-person-test`;
  test(`@release T094 ${locale}: hub, keyboard, missing answer, keyed extremes and all full readings`, async ({ page }) => {
    const posts: string[] = []; page.on("request", r => { if (r.method() === "POST" && /DISLIKED_LK_[0-9]+|answers|miniFriction/.test(r.postData() ?? "")) posts.push(r.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click(); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator('[aria-labelledby="questionnaire-method"] p')).toHaveCount(3); await expect(page.locator('[aria-labelledby="questionnaire-method"] h3')).toHaveCount(0); for (const s of quiz.guide.filter(s => methodIds.includes(s.id))) for (const t of s.paragraphs) await expect(page.locator('[aria-labelledby="questionnaire-method"]').getByText(t[locale], { exact: true })).toBeVisible();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await headingBelowHeader(page); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option"); await expect(page.locator("[data-mini-friction-result]")).toHaveCount(0);
    await finish(page, locale, 5); await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.getByRole("radio").first()).not.toBeChecked(); await finish(page, locale, 1); expect(posts).toEqual([]); expect(new URL(page.url()).search).toBe("");
  });
  test(`@release T094 ${locale}: opt-in draft, refresh, language, edit and exit clear`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await page.locator('input[name="DISLIKED_LK_001"][value="4"]').check(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:annoying-person-test"))).toBeNull(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="DISLIKED_LK_001"][value="4"]')).toBeChecked(); await page.locator('input[name="DISLIKED_LK_001"][value="2"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/annoying-person-test`); await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="DISLIKED_LK_001"][value="2"]')).toBeChecked(); await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:annoying-person-test"))).toBeNull();
  });
  test(`@release T094 ${locale}: mobile midpoint, separate full readings and public-only copy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }); }); await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await finish(page, locale, 3);
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const value = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(value.split("\n").slice(0, -1).join("\n")).toBe(quiz.title[locale]); expect(value).not.toMatch(/DISLIKED_LK_[0-9]+|answers|rawSum|form_code|submission|[?&]score/); const url = new URL(value.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
test("@release T094: all native bilingual guides, images, canonical pairs, closed identity and no private personalization", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const entry = await request.get(`/og/fun/annoying-person-test?locale=${locale}`); expect(entry.status()).toBe(200); expect(entry.headers()["content-type"]).toContain("image/png");
    for (const p of quiz.profiles) {
      const path = `/${locale}/tests/explore/annoying-person-test/results/${p.id}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title[locale]); await expect(page).toHaveTitle(`${p.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", p.seo!.description[locale]); await expect(page.locator("[data-mini-friction-score]")).toHaveCount(0);
      for (const s of p.sections) { const own = page.locator(`#report-${s.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(s.title[locale]); for (const t of s.paragraphs) await expect(own).toContainText(t[locale]); }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`); await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/annoying-person-test/results/${p.id}`); const image = await request.get(`/og/fun/annoying-person-test?locale=${locale}&portrait=${p.id}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png"); const withPrivate = await request.get(`/og/fun/annoying-person-test?locale=${locale}&portrait=${p.id}&score=5&answers=SYNTHETIC_PRIVATE_ONLY`); expect(withPrivate.status()).toBe(200); expect(await withPrivate.body()).toEqual(await image.body());
    }
  }
  expect((await request.get("/en/tests/explore/annoying-person-test/results/master")).status()).toBe(404); expect((await request.get("/og/fun/annoying-person-test?portrait=master")).status()).toBe(404);
});
