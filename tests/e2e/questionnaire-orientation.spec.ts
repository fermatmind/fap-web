import { test, expect, type Page } from "@playwright/test";
import data from "../../lib/questionnaires/data/orientation-exploration-test.json";
const values = ["1", "3", "5", "na"];
test.beforeEach(async ({ page }) => {
  await page.route(/\/api\/(?:v0\.5\/seo\/attribution\/events|track)(?:\?|$)|https:\/\/(?:www\.googletagmanager\.com|(?:www\.)?google-analytics\.com|hm\.baidu\.com)\//, route => route.fulfill({ status: 204 }));
  await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "granted" })));
});
function observeAnalytics(page: Page, hubLandingPath?: string, beforeHubClick?: () => boolean) {
  const attempts: string[] = [];
  page.on("request", r => {
    if (!/\/api\/(?:v0\.5\/seo\/attribution\/events|track)(?:\?|$)|googletagmanager\.com|google-analytics\.com|hm\.baidu\.com/.test(r.url())) return;
    if (hubLandingPath && beforeHubClick?.() && new URL(page.url()).pathname === hubLandingPath && r.method() === "GET") {
      const url = new URL(r.url());
      if ((url.origin === "https://www.googletagmanager.com" && url.pathname === "/gtag/js")
        || (url.origin === "https://hm.baidu.com" && url.pathname === "/hm.js")) return;
    }
    // A hub arrival may dispatch after the link click. Only that proven,
    // nonsensitive arrival belongs to the preceding page; form events still fail.
    if (hubLandingPath && r.method() === "POST" && /\/seo\/attribution\/events(?:\?|$)/.test(r.url())) {
      try {
        const raw = r.postData() ?? "", event = JSON.parse(raw) as { eventName?: unknown; path?: unknown; payload?: Record<string, unknown> };
        if (event?.eventName === "landing_pv" && event.path === hubLandingPath
          && ["landing_path", "url", "source_url", "current_path"].every(key => event.payload?.[key] === hubLandingPath)
          && !/orientation-exploration-test|ORIENT_REF_|ORIENTATION_EXPLORATION/.test(raw)) return;
      } catch { /* Unreadable or unexpected analytics remain failures. */ }
    }
    attempts.push(r.url());
  });
  return attempts;
}
async function answer(page: Page, locale: "en" | "zh", mode: "worked" | "partial" | "all-na") {
  for (const [i, q] of data.questions.entries()) {
    const value = mode === "all-na" || (mode === "partial" && i < 4) ? "na" : values[i % 4];
    const radio = page.locator(`input[name="${q.id}"][value="${value}"]`);
    if (i === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); } else await radio.check();
    await expect(page.locator("[data-orientation-result]")).toHaveCount(0);
    await page.getByRole("button", { name: locale === "zh" ? (i === 19 ? "查看本次记录" : "下一题") : (i === 19 ? "See this record" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-orientation-result]")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: data.resultHeading[locale], exact: true })).toBeFocused();
  if (mode === "all-na") {
    await expect(page.locator("[data-orientation-all-skipped]")).toBeVisible();
    await expect(page.locator("[data-orientation-domain], [id^=orientation-report-]")).toHaveCount(0);
  } else {
    await expect(page.locator("[data-orientation-domain]")).toHaveCount(5); let paragraphs = 0;
    for (const [i, profile] of data.profiles.entries()) {
      const part = page.locator(`[data-orientation-domain="${profile.directionIds[0]}"]`), skipped = mode === "partial" && i === 0;
      await expect(part.locator("[data-orientation-counts]")).toHaveText(locale === "zh"
        ? `4条陈述：${skipped ? 0 : 3}个数字回答（其中${skipped ? 0 : 1}个暂不确定），${skipped ? 4 : 1}个明确跳过。`
        : `4 statements: ${skipped ? 0 : 3} numeric responses (including ${skipped ? 0 : 1} uncertain); ${skipped ? 4 : 1} explicitly skipped.`);
      await expect(part.locator("[data-orientation-distribution] dd")).toHaveText(skipped ? (locale === "zh" ? ["0次", "0次", "0次", "0次", "0次", "4次"] : ["0", "0", "0", "0", "0", "4"]) : (locale === "zh" ? ["1次", "0次", "1次", "0次", "1次", "1次"] : ["1", "0", "1", "0", "1", "1"]));
      if (skipped) await expect(part.locator("[data-orientation-domain-skipped]")).toBeVisible();
      for (const section of profile.sections) {
        const body = part.locator(`[id="orientation-report-${profile.id}-${section.id}"]`);
        await expect(body.locator("h4")).toHaveText(section.title[locale]);
        for (const paragraph of section.paragraphs) { await expect(body.getByText(paragraph[locale], { exact: true })).toBeVisible(); paragraphs++; }
      }
    }
    expect(paragraphs).toBe(60);
  }
  await expect(page.locator("#take-test").getByRole("textbox")).toHaveCount(0);
  await expect(page.locator("#take-test").getByRole("button", { name: /copy|share|复制|分享/i })).toHaveCount(0);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/orientation-exploration-test`;
  const start = (page: Page) => page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
  test(`@release orientation ${locale}: hub, keyboard,20 responses, five response distributions, all60 paragraphs, mobile progress and empty retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}/tests`);
    let onHubBeforeClick = true;
    const attempts = observeAnalytics(page, `/${locale}/tests`, () => onHubBeforeClick);
    const hubLink = page.locator("#more-tests").getByRole("link", { name: data.title[locale], exact: true });
    await expect(hubLink).toBeVisible();
    onHubBeforeClick = false;
    await hubLink.click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(data.title[locale]);
    await expect(page).toHaveTitle(`${data.seoTitle[locale]} | FermatMind`);
    for (const s of data.guide) for (const p of s.paragraphs) await expect(page.locator('section[aria-labelledby="questionnaire-method"]').getByText(p[locale], { exact: true })).toBeVisible();
    await start(page);
    const header = await page.getByRole("banner").boundingBox(), progress = await page.locator("[data-orientation-progress]").boundingBox();
    expect(header).not.toBeNull(); expect(progress).not.toBeNull(); expect(progress!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.locator("#take-test [role=status]")).toContainText(zh ? "请选择" : "Choose a number");
    await answer(page, locale, "worked");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:orientation-exploration-test"))).toBeNull();
    await page.getByRole("button", { name: zh ? "愿意时重新作答（清除本次回答）" : "Answer again if you want (empty answers)", exact: true }).click();
    await expect(page.locator("[data-orientation-result]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); expect(attempts).toEqual([]);
  });
  test(`@release orientation ${locale}: edit, reload, language, leave and exit clear memory`, async ({ page }) => {
    await page.goto(entry); await start(page);
    await page.locator('input[value="2"]').check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(page.locator('input[value="2"]')).toBeChecked(); await page.locator('input[value="4"]').check();
    await page.reload(); await start(page); await expect(page.locator('input[value="4"]')).not.toBeChecked();
    await page.locator('input[value="5"]').check(); const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/orientation-exploration-test`); await page.getByRole("button", { name: other === "zh" ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.locator('input[value="5"]')).not.toBeChecked();
    await page.goto(entry); await start(page); await page.locator('input[value="3"]').check();
    await page.getByRole("button", { name: zh ? "退出并清除本次回答" : "Exit and clear these responses", exact: true }).click(); await start(page); await expect(page.locator('input[value="3"]')).not.toBeChecked();
    await page.locator('input[value="1"]').check(); await page.goto(`/${locale}/tests`); await page.goBack(); await start(page); await expect(page.locator('input[value="1"]')).not.toBeChecked();
  });
  test(`@release orientation ${locale}: all-skipped suppresses personal cards; a wholly skipped topic remains explicit; no storage, clipboard or analytics`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem;
      Storage.prototype.getItem = function(k) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return get.call(this, k); };
      Storage.prototype.setItem = function(k, v) { if (k.startsWith("fm_questionnaire_draft:")) throw new Error("synthetic storage denial"); return set.call(this, k, v); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("synthetic clipboard denial"); } } });
    });
    const attempts = observeAnalytics(page); await page.goto(entry); await start(page); await answer(page, locale, "all-na");
    await page.getByRole("button", { name: zh ? "愿意时重新作答（清除本次回答）" : "Answer again if you want (empty answers)", exact: true }).click(); await answer(page, locale, "partial");
    await page.waitForTimeout(250); expect(attempts).toEqual([]);
  });
}
test("@release orientation: all ten public full guides, twelve local-font OG images, canonical pairs and closed identities", async ({ page, request }) => {
  const attempts = observeAnalytics(page);
  for (const locale of ["en", "zh"] as const) {
    for (const profile of data.profiles) {
      const path = `/${locale}/tests/explore/orientation-exploration-test/results/${profile.id}`;
      expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
      await expect(page).toHaveTitle(`${profile.seo.title[locale]} | FermatMind`); await expect(page.locator("[data-orientation-mean]")).toHaveCount(0);
      for (const s of profile.sections) {
        const body = page.locator(`#report-${s.id}`); await expect(body.locator("h2")).toHaveText(s.title[locale]);
        for (const p of s.paragraphs) await expect(body.getByText(p[locale], { exact: true })).toBeVisible();
      }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/orientation-exploration-test/results/${profile.id}`);
      await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href", `https://fermatmind.com/zh/tests/explore/orientation-exploration-test/results/${profile.id}`);
      const startLinks = page.locator(`[href='/${locale}/tests/explore/orientation-exploration-test#take-test']`);
      await expect(startLinks).toHaveCount(2);
      for (const link of await startLinks.all()) await expect(link).toBeVisible();
    }
    for (const profile of [null, ...data.profiles]) {
      const response = await request.get(`/og/fun/orientation-exploration-test?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`);
      expect(response.status()).toBe(200); const bytes = await response.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    }
  }
  for (const path of ["/en/tests/explore/orientation-exploration-test/results/unknown", "/zh/tests/explore/orientation-exploration-test/results/ORIENT_REF_001", "/en/tests/play/orientation-exploration-test"])
    expect((await request.get(path)).status()).toBe(404);
  expect(attempts).toEqual([]);
});
