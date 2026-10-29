import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/synesthesia-test.json";
type Locale = "en" | "zh";
const path = (l: Locale) => `/${l}/tests/explore/${quiz.slug}`;
const label = (l: Locale, en: string, zh: string) => l === "zh" ? zh : en;
async function click(page: Page, l: Locale, en: string, zh: string) { await page.getByRole("button", { name: label(l, en, zh), exact: true }).click(); }
async function consent(page: Page, l: Locale) { const b = page.getByRole("button", { name: label(l, "Decline", "拒绝"), exact: true }); if (await b.isVisible()) await b.click(); }
async function answerAll(page: Page, l: Locale, value: (i: number) => string) {
  for (const [i, q] of quiz.questions.entries()) {
    await page.locator(`input[name="${q.id}"][value="${value(i)}"]`).check();
    await click(page, l, i === 14 ? "See five records and full guides" : "Next", i === 14 ? "查看五组记录与完整读法" : "下一题");
  }
}
for (const l of ["en", "zh"] as const) {
  test(`@release Synes15 ${l}: mobile, keyboard/back, five full readings, public sharing and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    if (l === "en") await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    else await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("Unavailable for test"); } } }));
    const leaks: string[] = [], errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", r => { if (r.method() === "POST" && /SYX_\d\d|"answers"|"counts"|"choice"/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${l}/tests`); await consent(page, l);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click();
    await expect(page.locator("h1")).toHaveText(quiz.title[l]); await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`);
    await click(page, l, "Start test", "开始测试"); await expect(page.locator("#synes15-question")).toBeFocused();
    await click(page, l, "Next", "下一题"); await expect(page.getByRole("status")).toContainText(label(l, "Choose a response", "请选择一种回答"));
    for (const [i, q] of quiz.questions.entries()) {
      const input = page.locator(`input[name="${q.id}"][value="${["yes", "no", "unsure", "na"][i % 4]}"]`);
      if (!i) { await input.focus(); await input.press("Space"); } else await input.check();
      if (i === 1) {
        await click(page, l, "Back", "上一题"); await expect(page.locator('input[name="SYX_01"][value="yes"]')).toBeChecked();
        await page.locator('input[name="SYX_01"][value="no"]').check(); await page.locator('input[name="SYX_01"][value="yes"]').check();
        await click(page, l, "Next", "下一题"); await expect(input).toBeChecked();
      }
      await expect(page.locator("[data-synes15-result]")).toHaveCount(0);
      await click(page, l, i === 14 ? "See five records and full guides" : "Next", i === 14 ? "查看五组记录与完整读法" : "下一题");
    }
    await expect(page.locator("#take-test h2")).toHaveText(quiz.resultHeading[l]); await expect(page.locator("#take-test h2")).toBeFocused();
    expect(await page.locator("#take-test h2").evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(64);
    await expect(page.locator("[data-synes15-part]")).toHaveCount(5);
    for (const [i, p] of quiz.profiles.entries()) {
      const part = page.locator(`[data-synes15-part="${p.id}"]`);
      const groupAnswers = quiz.questions.slice(i * 3, i * 3 + 3).map((q, j) => ({ q, value: ["yes", "no", "unsure", "na"][(i * 3 + j) % 4] }));
      const counts = Object.fromEntries(["yes", "no", "unsure", "na"].map(c => [c, groupAnswers.filter(x => x.value === c).length]));
      await expect(part.locator("[data-synes15-count]")).toHaveText(l === "zh" ? `三条中的回答计数：有 ${counts.yes}；没有 ${counts.no}；不确定 ${counts.unsure}；无机会／不愿回答 ${counts.na}。` : `Response counts out of three: yes ${counts.yes}; no ${counts.no}; unsure ${counts.unsure}; no opportunity / decline ${counts.na}.`);
      for (const [j, x] of groupAnswers.entries()) { const row = part.locator("[data-synes15-responses] li").nth(j); await expect(row).toContainText(x.q.prompt[l]); await expect(row).toContainText(x.q.options.find(o => o.id === x.value)!.label[l]); }
      await part.locator("summary").click(); await expect(part.locator("h4")).toHaveCount(7);
      for (const s of p.sections) for (const text of s.paragraphs) await expect(part).toContainText(text[l]);
      if (i === 0) { await part.locator("h3").evaluate(el => el.scrollIntoView({ block: "start" })); await page.screenshot({ path: test.info().outputPath(`${l}-symbol-color-reading.png`) }); }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("#take-test h2").evaluate(el => el.scrollIntoView({ block: "start" })); await page.screenshot({ path: test.info().outputPath(`${l}-readout.png`) });
    await click(page, l, "Copy public explanation links", "复制公开解释链接");
    await expect(page.getByRole("status")).toHaveText(l === "zh" ? /无法自动复制/ : /Copied public explanation links/);
    const expected = quiz.profiles.map(p => `${p.title[l]}\nhttps://fermatmind.com${path(l)}/results/${p.id}`).join("\n\n");
    if (l === "en") expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(expected); else await expect(page.locator("#take-test textarea")).toHaveValue(expected);
    const next = page.getByRole("link", { name: label(l, "View the Big Five test entry", "查看大五人格测试入口"), exact: true });
    expect(await next.getAttribute("href")).toBe(`/${l}/tests/big-five-personality-test-ocean-model`);
    expect(new URL(page.url()).search).toBe(""); expect(leaks).toEqual([]); expect(errors).toEqual([]);
    await click(page, l, "Clear and retake", "清空并重新测试"); await click(page, l, "Start test", "开始测试");
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0); await expect(page.locator("[data-synes15-result]")).toHaveCount(0);
    await click(page, l, "Exit and clear these responses", "退出并清除本次回答"); await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible();
  });
  test(`@release Synes15 ${l}: all-uncertain, all-skip, no and no aggregate classification`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await click(page, l, "Start test", "开始测试");
    await answerAll(page, l, i => i === 0 ? "no" : "unsure");
    const first = page.locator('[data-synes15-part="symbol-color"] [data-synes15-count]');
    await expect(first).toContainText(l === "zh" ? "有 0；没有 1；不确定 2；无机会／不愿回答 0" : "yes 0; no 1; unsure 2; no opportunity / decline 0");
    await expect(page.locator('[data-synes15-part="overall"]')).toHaveCount(0);
    await expect(page.locator("[data-synes15-sum], [data-synes15-mean], [data-synes15-winner]")).toHaveCount(0);
    await click(page, l, "Clear and retake", "清空并重新测试"); await click(page, l, "Start test", "开始测试"); await answerAll(page, l, () => "unsure");
    for (const count of await page.locator("[data-synes15-count]").all()) await expect(count).toContainText(l === "zh" ? "有 0；没有 0；不确定 3；无机会／不愿回答 0" : "yes 0; no 0; unsure 3; no opportunity / decline 0");
    await click(page, l, "Clear and retake", "清空并重新测试"); await click(page, l, "Start test", "开始测试"); await answerAll(page, l, () => "na");
    for (const count of await page.locator("[data-synes15-count]").all()) await expect(count).toContainText(l === "zh" ? "有 0；没有 0；不确定 0；无机会／不愿回答 3" : "yes 0; no 0; unsure 0; no opportunity / decline 3");
    await expect(page.locator("[data-synes15-part] summary")).toHaveCount(5);
    await expect(page.locator("[data-synes15-responses] li")).toHaveCount(15);
  });
  test(`@release Synes15 ${l}: refresh, language, return and queried public guide never restore private answers`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await click(page, l, "Start test", "开始测试");
    await page.locator('input[name="SYX_01"][value="yes"]').check(); await page.reload();
    await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible();
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
    await click(page, l, "Start test", "开始测试"); await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
    await page.locator('input[name="SYX_01"][value="yes"]').check();
    const other = l === "en" ? "zh" : "en"; await page.goto(path(other)); await consent(page, other);
    await expect(page.getByRole("button", { name: label(other, "Start test", "开始测试"), exact: true })).toBeVisible();
    await page.goBack(); await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible();
    await page.goto(`${path(l)}/results/personification?score=12&answers=private`);
    await expect(page.locator("h1")).toHaveText(quiz.profiles[3].title[l]); await expect(page.locator("[data-synes15-result]")).toHaveCount(0);
    await expect(page.locator("[data-public-content-loading]")).toHaveCount(0); const guide = page.getByRole("main"); await expect(guide).toHaveCount(1);
    for (const s of quiz.profiles[3].sections) for (const p of s.paragraphs) await expect(guide).toContainText(p[l]);
    await page.getByRole("link", { name: label(l, "Try the free 15 experience prompts", "免费尝试15条体验描述"), exact: true }).click();
    await expect(page.getByRole("button", { name: label(l, "Start test", "开始测试"), exact: true })).toBeVisible(); expect(new URL(page.url()).search).toBe("");
  });
}
