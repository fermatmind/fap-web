import { sakeResultProfile } from "../../lib/questionnaires/result-content/sake-type";
import { expectQuestionContext } from "./helpers/question-context";
import { expectQuestionnaireSessionPrivacy } from "./helpers/questionnaire-session-privacy";
import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/sake-type.json", "utf8")) as Questionnaire;
test.beforeEach(async ({ page }) => { await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() }))); });
async function finish(page: Page, locale: "en" | "zh", counts: number[]) {
  const directions = counts.flatMap((n, i) => Array(n).fill(quiz.directions[i].id) as string[]);
  for (const [i, q] of quiz.questions.entries()) {
    if (i === 1) await expectQuestionContext(page);
    const option = q.options.find(o => o.directionId === directions[i])!; const radio = page.locator(`input[name="${q.id}"][value="${option.id}"]`);
    if (i < 15) await expect(page.locator("[data-archetype-match]")).toHaveCount(0);
    if (i === 0) await radio.press("Space");
    else await radio.click();
    await expect(radio).toHaveCount(0);
  }
  const highest = Math.max(...counts), matched = quiz.profiles.filter((_, i) => counts[i] === highest);
  await expect(page.locator("[data-archetype-match]")).toHaveCount(matched.length);
  for (const [i, d] of quiz.directions.entries()) await expect(page.locator(`[data-archetype-count="${d.id}"] dd`)).toHaveText(`${counts[i]} / 16`);
  for (const p of matched) {
    const own = page.locator(`[data-archetype-match="${p.id}"]`); await expect(own.locator("h3")).toHaveText(p.title[locale]); await expect(own.locator(`a[href="/${locale}/tests/explore/${quiz.slug}/results/${p.id}"]`)).toBeVisible();
    for (const s of sakeResultProfile(p).sections) for (const paragraph of s.paragraphs) await expect(own).toContainText(paragraph[locale]);
  }
  expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/sake-type`;
  test(`@release sake-type ${locale}: directory, public response key, all4 results and two/three/four-way full ties`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaked: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /SKM_\d\d|sake.*counts|answers.*sake/.test(r.postData() ?? "")) leaked.push(r.url()); });
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page).toHaveTitle(`${quiz.seoTitle[locale]} | FermatMind`);
    await expect(page.locator("#take-test").getByText(quiz.instructions![locale], { exact: true })).toBeVisible();
    await expect(page.locator("#questionnaire-method")).toHaveText(zh
      ? "16题如何计次？对应表、位置轮换与最高并列"
      : "How sixteen choices are counted: response key, rotating positions and highest ties");
    await page.locator("[data-explore-start]:visible").first().click(); await expectQuestionContext(page);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    const patterns = [[16, 0, 0, 0], [0, 16, 0, 0], [0, 0, 16, 0], [0, 0, 0, 16], [6, 6, 3, 1], [5, 5, 5, 1], [4, 4, 4, 4]];
    for (const [i, counts] of patterns.entries()) { if (i) { await page.getByRole("button", { name: zh ? "再测一次" : "Retake", exact: true }).click(); await expect(page.locator("[data-archetype-match]")).toHaveCount(0); } await finish(page, locale, counts); }
    expect(leaked).toEqual([]); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:sake-type"))).toBeNull();
  });
  test(`@release sake-type ${locale}: edit in memory, then clear answers on reload, language change or exit, with public guides still available`, async ({ page }) => {
    await expectQuestionnaireSessionPrivacy(page, locale, quiz);
    const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/${quiz.slug}`);
    await expect(page.locator("[data-archetype-match]")).toHaveCount(0); await expect(page.locator("#questionnaire-results").locator("..").getByRole("link")).toHaveCount(4);
  });
  test(`@release sake-type ${locale}: storage/clipboard denial still permits a full four-way tie and public-only copy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw Error("synthetic denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw Error("synthetic denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.locator("[data-explore-start]:visible").first().click(); await expect(page.locator("#take-test").getByRole("checkbox")).toHaveCount(0); await finish(page, locale, [4, 4, 4, 4]);
    await page.getByRole("button", { name: zh ? "一键分享给朋友" : "Share Result", exact: true }).click(); const copy = await page.locator("[data-archetype-honor-group] textarea").inputValue();
    for (const profile of quiz.profiles) expect(copy).toContain(profile.title[locale].split(/[：:]/u)[0]); expect(copy.split("\n").at(-1)).toBe(`https://fermatmind.com${entry}`); expect(copy).not.toMatch(/SKM_|answers|4 \/ 16|[?&]score|50%/);
  });
}
test("@release sake-type all10native pages/full bodies/SEO/OG and invalid public identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    for (const profile of quiz.profiles) {
      const path = `/${locale}/tests/explore/sake-type/results/${profile.id}`; expect((await page.goto(path))?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]); await expect(page).toHaveTitle(`${profile.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", profile.seo!.description[locale]);
      for (const s of sakeResultProfile(profile).sections) { const own = page.locator(`#report-${s.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(s.title[locale]); for (const text of s.paragraphs) await expect(own).toContainText(text[locale]); }
      await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
      await expect(page.getByRole("link", { name: locale === "zh" ? "免费开始完整测试" : "Start the full test for free", exact: true })).toHaveAttribute("href", `/${locale}/tests/explore/sake-type#take-test`);
    }
    for (const profile of [null, ...quiz.profiles]) {
      const path = `/og/fun/sake-type?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`; const r = await request.get(path); expect(r.status()).toBe(200); expect(r.headers()["content-type"]).toContain("image/png"); const bytes = await r.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
      const privateQuery = await request.get(path + "&score=16&answers=SYNTHETIC_PRIVATE"); expect(privateQuery.status()).toBe(200); expect(await privateQuery.body()).toEqual(bytes);
    }
  }
  for (const path of ["/en/tests/explore/sake-type/results/dominant", "/zh/tests/explore/sake-type/results/alcohol-tolerance", "/og/fun/sake-type?portrait=clinical", "/og/fun/sake-type?locale=fr", "/en/tests/play/sake-type"])
    expect((await request.get(path)).status()).toBe(404);
});
