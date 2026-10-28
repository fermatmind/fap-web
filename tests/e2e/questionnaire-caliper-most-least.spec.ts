import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/caliper-style-assessment-test.json";

type Locale = "en" | "zh";
const path = (l: Locale) => `/${l}/tests/explore/${quiz.slug}`;
const label = (l: Locale, en: string, zh: string) => l === "zh" ? zh : en;
async function click(page: Page, l: Locale, en: string, zh: string) { await page.getByRole("button", { name: label(l, en, zh), exact: true }).click(); }
async function consent(page: Page, l: Locale) { const b = page.getByRole("button", { name: label(l, "Decline", "拒绝"), exact: true }); if (await b.isVisible()) await b.click(); }

for (const l of ["en", "zh"] as const) {
  test(`@release most/least ${l}: native mobile entry, two distinct answers, back, complete record, full guide and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    if (l === "en") await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    const leaks: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /ML_\d\d|"answers"|"counts"|"difference"/.test(r.postData() ?? "")) leaks.push(r.url()); });
    await page.goto(`/${l}/tests`); await consent(page, l);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click();
    await expect(page.locator("h1")).toHaveText(quiz.title[l]); await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`);
    await click(page, l, "Start practice", "开始练习");
    await click(page, l, "Next", "下一组");
    await expect(page.getByRole("status")).toContainText(label(l, "Choose one Most", "请选择一条最符合"));
    for (const [i, q] of quiz.questions.entries()) {
      const most = page.locator(`input[name="${q.id}-most"][value="A"]`), least = page.locator(`input[name="${q.id}-least"][value="B"]`);
      if (!i) { await most.focus(); await most.press("Space"); } else await most.check();
      await expect(page.locator(`input[name="${q.id}-least"][value="A"]`)).toBeDisabled();
      await least.check(); await expect(page.locator(`input[name="${q.id}-most"][value="B"]`)).toBeDisabled();
      if (i === 1) {
        await click(page, l, "Back", "上一组");
        await expect(page.locator('input[name="ML_01-most"][value="A"]')).toBeChecked();
        await page.locator('input[name="ML_01-most"][value="C"]').check();
        await expect(page.locator('input[name="ML_01-least"][value="A"]')).toBeEnabled();
        await page.locator('input[name="ML_01-most"][value="A"]').check();
        await click(page, l, "Next", "下一组");
        await expect(most).toBeChecked(); await expect(least).toBeChecked();
      }
      await expect(page.locator("[data-most-least-topic]")).toHaveCount(0);
      await click(page, l, i === 15 ? "See complete record" : "Next", i === 15 ? "查看完整记录" : "下一组");
    }
    await expect(page.locator("#take-test h2")).toHaveText(quiz.resultHeading[l]); await expect(page.locator("#take-test h2")).toBeFocused();
    expect(await page.locator("#take-test h2").evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(64);
    await expect(page.locator("[data-most-least-topic]")).toHaveCount(8);
    for (const p of quiz.profiles) {
      const topic = page.locator(`[data-most-least-topic="${p.id}"]`);
      await expect(topic.locator('[data-count="most"]')).toHaveText("2 / 8"); await expect(topic.locator('[data-count="least"]')).toHaveText("2 / 8"); await expect(topic.locator('[data-count="difference"]')).toHaveText("0");
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("#take-test h2").scrollIntoViewIfNeeded(); await page.screenshot({ path: test.info().outputPath(`${l}-record.png`) });
    const first = page.locator('[data-most-least-topic="context"]'); await first.locator("summary").click();
    await expect(first.locator("h4")).toHaveCount(7);
    for (const s of quiz.profiles[0].sections) for (const p of s.paragraphs) await expect(first).toContainText(p[l]);
    await first.locator("h3").scrollIntoViewIfNeeded(); await page.screenshot({ path: test.info().outputPath(`${l}-full-reading.png`) });
    await click(page, l, "Copy public practice link", "复制公开练习链接");
    await expect(page.getByRole("status")).toHaveText(l === "zh" ? /已复制公开练习链接|复制不可用/ : /Public practice link copied|Copy is unavailable/);
    const manual = page.locator("#take-test textarea");
    if (await manual.isVisible()) await expect(manual).toHaveValue(`${quiz.title[l]}\nhttps://fermatmind.com${path(l)}`);
    else {
      await expect(page.getByRole("status")).toContainText(label(l, "without answers or counts", "不含答案或次数"));
      if (l === "en") expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${quiz.title[l]}\nhttps://fermatmind.com${path(l)}`);
    }
    const next = page.getByRole("link", { name: label(l, "Optional: explore Big Five and its versions", "可选：了解大五测试与题本"), exact: true });
    expect(new URL((await next.getAttribute("href"))!, page.url()).pathname).toBe(`/${l}/tests/big-five-personality-test-ocean-model`);
    expect(new URL(page.url()).search).toBe(""); expect(leaks).toEqual([]);
    await click(page, l, "Retake practice", "重新练习");
    await expect(page.locator("#take-test h2")).toHaveText(label(l, "Block 1 of 16", "第1组，共16组"));
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
    await click(page, l, "Clear and exit", "清空并退出"); await expect(page.getByRole("button", { name: label(l, "Start practice", "开始练习"), exact: true })).toBeVisible();
  });

  test(`@release most/least ${l}: clear one block, reload, language change and public guide without personal values`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await click(page, l, "Start practice", "开始练习");
    await page.locator('input[name="ML_01-most"][value="A"]').check(); await page.locator('input[name="ML_01-least"][value="B"]').check();
    await click(page, l, "Clear this block", "清空本组"); await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
    await page.locator('input[name="ML_01-most"][value="C"]').check(); await page.reload();
    await expect(page.getByRole("button", { name: label(l, "Start practice", "开始练习"), exact: true })).toBeVisible();
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
    await click(page, l, "Start practice", "开始练习"); await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
    await page.locator('input[name="ML_01-most"][value="A"]').check();
    const other = l === "en" ? "zh" : "en"; await page.goto(path(other)); await consent(page, other);
    await expect(page.getByRole("button", { name: label(other, "Start practice", "开始练习"), exact: true })).toBeVisible();
    await page.goto(`${path(l)}/results/pause`);
    await expect(page.locator("h1")).toHaveText(quiz.profiles[7].title[l]); await expect(page.locator("[data-most-least-topic]")).toHaveCount(0);
    for (const s of quiz.profiles[7].sections) for (const p of s.paragraphs) await expect(page.locator("main")).toContainText(p[l]);
    await page.getByRole("link", { name: label(l, "Start the free 16-block original practice", "免费开始16组原创练习"), exact: true }).click();
    await expect(page.getByRole("button", { name: label(l, "Start practice", "开始练习"), exact: true })).toBeVisible();
  });
}
