import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { NatalChartQuestionnaire } from "@/lib/questionnaires/natalChart";

const quiz = JSON.parse(readFileSync("lib/questionnaires/data/natal-chart.json", "utf8")) as NatalChartQuestionnaire;
const box = (page: Page) => page.locator("[data-natal-client]");
async function enter(page: Page, date = "2001-06-15", time = "08:30", reference = "europe-london") {
  await page.locator("#natal-date").fill(date); await page.locator("#natal-time").fill(time);
  await page.locator("#natal-reference").selectOption(reference); await page.locator("#natal-confirm").check();
}
async function calculate(page: Page, zh: boolean) {
  await box(page).getByRole("button", { name: zh ? "计算本次星盘" : "Calculate this chart", exact: true }).click();
}
async function complete(page: Page, zh: boolean) { await calculate(page, zh); await expect(box(page).locator("[data-natal-result]")).toBeVisible(); }

for (const locale of ["en", "zh"] as const) {
  const zh = locale === "zh", entry = `/${locale}/tests/explore/natal-chart`;
  test(`@release Natal chart ${locale}: known time, ten body roles, actual Sun/Moon/rising and all public prose`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors: string[] = [], leaks: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", request => { if (/2001(?:-|%2D)06(?:-|%2D)15|08(?::|%3A)30|51(?:\.|%2E)5|Europe(?:\/|%2F)London|[?&](?:birth|latitude|longitude|answers)=/i.test(`${request.url()} ${request.postData() ?? ""}`)) leaks.push(request.url()); });
    await page.goto(entry); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    const decline = page.getByRole("button", { name: zh ? "拒绝" : "Decline", exact: true }); if (await decline.count()) await decline.click();
    await expect(page.locator('[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${entry}`);
    await expect(page.locator("#natal-date")).toHaveValue(""); await expect(page.locator("#natal-zone")).toHaveValue("");
    for (const profile of quiz.profiles) await expect(page.getByRole("link", { name: profile.title[locale], exact: true })).toBeVisible();
    await enter(page); await page.locator("#natal-confirm").uncheck(); await page.locator("#natal-confirm").focus(); await page.keyboard.press("Space"); await expect(page.locator("#natal-confirm")).toBeChecked();
    await complete(page, zh);
    const result = box(page).locator("[data-natal-result]");
    await expect(result.locator("[data-natal-body]")).toHaveCount(10); await expect(result.locator("[data-natal-body-reading]")).toHaveCount(10);
    await expect(result.locator('[data-natal-body="sun"]')).toContainText(zh ? "双子座" : "Gemini"); await expect(result.locator('[data-natal-body="moon"]')).toContainText(zh ? "白羊座" : "Aries");
    await expect(result.locator("[data-natal-ascendant]")).toContainText(zh ? "狮子座" : "Leo");
    for (const role of quiz.natalChart.bodyRoles) for (const p of role.paragraphs) await expect(result.locator(`[data-natal-body-reading="${role.id}"]`)).toContainText(p[locale]);
    for (const [sign, role] of [["gemini", "sun"], ["aries", "moon"], ["leo", "ascendant"]]) {
      const paragraph = quiz.profiles.find(p => p.id === sign)!.sections.find(s => s.id === role)!.paragraphs[0][locale]; await expect(result).toContainText(paragraph);
    }
    await expect(result.locator('[data-natal-element="air"]')).toHaveText("6"); await expect(result.locator('[data-natal-element="water"]')).toHaveText("0"); await expect(result.locator('[data-natal-modality="mutable"]')).toHaveText("6");
    expect(new URL(page.url()).pathname).toBe(entry); expect(new URL(page.url()).search).toBe(""); expect(leaks).toEqual([]); expect(errors).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("#natal-result-title").scrollIntoViewIfNeeded(); await page.evaluate(() => document.fonts.ready);
    await info.attach(`Natal-chart-${locale}-mobile-readout-consent-declined`, { body: await page.screenshot(), contentType: "image/png" });
    await result.locator('[data-natal-body-reading="sun"] a').click();
    const profile = quiz.profiles.find(p => p.id === "gemini")!; await expect(page.getByRole("heading", { level: 1 })).toHaveText(profile.title[locale]);
    for (const s of profile.sections) for (const p of s.paragraphs) await expect(page.locator("main")).toContainText(p[locale]);
    await page.goBack(); await expect(page.getByRole("heading", { level: 1 })).toHaveText(quiz.title[locale]);
    await expect(page.locator("#natal-date")).toHaveValue(""); await expect(box(page).locator("[data-natal-result]")).toHaveCount(0);
  });

  test(`@release Natal chart ${locale}: unknown/gap/fold, actual future instant and polar downgrade`, async ({ page }, info) => {
    await page.goto(entry); await page.locator("#natal-unknown-time").check();
    await expect(box(page).getByRole("button", { name: zh ? "计算本次星盘" : "Calculate this chart", exact: true })).toBeDisabled();
    await expect(page.locator("#natal-time")).toHaveValue(""); await expect(box(page).locator("[data-natal-known-time-notice]")).toBeVisible();
    await page.locator("#natal-unknown-time").uncheck(); await enter(page, "2024-03-10", "02:30", "america-new-york"); await calculate(page, zh);
    await expect(box(page).getByRole("status")).toContainText(zh ? "钟表时间不存在" : "clock time does not exist"); await expect(box(page).locator("[data-natal-result]")).toHaveCount(0);
    await page.locator("#natal-date").fill("2024-11-03"); await page.locator("#natal-time").fill("01:30"); await calculate(page, zh);
    await expect(box(page).getByRole("radio")).toHaveCount(2); await expect(box(page).getByRole("radio").nth(0)).not.toBeChecked(); await expect(box(page).getByRole("radio").nth(1)).not.toBeChecked();
    await expect(box(page)).toContainText("2024-11-03T05:30:00Z"); await expect(box(page)).toContainText("2024-11-03T06:30:00Z");
    await info.attach(`Natal-chart-${locale}-fold-no-default`, { body: await page.screenshot(), contentType: "image/png" });
    await box(page).getByRole("radio").nth(1).check(); await complete(page, zh); await expect(box(page).locator("[data-natal-result]")).toContainText("2024-11-03T06:30:00Z");
    await page.locator("#natal-date").fill("2099-12-31"); await calculate(page, zh); await expect(box(page).getByRole("status")).toContainText(zh ? "晚于设备当前时刻" : "later than this device");
    await enter(page); await page.locator("#natal-latitude").fill("90"); await page.locator("#natal-confirm").check(); await complete(page, zh);
    await expect(box(page).locator("[data-natal-angle-unavailable]")).toBeVisible(); await expect(box(page).locator("[data-natal-body-reading]")).toHaveCount(10); await expect(box(page).locator("[data-natal-rising-reading]")).toHaveCount(0);
    for (const row of await box(page).locator("[data-natal-body]").all()) await expect(row).toContainText(zh ? "不可用" : "Unavailable");
    await page.locator("#natal-result-title").scrollIntoViewIfNeeded(); await info.attach(`Natal-chart-${locale}-polar-planets-retained`, { body: await page.screenshot(), contentType: "image/png" });
  });

  test(`@release Natal chart ${locale}: denied storage/clipboard, public links and clear/reload/locale/BFCache resets`, async ({ page }) => {
    await page.addInitScript(() => {
      const get = Storage.prototype.getItem, set = Storage.prototype.setItem, remove = Storage.prototype.removeItem;
      const forbidden = (key: string) => key.startsWith("fm_questionnaire_draft:") || /natal/i.test(key);
      Storage.prototype.getItem = function(key) { if (forbidden(key)) throw new Error("Synthetic storage refusal"); return get.call(this, key); };
      Storage.prototype.setItem = function(key, value) { if (forbidden(key)) throw new Error("Synthetic storage refusal"); return set.call(this, key, value); };
      Storage.prototype.removeItem = function(key) { if (forbidden(key)) throw new Error("Synthetic storage refusal"); return remove.call(this, key); };
      Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("Synthetic clipboard refusal"); } } });
    });
    await page.goto(entry); await enter(page); await complete(page, zh);
    await box(page).getByRole("button", { name: zh ? "复制公开入口和指南网址" : "Copy public calculator and guide URLs", exact: true }).click();
    const urls = await box(page).getByRole("textbox", { name: zh ? "手动复制公开网址" : "Public URLs for manual copying", exact: true }).inputValue();
    expect(urls.split("\n")).toEqual([`https://fermatmind.com${entry}`, ...quiz.profiles.map(p => `https://fermatmind.com${entry}/results/${p.id}`)]);
    expect(urls).not.toMatch(/2001|08:30|51\.5|London|24\.0|[?&]/);
    await box(page).getByRole("button", { name: zh ? "清除输入与结果" : "Clear input and result", exact: true }).click(); await expect(page.locator("#natal-date")).toHaveValue(""); await expect(box(page).locator("[data-natal-result]")).toHaveCount(0);
    await enter(page); await complete(page, zh); await page.reload(); await expect(page.locator("#natal-date")).toHaveValue("");
    await enter(page); const other = zh ? "en" : "zh"; await page.goto(`/${other}/tests/explore/natal-chart`); await expect(page.locator("#natal-date")).toHaveValue("");
    await enter(page); await complete(page, !zh); await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
    await expect(page.locator("#natal-zone")).toHaveValue(""); await expect(box(page).locator("[data-natal-result]")).toHaveCount(0);
  });
}

