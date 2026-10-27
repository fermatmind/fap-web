import { expect, test, type Page } from "@playwright/test";
import { buildMbtiPromotedBodyFixture } from "../fixtures/mbtiPromotedBodyFixture";
import canonical from "../fixtures/mbti-promoted-decision-style.json";

// Fixed synthetic reports only; never fetch a user's answers or report.
async function openSyntheticReport(page: Page, locked = false) {
  const id = `fixed-synthetic-mbti-promoted-${locked ? "locked" : "full"}`;
  const report = buildMbtiPromotedBodyFixture({ locked });
  let reportRequests = 0;
  await page.addInitScript(() => {
    localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: "2026-10-27T00:00:00Z" }));
  });
  await page.route(/\/api\/track|google-analytics|googletagmanager|hm\.baidu/, route => route.fulfill({ status: 200, body: "{}" }));
  await page.route("**/api/v0.3/**", route => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown = { ok: true };
    if (path.endsWith("/auth/guest")) body = { ok: true, fm_token: "fm_fixed_synthetic_mbti_promoted_token" };
    else if (path.endsWith("/report-access")) body = {
      ok: true, attempt_id: id, access_state: locked ? "locked" : "ready", report_state: "ready", pdf_state: "pending",
      reason_code: "projection_missing_result_ready", projection_version: 1,
      locked, variant: locked ? "free" : "full", access_level: locked ? "free" : "full",
      modules_allowed: [], modules_preview: [], payload: { scale_code: "MBTI" },
      actions: { page_href: `/en/result/${id}`, history_href: "/history/mbti" },
    };
    else if (path.endsWith("/report")) { reportRequests++; body = report; }
    else if (path.endsWith("/result")) body = { ok: true, result: { scale_code: "MBTI", scores: {}, normed_json: {} } };
    else if (path.includes("/scales/lookup")) body = { ok: true, capabilities: { enabled_in_prod: true, paywall_mode: locked ? "full" : "free_only" } };
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.goto(`/en/result/${id}`);
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible({ timeout: 30000 });
  expect(reportRequests).toBeGreaterThan(0);
}

for (const width of [390, 1440]) {
  test(`@release MBTI promoted full body and reflection remain readable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await openSyntheticReport(page);
    const section = page.getByTestId("mbti-projection-section-traits-decision-style");
    await expect(section).toBeVisible();
    await expect(section).toHaveCount(1);
    for (const paragraph of canonical.body_template) await expect(section).toContainText(paragraph);
    const questions = section.getByRole("region", { name: "Reflection questions" });
    await expect(questions).toBeVisible();
    for (const prompt of canonical.reflection_prompts) await expect(questions.getByText(prompt, { exact: true })).toBeVisible();
    await expect(section.getByText("Existing selected scenario remains available.", { exact: true })).toBeVisible();
    for (const size of ["100%", "200%"]) {
      await page.evaluate(value => { document.documentElement.style.fontSize = value; }, size);
      expect(await section.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    }
  });
}

test("@release MBTI locked report keeps the same canonical body and questions private", async ({ page }) => {
  await openSyntheticReport(page, true);
  await expect(page.getByTestId("mbti-projection-section-traits-decision-style")).toHaveCount(0);
  for (const text of [...canonical.body_template, ...canonical.reflection_prompts]) await expect(page.getByText(text, { exact: false })).toHaveCount(0);
});
