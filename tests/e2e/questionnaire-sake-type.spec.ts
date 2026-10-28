import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/sake-type.json", "utf8")) as Questionnaire;
test.beforeEach(async ({ page }) => { await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() }))); });
async function visibleQuestion(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    const h = document.querySelector("#take-test h2"), p = document.querySelector("#take-test progress"), count = p?.previousElementSibling;
    const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    return !!h && !!p && !!count && [h, p, count].every(e => e.getBoundingClientRect().top >= header) && document.documentElement.scrollWidth <= innerWidth;
  })).toBe(true);
}
async function finish(page: Page, locale: "en" | "zh", counts: number[]) {
  const directions = counts.flatMap((n, i) => Array(n).fill(quiz.directions[i].id) as string[]);
  for (const [i, q] of quiz.questions.entries()) {
    if (i === 1) await visibleQuestion(page);
    const option = q.options.find(o => o.directionId === directions[i])!; const radio = page.locator(`input[name="${q.id}"][value="${option.id}"]`);
    if (i === 0) { await radio.focus(); await radio.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    if (i < 15) await expect(page.locator("[data-archetype-match]")).toHaveCount(0);
    await page.getByRole("button", { name: i === 15 ? (locale === "zh" ? "查看完整结果" : "See full result") : (locale === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  const highest = Math.max(...counts), matched = quiz.profiles.filter((_, i) => counts[i] === highest);
  await expect(page.locator("[data-archetype-match]")).toHaveCount(matched.length);
  for (const [i, d] of quiz.directions.entries()) await expect(page.locator(`[data-archetype-count="${d.id}"] dd`)).toHaveText(`${counts[i]} / 16`);
  for (const p of matched) {
    const own = page.locator(`[data-archetype-match="${p.id}"]`); await expect(own.locator("h3")).toHaveText(p.title[locale]); await expect(own.locator("h4")).toHaveCount(6);
    for (const s of p.sections) for (const paragraph of s.paragraphs) await expect(own).toContainText(paragraph[locale]);
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
    const key = quiz.guide.find(s => s.id === "answer-key")!; const details = page.locator("details").filter({ has: page.getByText(key.title[locale], { exact: true }) });
    await details.locator("summary").click(); for (const p of key.paragraphs) await expect(details.getByText(p[locale], { exact: true })).toBeVisible(); await details.locator("summary").click();
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await visibleQuestion(page);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    const patterns = [[16, 0, 0, 0], [0, 16, 0, 0], [0, 0, 16, 0], [0, 0, 0, 16], [6, 6, 3, 1], [5, 5, 5, 1], [4, 4, 4, 4]];
    for (const [i, counts] of patterns.entries()) { if (i) { await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.locator("[data-archetype-match]")).toHaveCount(0); } await finish(page, locale, counts); }
    expect(leaked).toEqual([]); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:sake-type"))).toBeNull();
  });
  test(`@release sake-type ${locale}: voluntary tab draft reload/language/edit/clear and unfitting scene exit`, async ({ page }) => {
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.getByRole("radio")).toHaveCount(4); await page.locator('input[name="SKM_01"][value="a"]').check(); await page.getByRole("checkbox").check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="a"]')).toBeChecked(); await page.locator('input[value="c"]').check();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/sake-type`); await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.locator('input[value="c"]')).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:sake-type"))).toBeNull();
    await expect(page.locator("[data-archetype-match]")).toHaveCount(0); await expect(page.locator("#questionnaire-results").locator("..").getByRole("link")).toHaveCount(4);
  });
  test(`@release sake-type ${locale}: storage/clipboard denial still permits a full four-way tie and public-only copy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw Error("synthetic denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw Error("synthetic denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } });
    });
    await page.goto(entry); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await page.getByRole("checkbox").check(); await expect(page.getByRole("status")).toContainText(zh ? "无法保存" : "could not save"); await finish(page, locale, [4, 4, 4, 4]);
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); const copy = await page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying" }).inputValue();
    expect(copy.split("\n")).toEqual([quiz.title[locale], quiz.profiles.map(p => p.title[locale]).join(zh ? "、" : ", "), `https://fermatmind.com${entry}`]); expect(copy).not.toMatch(/SKM_|answers|4 \/ 16|[?&]score|50%/);
  });
}
test("@release sake-type all10native pages/full bodies/SEO/OG and invalid public identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    for (const profile of quiz.profiles) {
      const path = `/${locale}/tests/explore/sake-type/results/${profile.id}`; expect((await page.goto(path))?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]); await expect(page).toHaveTitle(`${profile.seo!.title[locale]} | FermatMind`); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", profile.seo!.description[locale]);
      for (const s of profile.sections) { const own = page.locator(`#report-${s.id}`); await expect(own.getByRole("heading", { level: 2 })).toHaveText(s.title[locale]); for (const text of s.paragraphs) await expect(own).toContainText(text[locale]); }
      await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
      for (const [lang, l] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]]) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com/${l}/tests/explore/sake-type/results/${profile.id}`);
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
