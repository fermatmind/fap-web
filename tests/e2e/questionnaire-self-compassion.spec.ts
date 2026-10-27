import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/self-compassion.json", "utf8")) as Questionnaire;
const negative = new Set([1, 2, 4, 6, 8, 11, 13, 16, 18, 20, 21, 24, 25]);
const kindness = new Set([5, 12, 19, 23, 26]);
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })); });
});
async function headingBelowHeader(page: Page) {
  await page.locator("#take-test h2").waitFor({ state: "visible" });
  await expect.poll(() => page.evaluate(() => {
    const h = document.querySelector("#take-test h2"), p = document.querySelector("#take-test progress"), c = p?.previousElementSibling, header = document.querySelector("header"), bottom = header?.getBoundingClientRect().bottom ?? 0;
    return !!h && !!p && !!c && h.getBoundingClientRect().top >= bottom && p.getBoundingClientRect().top >= bottom && c.getBoundingClientRect().top >= bottom && document.documentElement.scrollWidth <= innerWidth;
  })).toBe(true);
}
async function finish(page: Page, locale: "en" | "zh", mode: "minimum" | "maximum" | "weighted" | "one-skip" | "all-skip") {
  for (let i = 0; i < 26; i++) {
    const desired = mode === "maximum" || mode === "weighted" && kindness.has(i + 1) ? 5 : 1;
    const value = mode === "all-skip" || mode === "one-skip" && i === 0 ? "na" : String(negative.has(i + 1) ? 6 - desired : desired);
    const radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${value}"]`);
    if (i === 0) { await radio.focus(); await radio.press("Space"); } else await radio.check();
    if (i === 1) await headingBelowHeader(page);
    await page.getByRole("button", { name: i === 25 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-scs26-result]")).toBeVisible();
  const expected = mode === "minimum" ? "1.00" : mode === "maximum" ? "5.00" : mode === "weighted" ? "1.67" : locale === "zh" ? "资料不足" : "Insufficient information";
  await expect(page.locator("[data-scs26-overall]")).toContainText(expected);
  if (mode === "one-skip") {
    await expect(page.locator('[data-scs26-part="self-judgment"]')).toContainText(locale === "zh" ? "资料不足：4/5" : "Insufficient information: 4/5");
    await expect(page.locator('[data-scs26-part="self-kindness"]')).toContainText(locale === "zh" ? "原始均分：1.00" : "Raw mean: 1.00");
  }
  if (mode === "minimum" || mode === "maximum") {
    const raw = mode === "minimum" ? "5.00" : "1.00", keyed = mode === "minimum" ? "1.00" : "5.00";
    await expect(page.locator('[data-scs26-part="self-judgment"]')).toContainText(locale === "zh" ? `原始均分：${raw}` : `Raw mean: ${raw}`);
    await expect(page.locator('[data-scs26-part="self-judgment"]')).toContainText(locale === "zh" ? `反向均分（进入整体分）：${keyed}` : `Reversed mean (used in overall): ${keyed}`);
  }
  for (const profile of quiz.profiles) for (const section of profile.sections) for (const text of section.paragraphs) await expect(page.locator("[data-scs26-result]")).toContainText(text[locale]);
  expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:self-compassion"))).toBeNull();
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/self-compassion`;
  test(`@release SCS26 ${locale}: hub, minimum, maximum, exact equal-part weighting, keyboard and complete results`, async ({ page }) => {
    const sensitivePosts: string[] = []; page.on("request", request => { if (request.method() === "POST" && /SCS_[0-9]{2}|answers|scs26.*overall/.test(request.postData() ?? "")) sensitivePosts.push(request.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await headingBelowHeader(page);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    for (const mode of ["minimum", "maximum", "weighted"] as const) {
      if (mode !== "minimum") { await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.locator("[data-scs26-result]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); }
      await finish(page, locale, mode);
    }
    expect(sensitivePosts).toEqual([]); expect(new URL(page.url()).search).toBe("");
  });
  test(`@release SCS26 ${locale}: opt-in draft, language switch, editing, reset and no unrequested storage`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await page.locator('input[name="SCS_01"][value="4"]').check(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:self-compassion"))).toBeNull(); await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="SCS_01"][value="4"]')).toBeChecked(); await page.locator('input[name="SCS_01"][value="2"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/self-compassion`); await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[name="SCS_01"][value="2"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:self-compassion"))).toBeNull();
  });
  test(`@release SCS26 ${locale}: one skip, all skipped, complete guides and public-only sharing on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } }); });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await finish(page, locale, "one-skip");
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const text = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue(); expect(text).toContain(quiz.title[locale]); expect(text).not.toMatch(/SCS_[0-9]{2}|answers|form_code|submission|25\s*\/\s*26|[?&]score/); const url = new URL(text.split("\n").at(-1)!); expect(url.pathname).toBe(entry); expect(url.search).toBe(""); expect(url.hash).toBe("");
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await finish(page, locale, "all-skip");
    await expect(page.locator("[data-scs26-overall]")).toContainText("0/26");
  });
}
test("@release SCS26 all sixteen native pages and images, independent metadata, no private query projection and closed IDs", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    const entry = await request.get(`/og/fun/self-compassion?locale=${locale}`); expect(entry.status()).toBe(200); expect(entry.headers()["content-type"]).toContain("image/png");
    for (const p of quiz.profiles) {
      const path = `/${locale}/tests/explore/self-compassion/results/${p.id}`; expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.title[locale]); await expect(page).toHaveTitle(`${p.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", p.seo!.description[locale]); await expect(page.locator("[data-scs26-overall]")).toHaveCount(0);
      for (const s of p.sections) { const own = page.locator(`#report-${s.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(s.title[locale]); for (const text of s.paragraphs) await expect(own).toContainText(text[locale]); }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`); await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/self-compassion/results/${p.id}`);
      const image = await request.get(`/og/fun/self-compassion?locale=${locale}&portrait=${p.id}`); expect(image.status()).toBe(200); expect(image.headers()["content-type"]).toContain("image/png");
      const privateQuery = await request.get(`/og/fun/self-compassion?locale=${locale}&portrait=${p.id}&score=5&answers=SYNTHETIC_PRIVATE_ANSWER`); expect(privateQuery.status()).toBe(200); expect(await privateQuery.body()).toEqual(await image.body());
    }
  }
  expect((await request.get("/en/tests/explore/self-compassion/results/high")).status()).toBe(404); expect((await request.get("/og/fun/self-compassion?portrait=normal")).status()).toBe(404);
});
