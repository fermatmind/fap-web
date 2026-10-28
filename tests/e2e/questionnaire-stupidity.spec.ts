import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/stupidity-test.json";
type Locale = "en" | "zh";
const entry = (l: Locale) => `/${l}/tests/explore/${quiz.slug}`;
test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 390, height: 844 }); });
async function consent(page: Page, l: Locale) { const b = page.getByRole("button", { name: l === "zh" ? "拒绝" : "Decline", exact: true }); if (await b.isVisible()) await b.click(); }
async function start(page: Page, l: Locale) { await page.getByRole("button", { name: l === "zh" ? "开始测试" : "Start test", exact: true }).click(); await consent(page, l); }
async function answer(page: Page, l: Locale, answers: Record<string, string>) {
  for (let i = 0; i < quiz.questions.length; i++) {
    const q = quiz.questions[i], o = q.options.find(o => o.id === answers[q.id])!, radio = page.getByRole("radio", { name: o.label[l], exact: true });
    if (i === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    if (i === 1) { await page.getByRole("button", { name: l === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.getByRole("radio", { name: quiz.questions[0].options.find(o => o.id === answers[quiz.questions[0].id])!.label[l], exact: true })).toBeChecked(); await page.getByRole("button", { name: l === "zh" ? "下一题" : "Next", exact: true }).click(); }
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0); await page.getByRole("button", { name: i === 11 ? (l === "zh" ? "查看完整结果" : "See full result") : (l === "zh" ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.locator("#take-test h2")).toBeFocused(); await consent(page, l); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const ids = await page.locator("#take-test [id]").evaluateAll(ns => ns.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length); await page.screenshot({ path: test.info().outputPath("result-mobile.png") });
}
function watch(page: Page) { const posts: string[] = []; page.on("request", r => { if (r.method() === "POST" && /MIX_\d|winnerIds|"answers"|"counts"/.test(r.postData() ?? "")) posts.push(r.url()); }); return posts; }
for (const l of ["en", "zh"] as const) {
  const zh = l === "zh";
  test(`@release mix-ups ${l}: hub, keyboard, unique eight-count full guide and retake`, async ({ page }) => {
    const posts = watch(page); await page.goto(`/${l}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click(); await expect(page.locator("h1")).toHaveText(quiz.title[l]); await start(page, l);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    const answers = Object.fromEntries(quiz.questions.map(q => [q.id, (q.options.find(o => o.directionId === "wrong-target") ?? q.options[0]).id]));
    const counts = Object.fromEntries(quiz.directions.map(d => [d.id, 0])); for (const q of quiz.questions) counts[q.options.find(o => o.id === answers[q.id])!.directionId]++; expect(counts["wrong-target"]).toBe(8);
    await answer(page, l, answers); await expect(page.locator('[data-archetype-match="wrong-target"]')).toBeVisible(); await expect(page.locator("[data-archetype-match]")).toHaveCount(1); await expect(page.locator("#take-test h4")).toHaveCount(8);
    for (const d of quiz.directions) await expect(page.locator(`[data-archetype-count="${d.id}"]`)).toContainText(`${counts[d.id]} / 8`);
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.locator("[data-archetype-match]")).toHaveCount(0); await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0); expect(posts).toEqual([]);
  });
  test(`@release mix-ups ${l}: opt-in draft, locale URL, reload and clearing`, async ({ page }) => {
    const key = `fm_questionnaire_draft:${quiz.slug}`; await page.goto(entry(l)); await start(page, l); await page.getByRole("radio", { name: quiz.questions[0].options[0].label[l], exact: true }).check(); expect(await page.evaluate(k => sessionStorage.getItem(k), key)).toBeNull();
    await page.getByRole("checkbox").check(); await page.reload(); await page.getByRole("button", { name: zh ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    const other: Locale = zh ? "en" : "zh", alt = await page.locator(`link[rel="alternate"][hreflang="${other === "zh" ? "zh-CN" : "en"}"]`).getAttribute("href"); expect(alt).toBe(`https://fermatmind.com${entry(other)}`); await page.goto(new URL(alt!).pathname);
    await page.getByRole("button", { name: other === "zh" ? "恢复本标签页进度" : "Resume this tab's progress", exact: true }).click(); await page.getByRole("button", { name: other === "zh" ? "上一题" : "Back", exact: true }).click(); await expect(page.getByRole("radio", { name: quiz.questions[0].options[0].label[other], exact: true })).toBeChecked();
    await page.getByRole("button", { name: other === "zh" ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); expect(await page.evaluate(k => sessionStorage.getItem(k), key)).toBeNull();
  });
  test(`@release mix-ups ${l}: denied storage, all six ties and public-only clipboard fallback`, async ({ page }) => {
    const posts = watch(page); await page.addInitScript(() => { Storage.prototype.setItem = () => { throw Error("synthetic storage denial"); }; }); await page.goto(entry(l)); await start(page, l);
    await answer(page, l, Object.fromEntries(quiz.questions.map(q => [q.id, q.options[0].id]))); await expect(page.locator("[data-archetype-match]")).toHaveCount(6); await expect(page.locator("#take-test h4")).toHaveCount(48); for (const d of quiz.directions) await expect(page.locator(`[data-archetype-count="${d.id}"]`)).toContainText("2 / 8");
    await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } }));
    await page.getByRole("button", { name: zh ? "复制结果与链接" : "Copy result and link", exact: true }).click(); await expect(page.getByRole("textbox", { name: zh ? "手动复制结果" : "Result text for manual copying", exact: true })).toHaveValue(`${quiz.title[l]}\n${quiz.profiles.map(p => p.title[l]).join(zh ? "、" : ", ")}\nhttps://fermatmind.com${entry(l)}`); expect(posts).toEqual([]);
  });
}
test("@release mix-ups: all12free public guides and closed unknown identities", async ({ page, request }) => {
  for (const l of ["en", "zh"] as const) for (const p of quiz.profiles) {
    await page.goto(`${entry(l)}/results/${p.id}`); await expect(page.locator("h1")).toHaveText(p.title[l]); for (const s of p.sections) { await expect(page.locator(`#report-${s.id} h2`)).toHaveText(s.title[l]); for (const t of s.paragraphs) await expect(page.locator(`#report-${s.id}`).getByText(t[l], { exact: true })).toBeVisible(); }
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); const og = await request.get(`/og/fun/${quiz.slug}?locale=${l}&portrait=${p.id}`); expect(og.status()).toBe(200); expect(og.headers()["content-type"]).toContain("image/png");
  }
  for (const path of [`/en/tests/explore/${quiz.slug}/results/unknown-private-id`, `/og/fun/${quiz.slug}?locale=en&portrait=unknown-private-id`, `/en/tests/explore/${quiz.slug}-unknown`]) expect((await request.get(path)).status()).toBe(404);
});
