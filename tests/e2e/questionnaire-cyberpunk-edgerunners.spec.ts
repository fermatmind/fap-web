import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/cyberpunk-edgerunners.json";
import readings from "../../lib/questionnaires/result-content/cyberpunk-edgerunners.json";

type Locale = "en" | "zh";
const path = (l: Locale) => `/${l}/tests/explore/${quiz.slug}`;
const label = (l: Locale, en: string, zh: string) => l === "zh" ? zh : en;
const witnesses = Object.fromEntries(["david", "all-seven"].map(kind => {
  const values = quiz.questions.map(q => (kind === "david" ? q.options.find(o => o.directionId === "david") ?? q.options[0] : q.options[0]).id);
  const counts = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  for (const [i, q] of quiz.questions.entries()) counts[q.options.find(o => o.id === values[i])!.directionId]++;
  const highest = Math.max(...Object.values(counts));
  return [kind, { values, counts, profiles: quiz.profiles.filter(p => counts[p.id] === highest) }];
}));
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({
    analytics: "denied", updatedAt: new Date().toISOString(),
  })));
});
async function button(page: Page, l: Locale, en: string, zh: string) {
  await page.getByRole("button", { name: label(l, en, zh), exact: true }).click();
}
async function finish(page: Page, l: Locale, kind: "david" | "all-seven") {
  const sample = witnesses[kind];
  for (const [i, q] of quiz.questions.entries()) {
    const radio = page.locator(`input[name="${q.id}"][value="${sample.values[i]}"]`);
    if (i === 1) {
      await expect(radio).toBeVisible();
      await button(page, l, "Back", "上一题");
      await expect(page.locator(`input[name="EDGE_01"][value="${sample.values[0]}"]`)).toBeChecked();
      await button(page, l, "Next", "下一题");
    }
    if (!i) {
      await radio.focus();
      await radio.press("Space");
    } else {
      await radio.check();
    }
  }
  await expect(page.locator("#take-test h2")).toHaveText(quiz.resultHeading[l]);
  await expect(page.locator("#take-test h2")).toBeFocused();
  await expect(page.locator("#take-test [data-archetype-count]")).toHaveCount(7);
  for (const d of quiz.directions) await expect(page.locator(`#take-test [data-archetype-count="${d.id}"] dd:not([aria-hidden])`)).toHaveText(`${sample.counts[d.id]} / 12`);
  await expect(page.locator("[data-archetype-match]")).toHaveCount(sample.profiles.length);
  const overview = page.locator("#take-test [data-choice-chart-placement]");
  await expect(overview).toHaveAttribute("data-choice-chart-placement", kind === "david" ? "between" : "before");
  await expect(page.locator("#choice-counts [data-choice-radar-shape]")).toBeVisible();
  await expect(page.locator("[data-archetype-match] h4")).toHaveCount(sample.profiles.reduce(
    (total, profile) => total + profile.sections.length + readings[profile.id as keyof typeof readings].length, 0,
  ));
  for (const p of sample.profiles) {
    const section = page.locator(`[data-archetype-match="${p.id}"]`);
    await expect(section.locator(`#animal-title-${p.id}`)).toHaveText(p.title[l]);
    await expect(section.locator(`img[src="/images/quiz-portraits/${quiz.slug}/${p.id}.webp"]`)).toBeVisible();
    const text = await section.textContent();
    for (const s of p.sections) for (const t of s.paragraphs) expect(text).toContain(t[l]);
  }
  expect(new URL(page.url()).search).toBe("");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const ids = await page.locator("#take-test [id], #edgerunners-examples [id]").evaluateAll(ns => ns.map(n => n.id));
  expect(ids.length).toBe(new Set(ids).size);
}

for (const l of ["en", "zh"] as const) {
  for (const [device, viewport] of [["phone", { width: 390, height: 844 }], ["desktop", { width: 1440, height: 900 }]] as const) {
  test(`@release edgerunners ${l} ${device}: samples, back, sole match, seven tied guides, share and retake`, async ({ page, context }) => {
    await page.setViewportSize(viewport);
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const leaked: string[] = [];
    const tracked: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && new URL(r.url()).pathname === "/api/track") tracked.push(r.url()); });
    page.on("request", r => { if (r.method() === "POST" && /EDGE_\d\d|"answers"|"counts"/.test(r.postData() ?? "")) leaked.push(r.url()); });
    await page.goto(`/${l}/tests`);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click();
    await expect(page.locator("h1")).toHaveText(quiz.title[l]);
    await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`);
    const exampleLink = page.getByRole("link", { name: label(l, "See sample results", "先看结果示例") });
    await expect(exampleLink).toBeInViewport();
    await page.getByRole("link", { name: label(l, "See the seven possible character results", "先看七种角色结果") }).click();
    await expect(page).toHaveURL(/#questionnaire-results$/);
    await expect(page.locator("#questionnaire-results")).toBeInViewport();
    await exampleLink.click();
    const samples = page.locator("#edgerunners-examples");
    await expect(samples.getByRole("heading", { level: 3 })).toHaveText(l === "zh" ? ["单一匹配", "最高并列"] : ["One match", "Tie for first"]);
    await expect(samples.getByRole("link")).toHaveCount(3);
    await expect(samples.getByRole("link").last()).toHaveAttribute("href", `${path(l)}/results/lucy`);
    await samples.locator("summary").last().click();
    await expect(samples.locator('#edgerunners-sample-tie-counts [data-matched="true"] dd:not([aria-hidden])')).toHaveText(["5 / 12", "5 / 12"]);
    await samples.getByRole("link").last().click();
    await expect(page.locator("h1")).toHaveText(quiz.profiles[1].title[l]);
    await expect(page.locator('img[src$="/cyberpunk-edgerunners/lucy.webp"]')).toBeVisible();
    await page.getByRole("navigation", { name: label(l, "Breadcrumb", "面包屑") }).getByRole("link", { name: quiz.title[l], exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path(l)}$`));
    await button(page, l, "Start test", "开始测试");
    await button(page, l, "Next", "下一题");
    await expect(page.getByRole("status")).toContainText(label(l, "Choose an option", "请选择"));
    await finish(page, l, "david");
    await button(page, l, "Copy result and link", "复制结果与链接");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${quiz.title[l]}
