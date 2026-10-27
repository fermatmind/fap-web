import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { buildEqRendererContractFixture } from "../fixtures/eq/v5/eq60RendererContractFixture";

test.use({ hasTouch: true });

// Fixed synthetic QA only. No answers, real-user reports or analytics writes.
async function resultFixture(page: Page, product: "IQ" | "EQ", locale: "zh" | "en", low = false) {
  const id = `ux05-synthetic-${product}-${locale}`;
  const report = product === "EQ" ? buildEqRendererContractFixture(locale === "zh" ? "zh-CN" : "en", low ? "low_confidence" : "standard").report : {
    schema_version: "iq.report.v1", scale_code: "IQ_INTELLIGENCE_QUOTIENT", locale: locale === "zh" ? "zh-CN" : "en",
    summary: { raw_score: 10, question_count: 30, beta_reference: { status: "available", source_kind: "designed_reference", model_version: "owner30_design_anchors_2026_10_14_v1", standard_score: 110, display_score: 110, percentile: 74.75, production_normed: false, population_percentile_eligible: false } },
    scoring: { status: "scored", bank_id: "IQ_OWNER_ORIGINAL_30" },
    dimensions: { visual_spatial_pattern_reasoning: { correct_count: 4, item_count: 14 }, visual_spatial_insight: { correct_count: 4, item_count: 13 }, numerical_pattern_reasoning: { correct_count: 2, item_count: 3 } },
  };
  await page.route(/\/api\/track|google-analytics|googletagmanager|hm\.baidu/, route => route.fulfill({ status: 200, body: '{}' }));
  await page.route("**/api/v0.3/**", route => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown = { ok: true };
    if (path.endsWith('/auth/guest')) body = { ok: true, fm_token: 'fm_ux05_synthetic_token_123456789' };
    else if (path.endsWith('/report-access')) body = { ok: true, attempt_id: id, access_state: 'ready', report_state: 'ready', pdf_state: 'pending', locked: false, variant: 'full', access_level: 'full', modules_allowed: [], modules_preview: [], actions: { page_href: `/${locale}/result/${id}` }, report };
    else if (path.endsWith('/report')) body = { ok: true, locked: false, variant: 'full', report };
    else if (path.endsWith('/result')) body = { ok: true, result: { scale_code: product === 'IQ' ? 'IQ_INTELLIGENCE_QUOTIENT' : 'EQ_60', scores: {}, normed_json: {} } };
    else if (path.includes('/scales/lookup')) body = { ok: true, capabilities: { enabled_in_prod: true, paywall_mode: 'free_only' } };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  await page.goto(`/${locale}/result/${id}`);
}

for (const locale of ["zh", "en"] as const) for (const product of ["IQ", "EQ"] as const) {
  test(`${product}/${locale}: mobile reading, keyboard reflection and enlarged text`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await resultFixture(page, product, locale);
    const practice = page.getByTestId(product === 'IQ' ? 'iq-process-practice' : 'eq-event-practice');
    await expect(practice).toBeVisible({ timeout: 30000 });
    if (product === 'EQ') {
      const depth = page.getByTestId('eq-result-depth-modules');
      const backendLocale = locale === 'zh' ? 'zh-CN' : 'en';
      await expect(depth).toContainText(`BACKEND_COPY[${backendLocale}:depth.what_this_does_not_mean]`);
      await expect(depth).toContainText(`BACKEND_COPY[${backendLocale}:depth.next_read]`);
    }
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    }
    const note = practice.getByRole('textbox').first();
    await note.focus(); await page.keyboard.type('A fixed synthetic reflection');
    await expect(note).toHaveValue('A fixed synthetic reflection');
    if (product === 'EQ') {
      const choices = practice.getByRole('radio'); await choices.first().focus();
      await page.keyboard.press('ArrowDown');
      await expect(choices.nth(1)).toBeChecked();
      await choices.nth(2).tap(); await expect(choices.nth(2)).toBeChecked();
    } else {
      const summary = practice.locator('summary'); await summary.focus(); await page.keyboard.press('Enter');
      await expect(practice.getByText(locale === 'zh' ? /下一组是4个圆/ : /next group has four circles/)).toBeVisible();
      await expect(page.getByTestId('iq-percentile')).toContainText(locale === 'zh' ? '模型参考百分位' : 'Model-reference percentile');
    }
    const panel = page.getByTestId('result-export-panel');
    await expect(panel).toBeVisible();
    await panel.locator('summary').first().click();
    const preview = panel.getByRole('textbox', { name: locale === 'zh' ? '完整导出预览' : 'Full export preview' });
    const output = await preview.inputValue();
    expect(output).toContain(product === 'IQ' ? '74.75' : 'POMP');
    expect(output).not.toContain('ux05-synthetic');
    await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('QA_DENIED'); } } }); });
    await panel.getByRole('button', { name: locale === 'zh' ? '复制提示词和所选结果' : 'Copy prompt and selected results' }).click();
    await expect(preview).toBeFocused();
    const downloadEvent = page.waitForEvent('download');
    await panel.getByRole('button', { name: 'TXT', exact: true }).tap();
    const downloaded = await downloadEvent;
    expect(await readFile((await downloaded.path())!, 'utf8')).toBe(output);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
  });
}

test('low-confidence EQ keeps personalized reflection and AI export suppressed', async ({ page }) => {
  await resultFixture(page, 'EQ', 'en', true);
  await expect(page.getByTestId('eq-quality-banner')).toBeVisible({ timeout: 30000 });
  await expect(page.getByTestId('eq-event-practice')).toHaveCount(0);
  await expect(page.getByTestId('result-export-panel')).toHaveCount(0);
});
