import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { WrittenCoordinationQuiz } from "../../lib/questionnaires/writtenCoordination";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/written-coordination-practice.json", "utf8")) as WrittenCoordinationQuiz;
const label = (locale: string, en: string, zh: string) => locale === "zh" ? zh : en;
const path = (locale: string) => `/${locale}/tests/explore/${quiz.slug}`;
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: new Date().toISOString() })));
});
async function openModule(page: Page, locale: string, id: string, mode: "timed" | "study" = "study") {
  await page.locator(`input[name="written-practice-mode"][value="${mode}"]`).check();
  await page.locator(`[data-written-start="${id}"]`).click();
  await page.getByRole("button", { name: label(locale, mode === "study" ? "Start untimed study" : "Start timed section", mode === "study" ? "开始不计时学习" : "开始计时部分"), exact: true }).click();
}
async function clear(page: Page, locale: string) {
  await page.getByRole("button", { name: label(locale, "Exit and clear all exercise records", "退出并清除全部练习记录"), exact: true }).click();
  await expect(page.locator("[data-written-unattempted]")).toHaveCount(6);
}

for (const locale of ["en", "zh"] as const) {
  test(`@release written coordination ${locale}: all five study sections, complete public readings, missing states and public-only copy`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaks: string[] = [], errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", r => { if (/WC_(REF|MEM|PRI|MAP|SUM)_|FM-WC-|"answers"/.test((r.postData() ?? "") + new URL(r.url()).search)) leaks.push(r.url()); });
    await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw Error("synthetic clipboard denial"); } } }));
    await page.goto(`/${locale}/tests`); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page.locator("[data-written-unattempted]")).toHaveCount(6);
    await expect(page.locator("[data-written-full-guide]")).toHaveCount(6);
    for (const p of quiz.profiles) for (const s of p.sections) for (const text of s.paragraphs) await expect(page.locator(`[data-written-full-guide="${p.id}"]`)).toContainText(text[locale]);
    const checkContext = async (part: string) => {
        await expect(page.locator("#written-active-question")).toBeFocused();
        const context = await page.locator("[data-written-question-context]").boundingBox(), header = await page.locator("header").first().boundingBox();
        expect(context).not.toBeNull(); expect(context!.y).toBeGreaterThanOrEqual(header ? header.y + header.height : 0);
        if (part === "map") {
          const svg = await page.locator("[data-written-question-module] svg").boundingBox(); expect(svg).not.toBeNull();
          expect(svg!.y).toBeGreaterThanOrEqual(header ? header.y + header.height : 0); expect(svg!.y + svg!.height).toBeLessThanOrEqual(844);
        }
    };
    for (const part of quiz.coordination.sections) {
      await openModule(page, locale, part.id);
      await checkContext(part.id);
      if (part.id === "memory") await expect(page.locator("[data-written-memory-study]")).toContainText(quiz.coordination.memoryText.en);
      await page.getByRole("button", { name: label(locale, "Next", "下一题"), exact: true }).click();
      await expect(page.locator("[data-written-question-module]").getByRole("status")).toContainText(label(locale, "Choose an option", "请选择"));
      const questions = quiz.questions.filter(q => q.options[0].directionId === part.id);
      for (const [i, q] of questions.entries()) {
        await expect(page.locator("#written-active-question")).toHaveText(q.prompt.en);
        if (i > 0) await checkContext(part.id);
        await page.locator(`input[name="${q.id}"][value="${q.correctOptionId}"]`).check();
        await page.getByRole("button", { name: label(locale, i === 5 ? "Complete this section" : "Next", i === 5 ? "完成本部分" : "下一题"), exact: true }).click();
      }
      await expect(page.locator(`[data-written-counts="${part.id}"]`)).toHaveText(label(locale, "Correct 6; wrong 0; unanswered 0; total 6.", "正确 6；错误 0；未答 0；共6题。"));
    }
    await expect(page.locator('[data-written-module-record="entry"] [data-written-unattempted]')).toHaveCount(1);
    await expect(page.locator("[data-written-item-feedback]")).toHaveCount(30); expect(new URL(page.url()).search).toBe("");
    await page.getByRole("button", { name: label(locale, "Copy public entry", "复制公开入口"), exact: true }).click();
    await expect(page.getByRole("textbox", { name: label(locale, "Public entry for manual copying", "手动复制公开入口"), exact: true })).toHaveValue(`${quiz.title[locale]}\nhttps://fermatmind.com${path(locale)}`);
    await clear(page, locale); await expect(page.locator("[data-written-item-feedback]")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); expect(leaks).toEqual([]); expect(errors).toEqual([]);
  });

  test(`@release written coordination ${locale}: real60-second entry, exact fields, correction and background clearing`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 390, height: 844 }); await page.goto(path(locale));
    await page.locator('[data-written-start="entry"]').click();
    await page.getByRole("button", { name: label(locale, "Start 60-second entry", "开始60秒录入"), exact: true }).click();
    const started = Date.now();
    for (const [i, f] of quiz.coordination.entry.fields.entries()) await page.locator(`#written-entry-${f.id}`).fill(quiz.coordination.entry.records[0].values[i]);
    await page.getByRole("button", { name: label(locale, "Next card (include blank fields)", "下一卡（空字段也计入）"), exact: true }).click();
    await page.locator("#written-entry-card").fill("X");
    await page.getByRole("button", { name: label(locale, "Previous card and revise", "上一卡并修改"), exact: true }).click();
    await expect(page.locator("#written-entry-card")).toHaveValue(quiz.coordination.entry.records[0].values[0]);
    await page.locator("#written-entry-card").fill("TEMP"); await page.locator("#written-entry-card").fill(quiz.coordination.entry.records[0].values[0]);
    await page.getByRole("button", { name: label(locale, "Next card (include blank fields)", "下一卡（空字段也计入）"), exact: true }).click();
    await expect(page.locator("#written-entry-card")).toHaveValue("X");
    await expect(page.locator("[data-written-entry-result]")).toBeVisible({ timeout: 65000 }); expect(Date.now() - started).toBeGreaterThanOrEqual(59000);
    await expect(page.locator("[data-written-entry-considered]")).toContainText("2 / 8"); await expect(page.locator("[data-written-entry-exact]")).toContainText("4 / 1"); await expect(page.locator("[data-written-entry-accuracy]")).toContainText("50.0%");
    const count = quiz.coordination.entry.records[0].values.join("").length + 1; await expect(page.locator("[data-written-entry-output]")).toContainText(`${count} / ${(count * 60).toFixed(1)}`);
    await expect(page.locator("[data-written-entry] input")).toHaveCount(0);
    await page.locator('[data-written-start="entry"]').click(); await expect(page.locator("[data-written-entry-result]")).toHaveCount(0);
    await page.getByRole("button", { name: label(locale, "Start 60-second entry", "开始60秒录入"), exact: true }).click(); await page.locator("#written-entry-card").fill("SYNTHETIC_NOT_STORED");
    await page.evaluate(() => {
      const own = Object.getOwnPropertyDescriptor(document, "visibilityState"); Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
      try { document.dispatchEvent(new Event("visibilitychange")); } finally { if (own) Object.defineProperty(document, "visibilityState", own); else Reflect.deleteProperty(document, "visibilityState"); }
    });
    await expect(page.locator("[data-written-entry] input")).toHaveCount(0); await expect(page.locator('[data-written-module-record="entry"] [data-written-unattempted]')).toHaveCount(1);
    expect(await page.evaluate(() => Object.keys(sessionStorage).some(k => k.includes("written-coordination")))).toBe(false);
  });

  test(`@release written coordination ${locale}: emulated exposure removal, expiry, drift rejection and deadline-before-input`, async ({ page }) => {
    await page.goto(path(locale)); await page.clock.install(); await openModule(page, locale, "memory", "timed");
    await expect(page.locator("[data-written-memory-study]")).toBeVisible(); await expect(page.locator("#written-active-question")).toHaveCount(0);
    await page.clock.fastForward(15001); await expect(page.locator("[data-written-memory-study]")).toHaveCount(0); await expect(page.locator("[data-written-exposure]")).toBeVisible();
    const q = quiz.questions.find(q => q.options[0].directionId === "memory")!; await page.locator(`input[name="${q.id}"][value="${q.correctOptionId}"]`).check();
    await page.clock.fastForward(120001); await expect(page.locator('[data-written-counts="memory"]')).toHaveText(label(locale, "Correct 1; wrong 0; unanswered 5; total 6.", "正确 1；错误 0；未答 5；共6题。"));
    await openModule(page, locale, "priority", "timed");
    await page.evaluate(() => { const old = Date.now; Date.now = () => old() + 60000; try { document.querySelector<HTMLInputElement>('input[name="WC_PRI_01"][value="A"]')!.click(); } finally { Date.now = old; } });
    await expect(page.locator("#take-test").getByRole("status")).toContainText(label(locale, "Inconsistent clocks", "时钟不一致")); await expect(page.locator('[data-written-module-record="priority"] [data-written-unattempted]')).toHaveCount(1);
    await openModule(page, locale, "priority", "timed");
    await page.evaluate(() => {
      const wall = Date.now, mono = performance.now.bind(performance), own = Object.getOwnPropertyDescriptor(performance, "now");
      Date.now = () => wall() + 180000; Object.defineProperty(performance, "now", { configurable: true, value: () => mono() + 180000 });
      try { document.querySelector<HTMLInputElement>('input[name="WC_PRI_01"][value="A"]')!.click(); } finally { Date.now = wall; if (own) Object.defineProperty(performance, "now", own); else Reflect.deleteProperty(performance, "now"); }
    });
    await expect(page.locator('[data-written-counts="priority"]')).toHaveText(label(locale, "Correct 0; wrong 0; unanswered 6; total 6.", "正确 0；错误 0；未答 6；共6题。"));
    await page.locator('[data-written-start="entry"]').click(); await page.getByRole("button", { name: label(locale, "Start 60-second entry", "开始60秒录入"), exact: true }).click();
    await page.evaluate(() => {
      const wall = Date.now, mono = performance.now.bind(performance), own = Object.getOwnPropertyDescriptor(performance, "now");
      Date.now = () => wall() + 60000; Object.defineProperty(performance, "now", { configurable: true, value: () => mono() + 60000 });
      try { document.querySelector<HTMLButtonElement>('[data-written-entry] button[type="submit"]')!.click(); } finally { Date.now = wall; if (own) Object.defineProperty(performance, "now", own); else Reflect.deleteProperty(performance, "now"); }
    });
    await expect(page.locator("[data-written-entry-considered]")).toContainText("0 / 0"); await expect(page.locator("[data-written-entry-accuracy]")).toContainText(label(locale, "accuracy unavailable", "准确率不适用"));
    await clear(page, locale);
  });
}

