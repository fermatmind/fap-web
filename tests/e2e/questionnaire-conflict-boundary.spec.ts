import { test, expect, type Page } from "@playwright/test";
import data from "../../lib/questionnaires/data/conflict-boundary-behaviors-test.json";
const values = Array.from({ length: 24 }, (_, i) => ["1", "3", "5", "3", "2", "4"][i % 6]);
const means = ["3.0000", "3.0000", "3.0000", "3.0000"];
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
          && !/conflict-boundary-behaviors-test|CBS_|RISKY_PERSONALITY/.test(raw)) return;
      } catch { /* Unreadable or unexpected analytics remain failures. */ }
    }
    attempts.push(r.url());
  });
  return attempts;
}
async function answer(page: Page, locale: "en" | "zh", mode: "worked" | "partial" | "all-na") {
  for (const [i, q] of data.questions.entries()) {
    const value = mode === "all-na" || (mode === "partial" && [3, 4, 8, 9, 10].includes(i)) ? "na" : values[i];
    const radio = page.locator(`input[name="${q.id}"][value="${value}"]`);
    if (i === 0) { await radio.focus(); await page.keyboard.press("Space"); await expect(radio).toBeChecked(); }
    else await radio.check();
    await expect(page.locator("[data-conflict-result]")).toHaveCount(0);
    await page.getByRole("button", { name: locale === "zh" ? (i === 23 ? "查看本次记录" : "下一题") : (i === 23 ? "See this record" : "Next"), exact: true }).click();
  }
  await expect(page.locator("[data-conflict-result]")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: data.resultHeading[locale], exact: true })).toBeFocused();
  if (mode === "all-na") {
    await expect(page.locator("[data-conflict-all-insufficient]")).toBeVisible();
    await expect(page.locator("[data-conflict-part], [data-conflict-mean], [data-conflict-sum]")).toHaveCount(0);
    await expect(page.locator('[id^="conflict-report-"]')).toHaveCount(0);
  } else {
    await expect(page.locator("[data-conflict-part]")).toHaveCount(4);
    let paragraphs = 0;
    for (const [i, profile] of data.profiles.entries()) {
      const part = page.locator(`[data-conflict-part="${profile.directionIds[0]}"]`);
      if (mode === "partial" && i === 1) {
        await expect(part.locator("[data-conflict-insufficient]")).toBeVisible();
        await expect(part.locator("[data-conflict-mean], [data-conflict-sum], [id^=conflict-report-]")).toHaveCount(0);
        await expect(part.locator("[data-conflict-count]")).toContainText(locale === "zh" ? "3 / 6" : "3 of 6");
        continue;
      }
      await expect(part.locator("[data-conflict-mean]")).toContainText((mode === "partial" && i === 0 ? "3.2500" : means[i]) + " / 5");
      if (mode === "partial" && i === 0) await expect(part.locator("[data-conflict-mean]")).toContainText("13 ÷ 4");
      for (const section of profile.sections) {
        const body = part.locator(`[id="conflict-report-${profile.id}-${section.id}"]`);
        await expect(body.locator("h4")).toHaveText(section.title[locale]);
        for (const paragraph of section.paragraphs) { await expect(body.getByText(paragraph[locale], { exact: true })).toBeVisible(); paragraphs++; }
      }
    }
    expect(paragraphs).toBe(mode === "partial" ? 48 : 64);
  }
  await expect(page.locator("#take-test").getByRole("textbox")).toHaveCount(0);
  await expect(page.locator("#take-test").getByRole("button", { name: /copy|share|复制|分享/i })).toHaveCount(0);
  const ids = await page.locator("#take-test [id]").evaluateAll(nodes => nodes.map(n => n.id)); expect(new Set(ids).size).toBe(ids.length);
}
for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/conflict-boundary-behaviors-test`;
  const start = (page: Page) => page.getByRole("button", { name: zh ? "开始测试" : "Start test", exact: true }).click();
  test(`@release conflict ${locale}: hub, keyboard,24 responses, four means, all64 paragraphs, mobile progress and empty retake`, async ({ page }) => {
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
    const header = await page.getByRole("banner").boundingBox(), progress = await page.locator("[data-conflict-progress]").boundingBox();
    expect(header).not.toBeNull(); expect(progress).not.toBeNull(); expect(progress!.y).toBeGreaterThanOrEqual(header!.y + header!.height);
    await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await expect(page.locator("#take-test [role=status]")).toContainText(zh ? "请选择" : "Choose a number");
    await answer(page, locale, "worked");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await page.evaluate(() => sessionStorage.getItem("fm_questionnaire_draft:conflict-boundary-behaviors-test"))).toBeNull();
    await page.getByRole("button", { name: zh ? "愿意时重新作答（清除本次回答）" : "Answer again if you want (empty answers)", exact: true }).click();
    await expect(page.locator("[data-conflict-result]")).toHaveCount(0); await expect(page.getByRole("radio").first()).not.toBeChecked(); expect(attempts).toEqual([]);
  });
  test(`@release conflict ${locale}: edit, reload, language, leave and exit clear memory`, async ({ page }) => {
    await page.goto(entry); await start(page);
    await page.locator('input[value="2"]').check(); await page.getByRole("button", { name: zh ? "下一题" : "Next", exact: true }).click();
    await page.getByRole("button", { name: zh ? "上一题" : "Back", exact: true }).click();
    await expect(page.locator('input[value="2"]')).toBeChecked(); await page.locator('input[value="4"]').check();
    await page.reload(); await start(page); await expect(page.locator('input[value="4"]')).not.toBeChecked();
    await page.locator('input[value="5"]').check(); const other = zh ? "en" : "zh";
    await page.goto(`/${other}/tests/explore/conflict-boundary-behaviors-test`); await page.getByRole("button", { name: other === "zh" ? "开始测试" : "Start test", exact: true }).click();
    await expect(page.locator('input[value="5"]')).not.toBeChecked();
    await page.goto(entry); await start(page); await page.locator('input[value="3"]').check();
    await page.getByRole("button", { name: zh ? "退出并清除本次回答" : "Exit and clear these responses", exact: true }).click(); await start(page); await expect(page.locator('input[value="3"]')).not.toBeChecked();
    await page.locator('input[value="1"]').check(); await page.goto(`/${locale}/tests`); await page.goBack(); await start(page); await expect(page.locator('input[value="1"]')).not.toBeChecked();
  });
  test(`@release conflict ${locale}: all-skipped suppresses personal factors; partial4of6 and3of6 follow source; no storage, clipboard or analytics`, async ({ page }) => {
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
test("@release conflict: all eight public full guides, ten local-font OG images, canonical pairs and closed identities", async ({ page, request }) => {
  const attempts = observeAnalytics(page);
  for (const locale of ["en", "zh"] as const) {
    for (const profile of data.profiles) {
      const path = `/${locale}/tests/explore/conflict-boundary-behaviors-test/results/${profile.id}`;
      expect((await page.goto(path))?.status()).toBe(200); await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
      await expect(page).toHaveTitle(`${profile.seo.title[locale]} | FermatMind`); await expect(page.locator("[data-conflict-mean]")).toHaveCount(0);
      for (const s of profile.sections) {
        const body = page.locator(`#report-${s.id}`); await expect(body.locator("h2")).toHaveText(s.title[locale]);
        for (const p of s.paragraphs) await expect(body.getByText(p[locale], { exact: true })).toBeVisible();
      }
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path}`);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `https://fermatmind.com/en/tests/explore/conflict-boundary-behaviors-test/results/${profile.id}`);
      await expect(page.locator('link[rel="alternate"][hreflang="zh-CN"]')).toHaveAttribute("href", `https://fermatmind.com/zh/tests/explore/conflict-boundary-behaviors-test/results/${profile.id}`);
      const startLinks = page.locator(`[href='/${locale}/tests/explore/conflict-boundary-behaviors-test#take-test']`);
      await expect(startLinks).toHaveCount(2);
      for (const link of await startLinks.all()) await expect(link).toBeVisible();
    }
    for (const profile of [null, ...data.profiles]) {
      const response = await request.get(`/og/fun/conflict-boundary-behaviors-test?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`);
      expect(response.status()).toBe(200); const bytes = await response.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    }
  }
  for (const path of ["/en/tests/explore/conflict-boundary-behaviors-test/results/unknown", "/zh/tests/explore/conflict-boundary-behaviors-test/results/CBS_001", "/en/tests/play/conflict-boundary-behaviors-test"])
    expect((await request.get(path)).status()).toBe(404);
  expect(attempts).toEqual([]);
});
