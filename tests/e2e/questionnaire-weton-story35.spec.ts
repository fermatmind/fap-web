import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Questionnaire } from "../../lib/questionnaires/types";
const quiz = JSON.parse(readFileSync("lib/questionnaires/data/weton-story-preferences.json", "utf8")) as Questionnaire;
const witnesses = JSON.parse(readFileSync("tests/fixtures/questionnaires/weton-story35-tie-witnesses.json", "utf8")) as { banks: { states: { leaders: string[]; choices: string[] }[] }[] };
const weekday = witnesses.banks[0].states.find(s => s.leaders.length === 7)!, pasaran = witnesses.banks[1].states.find(s => s.leaders.length === 4)!;
const values = [...weekday.choices, ...pasaran.choices], matches = weekday.leaders.flatMap(d => pasaran.leaders.map(p => `${d}-${p}`));
test.beforeEach(async ({ page }) => {
  await page.route(/\/api\/(?:v0\.5\/seo\/attribution\/events|track)(?:\?|$)|https:\/\/(?:www\.googletagmanager\.com|(?:www\.)?google-analytics\.com|hm\.baidu\.com)\//, route => route.fulfill({ status: 204 }));
});
async function acceptCookies(page: Page, zh: boolean) { const consent = page.getByRole("button", { name: zh ? "接受" : "Accept", exact: true }); if (await consent.count()) await consent.click(); }
function privateRequests(page: Page) {
  const seen: string[] = [];
  page.on("request", request => { if (request.method() === "POST" && /WETON35_|FM_WETON_STORY35|weton-story-preferences|fm_weton_story35_v1|1945-08-17|start_test|complete_test|view_result/.test(request.postData() ?? "")) seen.push(request.url()); });
  return seen;
}
async function finish(page: Page, zh: boolean, mode: "scored" | "na" | "one-na") {
  for (const [i, q] of quiz.questions.entries()) {
    const value = mode === "na" || (mode === "one-na" && i === 34) ? "na" : values[i], radio = page.locator(`input[name="${q.id}"][value="${value}"]`);
    if (i === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    await expect(page.locator("[data-weton-count]")).toHaveCount(0);
    await page.getByRole("button", { name: i === 34 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一题" : "Next"), exact: true }).click();
  }
  await expect(page.getByRole("heading", { level: 2, name: quiz.resultHeading![zh ? "zh" : "en"], exact: true })).toBeFocused();
  if (mode === "scored") {
    await expect(page.locator("[data-weton-profile]")).toHaveCount(28); await expect(page.locator("[data-weton-profile] h4")).toHaveCount(224);
    const body = await page.locator("[data-weton-story-flow]").textContent();
    for (const p of quiz.profiles.filter(p => matches.includes(p.id))) for (const s of p.sections) for (const x of s.paragraphs) expect(body).toContain(x[zh ? "zh" : "en"]);
    for (const d of quiz.directions) await expect(page.locator(`[data-weton-record="${d.id}"] [data-weton-count]`)).toHaveText(`${values.filter(k => k === d.id).length} / ${d.itemCount}`);
  } else { await expect(page.locator("[data-weton-insufficient]")).toBeVisible(); await expect(page.locator("[data-weton-profile], [data-weton-count]")).toHaveCount(0); }
  await expect(page.locator("#weton-all-guides + ul a")).toHaveCount(35);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
  expect(new URL(page.url()).search).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", path = `/${locale}/tests/explore/weton-story-preferences`;
  test(`@release Weton stories ${locale}: hub,35real choices, stable back edit,28ties224full sections, independent calendar and full clear`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); const seen = privateRequests(page);
    await page.goto(`/${locale}/tests`); await acceptCookies(page, zh); await page.locator("#more-tests").getByRole("link", { name: quiz.title[locale], exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await expect(page.getByRole("status")).toContainText(zh ? "请选择" : "Choose an option");
    const order = await page.getByRole("radio").evaluateAll(nodes => nodes.map(n => (n as HTMLInputElement).value)); expect(order.at(-1)).toBe("na");
    await page.locator(`input[value="${values[0]}"]`).check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click(); await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(page.locator(`input[value="${values[0]}"]`)).toBeChecked(); expect(await page.getByRole("radio").evaluateAll(nodes => nodes.map(n => (n as HTMLInputElement).value))).toEqual(order);
    await page.locator('input[type="date"]').fill("1945-08-17"); await page.locator("select").selectOption("before"); await page.getByRole("button", { name: zh ? "查看历法参考" : "Show calendar reference", exact: true }).click();
    await expect(page.locator("[data-weton-calendar-result]")).toContainText("Jumat Legi");
    await finish(page, zh, "scored"); await expect(page.locator("[data-weton-calendar-result]")).toContainText("Jumat Legi");
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await expect(page.locator('input[type="date"]')).toHaveValue(""); await expect(page.locator("select")).toHaveValue("unknown"); await expect(page.locator("[data-weton-count], [data-weton-calendar-result]")).toHaveCount(0);
    await page.locator('input[type="date"]').fill("2026-05-01"); await page.getByRole("button", { name: zh ? "退出并清除本次进度" : "Exit and clear this attempt", exact: true }).click(); await expect(page.locator('input[type="date"]')).toHaveValue("");
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await expect(page.getByRole("radio").first()).not.toBeChecked(); expect(seen).toEqual([]);
  });

  test(`@release Weton stories ${locale}: allNA and singleNA finish without any personal ranks or matches`, async ({ page }) => {
    const seen = privateRequests(page); await page.goto(path); await acceptCookies(page, zh); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await finish(page, zh, "na");
    await page.getByRole("button", { name: zh ? "重新测试" : "Retake test", exact: true }).click(); await finish(page, zh, "one-na");
    await expect(page.getByRole("button", { name: /Copy result|复制结果/ })).toHaveCount(0); expect(seen).toEqual([]);
  });

  test(`@release Weton stories ${locale}: delayed hydration, denied stale storage, refresh and language start fresh`, async ({ page }) => {
    await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, async route => { await new Promise(resolve => setTimeout(resolve, 250)); await route.continue(); });
    await page.addInitScript(() => {
      const key = "fm_questionnaire_draft:weton-story-preferences", touches: string[] = [], set = Storage.prototype.setItem, get = Storage.prototype.getItem, remove = Storage.prototype.removeItem;
      set.call(sessionStorage, key, JSON.stringify({ version: "fm_weton_story35_v1", answers: { WETON35_001: "senin" }, date: "1945-08-17" }));
      (window as Window & { wetonStorageTouches?: string[] }).wetonStorageTouches = touches;
      Storage.prototype.getItem = function(k) { if (k === key) { touches.push("get"); throw new Error("synthetic storage denial"); } return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k === key) { touches.push("set"); throw new Error("synthetic storage denial"); } return set.call(this, k, v); };
      Storage.prototype.removeItem = function(k) { if (k === key) { touches.push("remove"); throw new Error("synthetic storage denial"); } return remove.call(this, k); };
    });
    await page.goto(path); await expect(page.getByRole("button", { name: /Resume this tab|恢复本标签页/ })).toHaveCount(0); await expect(page.locator('input[type="date"]')).toHaveValue("");
    await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await expect(page.locator('input[value="senin"]')).not.toBeChecked(); await page.locator('input[value="senin"]').check(); await page.locator('input[type="date"]').fill("1945-08-17");
    expect(await page.evaluate(() => (window as Window & { wetonStorageTouches?: string[] }).wetonStorageTouches)).toEqual([]);
    await page.reload(); await expect(page.locator('input[type="date"]')).toHaveValue(""); await page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click(); await expect(page.locator('input[value="senin"]')).not.toBeChecked();
    const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/weton-story-preferences`); await expect(page.locator('input[type="date"]')).toHaveValue(""); await page.getByRole("button", { name: other === "zh" ? "开始测试" : "Start test", exact: true }).click(); await expect(page.locator('input[value="senin"]')).not.toBeChecked();
    expect(await page.evaluate(() => (window as Window & { wetonStorageTouches?: string[] }).wetonStorageTouches)).toEqual([]);
  });
}

test("@release Weton calendar: bilingual unknown sunset keeps both days, before/after separates, edit clears stale references", async ({ page }) => {
  const seen = privateRequests(page);
  for (const locale of ["en", "zh"]) {
    const zh = locale === "zh"; await page.goto(`/${locale}/tests/explore/weton-story-preferences`); await acceptCookies(page, zh);
    await page.locator('input[type="date"]').fill("1945-08-17"); await page.getByRole("button", { name: zh ? "查看历法参考" : "Show calendar reference", exact: true }).click();
    await expect(page.locator("[data-weton-calendar-reference]")).toHaveCount(2); await expect(page.locator("[data-weton-calendar-result]")).toContainText("Jumat Legi"); await expect(page.locator("[data-weton-calendar-result]")).toContainText("Sabtu Pahing");
    await page.locator("select").selectOption("after"); await expect(page.locator("[data-weton-calendar-result]")).toHaveCount(0); await page.getByRole("button", { name: zh ? "查看历法参考" : "Show calendar reference", exact: true }).click(); await expect(page.locator("[data-weton-calendar-reference]")).toHaveCount(1); await expect(page.locator("[data-weton-calendar-result]")).toContainText("1945-08-18");
    await page.locator('input[type="date"]').fill("2026-05-01"); await expect(page.locator("[data-weton-calendar-result]")).toHaveCount(0); await page.locator("select").selectOption("before"); await page.getByRole("button", { name: zh ? "查看历法参考" : "Show calendar reference", exact: true }).click(); await expect(page.locator("[data-weton-calendar-result]")).toContainText("Jumat Pon");
    await page.getByRole("button", { name: zh ? "清除历法输入" : "Clear calendar inputs", exact: true }).click(); await expect(page.locator('input[type="date"]')).toHaveValue(""); await expect(page.locator("select")).toHaveValue("unknown"); await expect(page.locator("[data-weton-calendar-result], [data-weton-count]")).toHaveCount(0); expect(new URL(page.url()).search).toBe("");
  }
  expect(seen).toEqual([]);
});

test("@release Weton stories: all70full public guide bodies, sampled hydrated guides, canonical pairs and closed identities", async ({ page, request }) => {
  for (const locale of ["en", "zh"] as const) {
    for (let start = 0; start < quiz.profiles.length; start += 5) await Promise.all(quiz.profiles.slice(start, start + 5).map(async profile => {
      const path = `/${locale}/tests/explore/${quiz.slug}/results/${profile.id}`, response = await request.get(path); expect(response.status()).toBe(200); const html = await response.text();
      for (const section of profile.sections) for (const text of section.paragraphs) expect(html).toContain(text[locale].replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#x27;"));
      expect(html).toContain(`https://fermatmind.com${path}`);
    }));
    const profile = quiz.profiles[locale === "en" ? 34 : 14], path = `/${locale}/tests/explore/${quiz.slug}/results/${profile.id}`;
    expect((await page.goto(path))?.status()).toBe(200); await acceptCookies(page, locale === "zh"); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    for (const section of profile.sections) await expect(page.locator(`#report-${section.id} h2`)).toHaveText(section.title[locale]);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/${quiz.slug}/results/${profile.id}`);
    await expect(page.locator("[data-weton-count], input[type=date]")).toHaveCount(0);
  }
  for (const path of ["/en/tests/explore/weton-story-preferences/results/official-temperament", "/zh/tests/explore/weton-story-preferences/results/WETON35_001", "/en/tests/play/weton-story-preferences", "/og/fun/weton-story-preferences?locale=xx", "/og/fun/weton-story-preferences?locale=en&portrait=official-temperament"]) expect((await request.get(path)).status()).toBe(404);
});

test("@release Weton calendar: every control waits for hydration and the first direct calendar input is retained", async ({ page }) => {
  const seen = privateRequests(page);
  for (const locale of ["en", "zh"]) {
    const zh = locale === "zh";
    let release!: () => void;
    const scriptsReady = new Promise<void>(resolve => { release = resolve; });
    const delayedScripts = async (route: import("@playwright/test").Route) => { await scriptsReady; await route.continue(); };
    await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, delayedScripts);
    try {
      await page.goto(`/${locale}/tests/explore/weton-story-preferences`, { waitUntil: "commit" });
      const input = page.locator('input[type="date"]'), select = page.locator("select"), show = page.getByRole("button", { name: zh ? "查看历法参考" : "Show calendar reference", exact: true });
      await expect(input).toBeVisible(); await expect(input).toBeDisabled(); await expect(select).toBeDisabled(); await expect(show).toBeDisabled();
      await expect(page.getByRole("button", { name: zh ? "清除历法输入" : "Clear calendar inputs", exact: true })).toBeDisabled();
      release(); await page.waitForLoadState("load"); await expect(input).toBeEnabled(); await input.fill("1945-08-17"); await show.click();
      await expect(input).toHaveValue("1945-08-17"); await expect(page.locator("[data-weton-calendar-reference]")).toHaveCount(2);
      await expect(page.locator("[data-weton-calendar-result]")).toContainText("Jumat Legi"); await expect(page.locator("[data-weton-calendar-result]")).toContainText("Sabtu Pahing");
      expect(new URL(page.url()).search).toBe("");
    } finally { release(); await page.unroute(/\/_next\/static\/.*\.js(?:\?|$)/, delayedScripts); }
  }
  expect(seen).toEqual([]);
});