test("@release written coordination: all14 public pages, full bodies, canonical pairs and private-free OG", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) for (const profile of [null, ...quiz.profiles]) {
    const url = `${path(locale)}${profile ? `/results/${profile.id}` : ""}`; expect((await page.goto(url))?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText((profile?.title ?? quiz.title)[locale]); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${url}`);
    for (const [hreflang, l] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]]) await expect(page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`)).toHaveAttribute("href", `https://fermatmind.com${path(l)}${profile ? `/results/${profile.id}` : ""}`);
    if (profile) for (const s of profile.sections) for (const text of s.paragraphs) await expect(page.locator(`[data-written-full-guide="${profile.id}"]`)).toContainText(text[locale]);
    await expect(page.locator("[data-written-counts]")).toHaveCount(0);
    const og = `/og/fun/${quiz.slug}?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`, response = await request.get(og); expect(response.status()).toBe(200);
    const bytes = await response.body(); expect(response.headers()["content-type"]).toContain("image/png"); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    expect(await (await request.get(og + "&answers=SYNTHETIC_PRIVATE&counts=6")).body()).toEqual(bytes);
  }
  for (const p of [`${path("en")}/results/overall`, `${path("zh")}/results/hiring-level`, `/og/fun/${quiz.slug}?locale=fr`, `/og/fun/${quiz.slug}?portrait=pass`]) expect((await request.get(p)).status()).toBe(404);
});
