import { test, expect, type Page } from "@playwright/test";
import quiz from "../../lib/questionnaires/data/cyberpunk-edgerunners.json";

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
async function consent(page: Page, l: Locale) {
  const b = page.getByRole("button", { name: label(l, "Decline", "拒绝"), exact: true });
  if (await b.isVisible()) await b.click();
}
async function button(page: Page, l: Locale, en: string, zh: string) {
  await page.getByRole("button", { name: label(l, en, zh), exact: true }).click();
}
async function finish(page: Page, l: Locale, kind: "david" | "all-seven") {
  const sample = witnesses[kind];
  for (const [i, q] of quiz.questions.entries()) {
    const radio = page.locator(`input[name="${q.id}"][value="${sample.values[i]}"]`);
    if (!i) { await radio.focus(); await radio.press("Space"); } else await radio.check();
    await expect(radio).toBeChecked();
    await expect(page.locator("[data-archetype-count]")).toHaveCount(0);
    if (i === 1) {
      await button(page, l, "Back", "上一题");
      await expect(page.locator(`input[name="EDGE_01"][value="${sample.values[0]}"]`)).toBeChecked();
      await button(page, l, "Next", "下一题");
    }
    await button(page, l, i === 20 ? "See full result" : "Next", i === 20 ? "查看完整结果" : "下一题");
  }
  await expect(page.locator("#take-test h2")).toHaveText(quiz.resultHeading[l]);
  await expect(page.locator("#take-test h2")).toBeFocused();
  await expect(page.locator("[data-archetype-count]")).toHaveCount(7);
  for (const d of quiz.directions) await expect(page.locator(`[data-archetype-count="${d.id}"] dd`)).toHaveText(`${sample.counts[d.id]} / 12`);
  await expect(page.locator("[data-archetype-match]")).toHaveCount(sample.profiles.length);
  await expect(page.locator("[data-archetype-match] h4")).toHaveCount(sample.profiles.length * 7);
  for (const p of sample.profiles) {
    const section = page.locator(`[data-archetype-match="${p.id}"]`);
    await expect(section.locator("h3")).toHaveText(p.title[l]);
    const text = await section.innerText();
    for (const s of p.sections) for (const t of s.paragraphs) expect(text).toContain(t[l]);
  }
  expect(new URL(page.url()).search).toBe("");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const ids = await page.locator("#take-test [id]").evaluateAll(ns => ns.map(n => n.id));
  expect(ids.length).toBe(new Set(ids).size);
}

for (const l of ["en", "zh"] as const) {
  test(`@release edgerunners ${l}: native entry, keyboard, sole match, seven full tied guides and retake`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const leaked: string[] = [];
    page.on("request", r => { if (r.method() === "POST" && /EDGE_\d\d|"answers"|"counts"/.test(r.postData() ?? "")) leaked.push(r.url()); });
    await page.goto(`/${l}/tests`); await consent(page, l);
    await page.locator("#more-tests").getByRole("link", { name: quiz.title[l], exact: true }).click();
    await expect(page.locator("h1")).toHaveText(quiz.title[l]);
    await expect(page).toHaveTitle(`${quiz.seoTitle[l]} | FermatMind`);
    await button(page, l, "Start test", "开始测试");
    await button(page, l, "Next", "下一题");
    await expect(page.getByRole("status")).toContainText(label(l, "Choose an option", "请选择"));
    await finish(page, l, "david");
    await page.locator("#take-test h2").scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath(`${l}-result.png`) });
    await page.locator('[data-archetype-match="david"]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath(`${l}-full-guide.png`) });
    await button(page, l, "Retake test", "重新测试");
    await expect(page.locator("[data-archetype-match]")).toHaveCount(0);
    await finish(page, l, "all-seven");
    expect(leaked).toEqual([]);
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
    await button(page, l, "Retake test", "重新测试");
    await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0);
  });

  test(`@release edgerunners ${l}: opt-in draft, reload, language resume, changed answer and clear`, async ({ page }) => {
    await page.goto(path(l)); await consent(page, l); await button(page, l, "Start test", "开始测试");
    await page.locator('input[name="EDGE_01"][value="A"]').check();
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
    await page.getByRole("checkbox").check(); await button(page, l, "Next", "下一题"); await page.reload();
    await button(page, l, "Resume this tab's progress", "恢复本标签页进度");
    await expect(page.locator('input[name="EDGE_02"]')).toHaveCount(4);
    await button(page, l, "Back", "上一题"); await expect(page.locator('input[name="EDGE_01"][value="A"]')).toBeChecked();
    await page.locator('input[name="EDGE_01"][value="B"]').check();
    const other = l === "en" ? "zh" : "en";
    await page.goto(path(other)); await consent(page, other);
    await button(page, other, "Resume this tab's progress", "恢复本标签页进度");
    await button(page, other, "Back", "上一题");
    await expect(page.locator('input[name="EDGE_01"][value="B"]')).toBeChecked();
    await button(page, other, "Exit and clear this attempt", "退出并清除本次进度");
    expect(await page.evaluate(slug => sessionStorage.getItem(`fm_questionnaire_draft:${slug}`), quiz.slug)).toBeNull();
  });

  test(`@release edgerunners ${l}: public-only result sharing and seven full public character readings`, async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(path(l)); await consent(page, l); await button(page, l, "Start test", "开始测试");
    await finish(page, l, "david");
    await button(page, l, "Copy result and link", "复制结果与链接");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${quiz.title[l]}\n${quiz.profiles[0].title[l]}\nhttps://fermatmind.com${path(l)}/results/david`);
    for (const p of quiz.profiles) {
      await page.goto(`${path(l)}/results/${p.id}`);
      await expect(page.locator("h1")).toHaveText(p.title[l]);
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
    const sentinel = await request.get(image + "&answers=PRIVATE_ANSWER&counts=12,3&result=PRIVATE_RESULT");
    expect(sentinel.status()).toBe(200); expect(await sentinel.body()).toEqual(bytes);
  }
  expect((await request.get(`${path("en")}/results/adam-smasher`)).status()).toBe(404);
  expect((await request.get(`/og/fun/${quiz.slug}?portrait=adam-smasher`)).status()).toBe(404);
  expect((await request.get(`/og/fun/${quiz.slug}?locale=fr`)).status()).toBe(404);
});