${quiz.profiles[0].title[l]}
https://fermatmind.com${path(l)}/results/david`);
    await page.locator("#take-test h2").scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath(`${l}-result.png`) });
    await page.locator('[data-archetype-match="david"]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath(`${l}-full-guide.png`) });
    await button(page, l, "Retake test", "重新测试");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(0);
    await finish(page, l, "all-seven");
    await button(page, l, "Copy result and link", "复制结果与链接");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${quiz.title[l]}
${quiz.profiles.map(p => p.title[l]).join(l === "zh" ? "、" : ", ")}
https://fermatmind.com${path(l)}`);
    expect(leaked).toEqual([]);
    expect(tracked).toEqual([]);
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
    await button(page, l, "Retake test", "重新测试");
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });
  }

  test(`@release edgerunners ${l}: reload and language change start a new private attempt`, async ({ page }) => {
    await page.goto(path(l)); await button(page, l, "Start test", "开始测试");
    await page.locator('input[name="EDGE_01"][value="A"]').check();
    await expect(page.locator('input[name="EDGE_02"]')).toHaveCount(4);
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
    await page.reload();
    await expect(page.locator('input[name="EDGE_01"]:checked')).toHaveCount(0);
    await expect(page.locator('input[name="EDGE_01"]')).toHaveCount(4);
    const other = l === "en" ? "zh" : "en";
    await page.goto(path(other)); await button(page, other, "Start test", "开始测试");
    await expect(page.locator('input[name="EDGE_01"]')).toHaveCount(4);
    await expect(page.locator('input[name="EDGE_01"]:checked')).toHaveCount(0);
  });

  test(`@release edgerunners ${l}: public-only result sharing and seven full public character readings`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(path(l)); await button(page, l, "Start test", "开始测试");
    await finish(page, l, "david");
    await button(page, l, "Copy result and link", "复制结果与链接");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${quiz.title[l]}\n${quiz.profiles[0].title[l]}\nhttps://fermatmind.com${path(l)}/results/david`);
    for (const p of quiz.profiles) {
      await page.goto(`${path(l)}/results/${p.id}`);
      await expect(page.locator("h1")).toHaveText(p.title[l]);
      const portrait = page.locator(`img[src="/images/quiz-portraits/${quiz.slug}/${p.id}.webp"]`);
      await expect(portrait).toBeVisible();
      await expect.poll(() => portrait.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBe(640);
      await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
      const text = await page.locator("main").last().innerText();
      for (const s of p.sections) for (const t of s.paragraphs) expect(text).toContain(t[l]);
    }
  });
}

test("@release edgerunners all16publicpages, complete body, metadata,16fontOGs and unavailable cast identity", async ({ page, request }) => {
  for (const l of ["en", "zh"] as const) for (const p of [null, ...quiz.profiles]) {
    const url = p ? `${path(l)}/results/${p.id}` : path(l);
    await page.goto(url);
    await expect(page.locator("h1")).toHaveText(p ? p.title[l] : quiz.title[l]);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://fermatmind.com${url}`);
    for (const [lang, other] of [["en", "en"], ["zh-CN", "zh"], ["x-default", "en"]] as const) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", `https://fermatmind.com${p ? `${path(other)}/results/${p.id}` : path(other)}`);
    }
    const body = await page.locator("main").last().textContent();
    for (const s of p ? p.sections : quiz.guide) for (const t of s.paragraphs) expect(body).toContain(t[l]);
    if (!p) for (const f of quiz.faq) expect(body).toContain(f.answer[l]);
    if (!p) for (const reference of quiz.references) await expect(page.getByRole("link", { name: reference.title[l], exact: true })).toHaveAttribute("href", reference.url);
    if (l === "en") expect(body).not.toMatch(/\p{Script=Han}/u);
    const schema = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(schema.length).toBeGreaterThan(0);
    expect(schema.join(" ")).not.toMatch(/EDGE_01|"answers"|"counts"|AggregateRating/);
    const image = `/og/fun/${quiz.slug}?locale=${l}${p ? `&portrait=${p.id}` : ""}`;
    const r = await request.get(image); expect(r.status()).toBe(200);
    const bytes = await r.body(); expect(bytes.readUInt32BE(16)).toBe(1200); expect(bytes.readUInt32BE(20)).toBe(630);
    if (p) expect(bytes.length).toBeGreaterThan(70_000); // A text-only card can still be a valid 1200 × 630 PNG.
    const sentinel = await request.get(image + "&answers=PRIVATE_ANSWER&counts=12,3&result=PRIVATE_RESULT");
    expect(sentinel.status()).toBe(200); expect(await sentinel.body()).toEqual(bytes);
  }
  expect((await request.get(`${path("en")}/results/adam-smasher`)).status()).toBe(404);
  expect((await request.get(`/og/fun/${quiz.slug}?portrait=adam-smasher`)).status()).toBe(404);
  expect((await request.get(`/og/fun/${quiz.slug}?locale=fr`)).status()).toBe(404);
});
