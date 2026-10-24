import { expect, test } from "@playwright/test";
import englishEngine from "../fixtures/big5/canonical-engine-en-120.json";
import { canonicalPrivateReport } from "../fixtures/big5/canonicalPrivateResult";
import { createSevenChapterReport } from "../contracts/helpers/enneagramSevenChapterFixture";

for (const locale of ["zh", "en"] as const) {
  for (const form of ["big5_90", "big5_120", "enneagram_likert_105", "enneagram_forced_choice_144"] as const) {
    test(`UX03 ${form}/${locale}: mobile reading and action`, async ({ page }) => {
      const big5 = form.startsWith("big5");
      const attemptId = "11111111-1111-4111-8111-111111111111";
      const scaleCode = big5 ? "BIG5_OCEAN" : "ENNEAGRAM";
      const report = big5 ? canonicalPrivateReport() : createSevenChapterReport({ locale: locale === "zh" ? "zh-CN" : "en", formCode: form as "enneagram_likert_105" | "enneagram_forced_choice_144", scope: "close_call" });
      if (big5 && locale === "en") Object.assign(report, { big5_report_engine_v2: structuredClone(englishEngine), big5_private_result_authority: englishEngine._meta.big5_private_result_authority });
      if (big5) {
        report.big5_report_engine_v2!.form_code = form;
        report.big5_form_v1 = { scale_code: scaleCode, form_code: form, question_count: form === "big5_90" ? 90 : 120, label: form, short_label: form };
      }
      Object.assign(report, { ok: true, attempt_id: attemptId, locked: false, variant: "full", access_level: "full", modules_allowed: [big5 ? "big5_full" : "enneagram_full"], report: { ...report.report, scale_code: scaleCode } });
      await page.setViewportSize({ width: locale === "zh" ? 360 : 390, height: 844 });
      await page.addInitScript(() => { localStorage.setItem("fap_anonymous_id_v1", "codex_probe_ux03_fixture"); });
      await page.route("**/api/track", (route) => route.fulfill({ json: { ok: true } }));
      await page.route("**/api/v0.3/**", async (route) => {
        const pathname = new URL(route.request().url()).pathname;
        if (pathname.endsWith("/report-access")) return route.fulfill({ json: { ok: true, attempt_id: attemptId, access_state: "ready", report_state: "ready", pdf_state: "pending", variant: "full", access_level: "full", modules_allowed: [big5 ? "big5_full" : "enneagram_full"], actions: { page_href: `/${locale}/result/${attemptId}` }, payload: { scale_code: scaleCode } } });
        if (pathname.endsWith("/report")) return route.fulfill({ json: report });
        if (pathname.endsWith("/auth/guest")) return route.fulfill({ json: { ok: true, anon_id: "codex_probe_ux03_fixture", fm_token: "fixture-only" } });
        return route.fulfill({ status: 404, json: { ok: false, error_code: "FIXTURE_UNAVAILABLE" } });
      });
      await page.goto(`/${locale}/result/${attemptId}`);
      if (big5) {
        const guide = page.getByTestId("big5-reading-guide");
        await expect(guide).toBeVisible({ timeout: 30000 });
        const expand = guide.getByRole("button", { name: locale === "zh" ? "展开全部面向" : "Expand all facets" });
        await expand.focus();
        await page.keyboard.press("Enter");
        await expect(guide.locator("dt").filter({ hasText: /[OCEAN][1-6] / })).toHaveCount(30);
        await guide.getByRole("combobox").selectOption("work");
        await guide.getByRole("textbox").first().fill("Try five minutes tomorrow; observe cost.");
        await guide.getByRole("button", { name: locale === "zh" ? "选择这项行动" : "Choose this action" }).click();
        await expect(guide.getByRole("status")).toBeVisible();
      } else {
        const chart = page.getByRole("table", { name: locale === "zh" ? "九型分布数值" : "Nine-type distribution values" });
        await expect(chart).toBeVisible({ timeout: 30000 });
        await expect(chart.locator("tbody tr")).toHaveCount(9);
        const candidates = page.getByRole("group", { name: locale === "zh" ? "切换当前阅读候选" : "Switch reading candidate" });
        await candidates.getByRole("button").nth(1).click();
        await expect(candidates.getByRole("button").nth(1)).toHaveAttribute("aria-pressed", "true");
        await page.getByRole("textbox").first().fill("I wanted clarity; a counterexample was waiting calmly.");
        await page.locator('a[href="#chapter-7"]').click();
        const action = page.locator("#chapter-7 button[aria-pressed]").first();
        await action.click();
        await expect(action).toHaveAttribute("aria-pressed", "true");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.evaluate(() => { document.documentElement.style.fontSize = "24px"; });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    });
  }
}
