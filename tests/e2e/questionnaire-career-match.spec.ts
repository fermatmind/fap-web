import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/career-match.json";
import { careerMatchDirectoryFixture, careerMatchRoleFixture } from "../fixtures/questionnaires/careerMatch";
type Locale = "en" | "zh";
const path = (l: Locale) => `/${l}/tests/explore/career-match`;
const label = (l: Locale, en: string, zh: string) => l === "zh" ? zh : en;
const directoryResponse = (url: string) => /\/api\/v0\.5\/career\/jobs\?/.test(url);
const roleResponse = (url: string) => /\/api\/v0\.5\/career\/jobs\/[^/?]+\?/.test(url);
// CI's local API uses synthetic source fixtures. Exact-SHA online acceptance opts
// into the real environment API and must run on an allowed public origin.
const liveSources = process.env.CAREER_MATCH_LIVE_SOURCE_QA === "1";
async function button(page: Page, l: Locale, en: string, zh: string) { await page.getByRole("button", { name: label(l, en, zh), exact: true }).click(); }
async function consent(page: Page, l: Locale) { const b = page.getByRole("button", { name: label(l, "Decline", "拒绝"), exact: true }); if (await b.isVisible()) await b.click(); }
for (const l of ["en", "zh"] as const) {
  test(`@release career-match ${l}: ${liveSources ? "real environment" : "synthetic fixture"} directory and two Current roles, literal intersections and private reset`, async ({ page, context, baseURL }) => {
    if (liveSources) expect(["fermatmind.com", "staging.fermatmind.com"]).toContain(new URL(baseURL!).hostname);
    else {
      await page.route("**/api/v0.5/career/jobs?*", route => route.fulfill({ json: careerMatchDirectoryFixture(l) }));
      await page.route("**/api/v0.5/career/jobs/*?*", route => {
        const slug = new URL(route.request().url()).pathname.split("/").pop()!;
        return route.fulfill({ json: careerMatchRoleFixture(l, slug, slug.endsWith("a") ? "ASE" : "RIC") });
      });
    }
    await page.setViewportSize({ width: 390, height: 844 }); await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const requests: { url: string; method: string; body: string }[] = [];
    page.on("request", r => requests.push({ url: r.url(), method: r.method(), body: r.postData() ?? "" }));
    await page.goto(`/${l}/tests`); await consent(page, l); await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click();
    await expect(page.locator("h1")).toHaveText(quiz.title[l]);
    expect(requests.filter(r => directoryResponse(r.url) || roleResponse(r.url))).toEqual([]);
    const directoryRead = page.waitForResponse(r => directoryResponse(r.url()));
    await button(page, l, "Start comparison", "开始比较");
    const dr = await directoryRead; expect(dr.status()).toBe(200); const directory = await dr.json();
    const select = page.locator("#career-match-role-0"); await expect(select.locator("option")).toHaveCount(directory.items.length + 1);
    const selected = directory.items.slice(0, 2).map((r: { identity: { canonical_slug: string } }) => r.identity.canonical_slug) as string[];
    expect(selected).toHaveLength(2);
    await button(page, l, "Compare interest themes", "查看主题比较"); await expect(page.locator("[data-career-match-message]")).toContainText(label(l, "at least one", "至少选择"));
    await page.locator('[data-interest-theme="A"]').focus(); await page.locator('[data-interest-theme="A"]').press("Space");
    for (const [i, slug] of selected.entries()) await page.locator(`#career-match-role-${i}`).selectOption(slug);
    await page.locator("#career-match-role-1").selectOption(selected[0]); await button(page, l, "Compare interest themes", "查看主题比较");
    await expect(page.locator("[data-career-match-message]")).toContainText(label(l, "different occupations", "不同职业"));
    expect(requests.filter(r => roleResponse(r.url))).toEqual([]); await page.locator("#career-match-role-1").selectOption(selected[1]);
    for (const d of quiz.directions) await page.locator(`[data-interest-theme="${d.id}"]`).check();
    const source: Record<string, { code: string; text: string[] }> = {};
    page.on("response", async r => { if (roleResponse(r.url()) && r.status() === 200) { const v = await r.json(); const b = v.data ?? v; const c = b.career_page?.display?.components?.riasec_fit_block; if (c) source[b.identity.canonical_slug] = { code: c.riasec, text: [c.riasec_short, c.interest, c.fit_interest] }; } });
    await button(page, l, "Compare interest themes", "查看主题比较");
    await expect(page.locator('[data-career-read-status="available"]')).toHaveCount(2, { timeout: 45000 }); await expect(page.locator("#career-match-result-title")).toBeFocused();
    for (const [i, slug] of selected.entries()) {
      await expect.poll(() => !!source[slug]).toBe(true); const row = page.locator("[data-career-match-role]").nth(i); await expect(row).toHaveAttribute("data-career-match-role", slug);
      await expect(row.locator("[data-career-interest-code]")).toHaveText(source[slug].code);
      for (const text of source[slug].text) await expect(row).toContainText(text);
      for (const d of quiz.directions) if (source[slug].code.includes(d.id)) await expect(row.locator("[data-career-shared-themes]")).toContainText(d.title[l]);
      await expect(row.locator("a")).toHaveAttribute("href", `/${l}/career/jobs/${slug}`);
    }
    expect(requests.filter(r => roleResponse(r.url))).toHaveLength(2);
    await page.locator("#career-match-result-title").scrollIntoViewIfNeeded(); await page.screenshot({ path: test.info().outputPath(`${l}-result.png`) });
    await page.locator("[data-career-match-role]").first().scrollIntoViewIfNeeded(); await page.screenshot({ path: test.info().outputPath(`${l}-role.png`) });
    await button(page, l, "Copy public entry", "复制公开入口"); expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${quiz.title[l]}\nhttps://fermatmind.com${path(l)}`);
    await page.locator("#career-match-filter").fill("PRIVATE_LOCAL_TITLE_FILTER"); await expect(page.locator("[data-career-match-result]")).toBeVisible();
    const absent = quiz.directions.filter(d => !source[selected[0]].code.includes(d.id)); expect(absent.length).toBeGreaterThan(0);
    for (const d of quiz.directions) await page.locator(`[data-interest-theme="${d.id}"]`).setChecked(absent.some(a => a.id === d.id));
    await expect(page.locator("[data-career-match-result]")).toHaveCount(0); await page.locator("#career-match-role-2").selectOption("");
    await button(page, l, "Compare interest themes", "查看主题比较"); await expect(page.locator('[data-career-read-status="available"]')).toHaveCount(2, { timeout: 45000 });
    await expect(page.locator("[data-career-match-role]").first().locator("[data-career-shared-themes]")).toContainText(label(l, "No shared selected theme", "没有共同的所选主题"));
    expect(new URL(page.url()).search + new URL(page.url()).hash).toBe(""); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(requests.filter(r => /PRIVATE_LOCAL_TITLE_FILTER/.test(r.url + r.body))).toEqual([]);
    expect(requests.filter(r => r.method === "POST" && /career-match|selectedThemes|selectedRoles|PRIVATE_LOCAL_TITLE_FILTER/.test(r.body))).toEqual([]);
    expect(await page.evaluate(() => Object.keys(sessionStorage).filter(k => k.includes("career-match")))).toEqual([]);
    await page.reload(); await expect(page.getByRole("button", { name: label(l, "Start comparison", "开始比较"), exact: true })).toBeVisible(); await expect(page.locator("[data-career-match-result]")).toHaveCount(0);
    await page.goto(path(l === "en" ? "zh" : "en")); await expect(page.locator('[data-interest-theme]:checked')).toHaveCount(0);
  });
  test(`@release career-match ${l}: synthetic failure fixtures distinguish failed and empty directory, invalid and missing roles and clear`, async ({ page }) => {
    let directoryMode = "failed";
    await page.route("**/api/v0.5/career/jobs?*", route => directoryMode === "failed" ? route.fulfill({ status: 503, json: { error: "Synthetic unavailable" } }) : route.fulfill({ json: careerMatchDirectoryFixture(l, directoryMode === "empty" ? [] : undefined) }));
    await page.route("**/api/v0.5/career/jobs/*?*", route => route.request().url().includes("contract-role-a?") ? route.fulfill({ json: { ...careerMatchRoleFixture(l), bundle_version: "legacy" } }) : route.fulfill({ status: 404, json: { error: "Synthetic absence" } }));
    await page.goto(path(l)); await consent(page, l); await button(page, l, "Start comparison", "开始比较");
    await expect(page.locator("#take-test")).toContainText(label(l, "list for this language is unavailable", "当前语言的职业目录暂不可用"));
    directoryMode = "empty"; await button(page, l, "Retry reading the career list", "重试读取职业目录"); await expect(page.locator("#take-test")).toContainText(label(l, "no public occupations", "暂无可供选择"));
    await button(page, l, "Exit and clear this comparison", "退出并清除本次比较"); directoryMode = "ready"; await button(page, l, "Start comparison", "开始比较");
    await page.locator('[data-interest-theme="A"]').check(); await page.locator("#career-match-role-0").selectOption("contract-role-a"); await page.locator("#career-match-role-1").selectOption("contract-role-b");
    await button(page, l, "Compare interest themes", "查看主题比较"); await expect(page.locator('[data-career-read-status="invalid"]')).toHaveCount(1); await expect(page.locator('[data-career-read-status="missing"]')).toHaveCount(1); await expect(page.locator("[data-career-shared-themes]")).toHaveCount(0);
    await button(page, l, "Clear and compare again", "清除并重新比较"); await expect(page.locator("[data-career-match-result]")).toHaveCount(0); await expect(page.locator("#career-match-filter")).toHaveCount(0);
  });
}
test("@release career-match two public entries, localized metadata, private-query-independent OGs and no invented result identity", async ({ page, request }) => {
  for (const l of ["en", "zh"] as const) {
    await page.goto(path(l)); await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${path(l)}`);
    for (const [lang, other] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]] as const) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com${path(other)}`);
    const text = await page.locator("main").last().innerText(); for (const g of quiz.guide) for (const p of g.paragraphs) expect(text).toContain(p[l]); for (const f of quiz.faq) expect(text).toContain(f.answer[l]);
    expect((await page.locator('script[type="application/ld+json"]').allTextContents()).join(" ")).not.toMatch(/AggregateRating|selectedThemes|selectedRoles/);
    const image = `/og/fun/career-match?locale=${l}`, r = await request.get(image); expect(r.status()).toBe(200); const bytes = await r.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    expect(await (await request.get(image + "&themes=A&roles=PRIVATE_ROLE")).body()).toEqual(bytes);
  }
  expect((await request.get(path("en") + "/results/artist")).status()).toBe(404); expect((await request.get("/og/fun/career-match?portrait=artist")).status()).toBe(404); expect((await request.get("/og/fun/career-match?locale=fr")).status()).toBe(404);
});
