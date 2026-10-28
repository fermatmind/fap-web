import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/food-choice.json";
type Locale = "en" | "zh";
const path = (l: Locale) => `/${l}/tests/explore/food-choice`;
const label = (l: Locale, en: string, zh: string) => l === "zh" ? zh : en;
const witnesses = new Map<string, { values: string[]; counts: Record<string, number> }>();
for (let mask = 0; mask < 4096; mask++) {
  const counts: Record<string, number> = { familiar: 0, formal: 0, mix: 0 }, values = quiz.questions.map((q, i) => q.options[(mask >> i) & 1].id);
  for (const [i, q] of quiz.questions.entries()) counts[q.options.find(o => o.id === values[i])!.directionId]++;
  const highest = Math.max(...Object.values(counts)), leaders = Object.keys(counts).filter(k => counts[k] === highest).sort().join("|");
  const profile = quiz.profiles.find(p => [...p.directionIds].sort().join("|") === leaders)!;
  if (!witnesses.has(profile.id)) witnesses.set(profile.id, { values, counts });
}
async function consent(page: Page, l: Locale) { const b = page.getByRole("button", { name: label(l, "Decline", "拒绝"), exact: true }); if (await b.isVisible()) await b.click(); }
async function button(page: Page, l: Locale, en: string, zh: string) { await page.getByRole("button", { name: label(l, en, zh), exact: true }).click(); }
async function finish(page: Page, l: Locale, profileId: string) {
  const sample = witnesses.get(profileId)!;
  for (let i = 0; i < 12; i++) {
    const radio = page.locator(`input[name="${quiz.questions[i].id}"][value="${sample.values[i]}"]`);
    if (!i) { await radio.focus(); await radio.press("Space"); } else await radio.check(); await expect(radio).toBeChecked();
    await expect(page.locator("[data-food-choice-next-steps]")).toHaveCount(0);
    if (i === 1) { await button(page, l, "Back", "上一题"); await expect(page.locator(`input[name="FC_01"][value="${sample.values[0]}"]`)).toBeChecked(); await button(page, l, "Next", "下一题"); }
    await button(page, l, i === 11 ? "See full result" : "Next", i === 11 ? "查看完整结果" : "下一题");
  }
  const profile = quiz.profiles.find(p => p.id === profileId)!;
  await expect(page.locator("#take-test h2")).toHaveText(profile.title[l]); await expect(page.locator("#take-test h2")).toBeFocused();
  const counts = page.getByRole("region", { name: label(l, "Raw choice counts for this attempt", "本次原始选择次数"), exact: true });
  for (const d of quiz.directions) await expect(counts.locator("dl > div").filter({ has: page.getByText(d.title[l], { exact: true }) }).locator("dd")).toHaveText(`${sample.counts[d.id]} / 8`);
  const text = await page.locator("#take-test").innerText(); for (const s of profile.sections) for (const t of s.paragraphs) expect(text).toContain(t[l]);
  await expect(page.getByRole("heading", { name: label(l, "Compare one presentation detail, or finish here", "比较一处呈现细节，或在这里结束"), exact: true })).toBeVisible();
  await page.locator("[data-food-choice-next-steps] summary").click();
  for (const [i, q] of quiz.questions.entries()) await expect(page.locator(`[data-food-choice-answer="${q.id}"]`)).toContainText(q.options.find(o => o.id === sample.values[i])!.label[l]);
  await page.locator("[data-food-choice-next-steps] summary").click();
  expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const ids = await page.locator("#take-test [id]").evaluateAll(ns => ns.map(n => n.id)); expect(ids.length).toBe(new Set(ids).size);
}
for (const l of ["en", "zh"] as const) {
  test(`@release food-choice ${l}: native entry, keyboard, all7 complete outcomes, every tie and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const leaked: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /FC_\d\d|"answers"|"counts"/.test(r.postData() ?? "")) leaked.push(r.url()); });
    await page.goto(`/${l}/tests`); await consent(page, l); await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click();
    await expect(page.locator("h1")).toHaveText(quiz.title[l]); await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`);
    await button(page, l, "Start test", "开始测试"); await button(page, l, "Next", "下一题"); await expect(page.getByRole("status")).toContainText(label(l, "Choose an option", "请选择"));
    for (const [i, profile] of quiz.profiles.entries()) {
      if (i) await button(page, l, "Retake test", "重新测试"); await finish(page, l, profile.id);
      if (!i) { await page.locator("#take-test h2").scrollIntoViewIfNeeded(); await page.screenshot({ path: test.info().outputPath(`${l}-result.png`) }); }
    }
    expect(leaked).toEqual([]); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:food-choice"))).toBeNull();
    await button(page, l, "Retake test", "重新测试"); await expect(page.locator("[data-food-choice-next-steps]")).toHaveCount(0); await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });
  test(`@release food-choice ${l}: opt-in draft reload, locale switch, changed answer and clear`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await button(page, l, "Start test", "开始测试"); await page.locator('input[name="FC_01"][value="A"]').check();
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:food-choice"))).toBeNull(); await page.getByRole("checkbox").check(); await button(page, l, "Next", "下一题"); await page.reload(); await button(page, l, "Resume this tab's progress", "恢复本标签页进度");
    await expect(page.locator('input[name="FC_02"]')).toHaveCount(2); await button(page, l, "Back", "上一题"); await expect(page.locator('input[name="FC_01"][value="A"]')).toBeChecked(); await page.locator('input[name="FC_01"][value="B"]').check();
    const other = l === "en" ? "zh" : "en"; await page.goto(path(other)); await consent(page, other); await button(page, other, "Resume this tab's progress", "恢复本标签页进度"); await button(page, other, "Back", "上一题"); await expect(page.locator('input[name="FC_01"][value="B"]')).toBeChecked();
    await button(page, other, "Exit and clear this attempt", "退出并清除本次进度"); expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:food-choice"))).toBeNull();
  });
  test(`@release food-choice ${l}: entry-only sharing and all7 public full guides without private answers`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]); await page.goto(path(l)); await consent(page, l); await button(page, l, "Start test", "开始测试"); await finish(page, l, "all-three");
    await button(page, l, "Copy public entry", "复制公开入口"); expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${quiz.title[l]}\nhttps://fermatmind.com${path(l)}`);
    for (const p of quiz.profiles) {
      await page.goto(`${path(l)}/results/${p.id}`); await expect(page.locator("h1")).toHaveText(p.title[l]); await expect(page.locator("[data-food-choice-answer]")).toHaveCount(0);
      const text = await page.locator("main").last().innerText(); for (const s of p.sections) for (const t of s.paragraphs) expect(text).toContain(t[l]);
    }
  });
}
test("@release food-choice all16publicpages, canonical/hreflang/schema,16fontOGs and unknown class identities", async ({ page, request }) => {
  for (const l of ["en", "zh"] as const) for (const p of [null, ...quiz.profiles]) {
    const url = p ? `${path(l)}/results/${p.id}` : path(l); await page.goto(url); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${url}`);
    for (const [lang, other] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]] as const) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com${p ? `${path(other)}/results/${p.id}` : path(other)}`);
    const schema = await page.locator('script[type="application/ld+json"]').allTextContents(); expect(schema.length).toBeGreaterThan(0); expect(schema.join(" ")).not.toMatch(/FC_01|"answers"|"counts"|AggregateRating/);
    const image = `/og/fun/food-choice?locale=${l}${p ? `&portrait=${p.id}` : ""}`, r = await request.get(image); expect(r.status()).toBe(200); const bytes = await r.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    const sentinel = await request.get(image + "&class=PRIVATE_CLASS&answers=SYNTHETIC_PRIVATE&counts=8,2,2"); expect(sentinel.status()).toBe(200); expect(await sentinel.body()).toEqual(bytes);
  }
  expect((await request.get("/en/tests/explore/food-choice/results/upper-class")).status()).toBe(404); expect((await request.get("/og/fun/food-choice?portrait=upper-class")).status()).toBe(404); expect((await request.get("/og/fun/food-choice?locale=fr")).status()).toBe(404);
});