test("@release Natal chart: all26 public pages visibly render their complete text and local images", async ({ page, request }) => {
  test.setTimeout(90000);
  expect((await request.get("/en/tests/explore/natal-chart/results/unknown")).status()).toBe(404);
  for (const locale of ["en", "zh"]) for (const profile of [null, ...quiz.profiles]) {
    await page.goto(`/${locale}/tests/explore/natal-chart${profile ? `/results/${profile.id}` : ""}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText((profile ?? quiz).title[locale as "en" | "zh"]);
    if (!profile) {
      const houses = page.locator("[data-natal-house-guide]");
      await houses.locator("summary").click(); await expect(houses).toHaveAttribute("open", "");
      for (const house of quiz.natalChart.houseContexts) {
        const reference = houses.locator(`[data-natal-house-reference="${house.number}"]`);
        await expect(reference.getByRole("heading", { level: 3 })).toContainText(house.topic[locale as "en" | "zh"]);
        await expect(reference.getByText(house.reading[locale as "en" | "zh"], { exact: true })).toBeVisible();
      }
      await expect(page.locator("#natal-date")).toHaveValue(""); await expect(page.locator("[data-natal-result]")).toHaveCount(0);
    }
    const sections = profile ? profile.sections : quiz.guide;
    for (const section of sections) {
      const scope = profile ? page.locator(`#natal-public-${profile.id}-${section.id}`) : page.locator('section[aria-labelledby="natal-method"]');
      for (const paragraph of section.paragraphs) await expect(scope.getByText(paragraph[locale as "en" | "zh"], { exact: true })).toBeVisible();
    }
    const response = await request.get(`/og/fun/natal-chart?locale=${locale}${profile ? `&portrait=${profile.id}` : ""}`);
    expect(response.status()).toBe(200); const png = await response.body(); expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
  }
});

test("@release Natal chart: server HTML contains a disabled calculator and full public readings before hydration", async ({ browser }, info) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: info.project.use.baseURL });
  try {
    const page = await context.newPage(); await page.goto("/en/tests/explore/natal-chart");
    // The shared tests loading boundary streams hidden segments until hydration.
    // Check the actual server HTML here; visible navigation is covered above.
    await expect(page.locator('[data-natal-client] button').filter({ hasText: /^Calculate this chart$/ })).toBeDisabled();
    await expect(page.locator("[data-natal-result]")).toHaveCount(0); await expect(page.locator("[data-natal-client] form")).toHaveCount(0);
    const link = page.locator(`a[href="/en/tests/explore/natal-chart/results/${quiz.profiles[0].id}"]`);
    await expect(link).toHaveCount(1);
    await page.goto(`/en/tests/explore/natal-chart/results/${quiz.profiles[0].id}`);
    expect(await page.locator("h1").textContent()).toBe(quiz.profiles[0].title.en);
    const serverText = (await page.locator("main").allTextContents()).join(" ");
    for (const s of quiz.profiles[0].sections) for (const p of s.paragraphs) expect(serverText).toContain(p.en);
  } finally { await context.close(); }
});
