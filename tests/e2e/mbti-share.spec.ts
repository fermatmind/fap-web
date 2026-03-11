import { expect, test } from "@playwright/test";
import reportReadyMbtiFreeFixture from "../fixtures/report_ready.mbti.free.json";

function createMbtiReportFixture() {
  return structuredClone(reportReadyMbtiFreeFixture) as Record<string, unknown>;
}

test("MBTI result share flow uses /share/{id}, renders the lightweight public summary, and tracks share click", async ({ page }) => {
  const attemptId = "mbti-share-attempt-001";
  const shareId = "share-mbti-001";
  const shareUrl = `http://127.0.0.1:3000/en/share/${shareId}`;
  const shareSummary = {
    ok: true,
    id: shareId,
    type_code: "ENFP-T",
    type_name: "Campaigner",
    subtitle: "Warm, imaginative, and emotionally alert",
    summary: "This public MBTI share page keeps only the lightweight result summary and the top-level dimension balance.",
    rarity: {
      label: "Around 6-8%",
    },
    public_tags: ["Warm", "Idealistic", "Sensitive"],
    tags: ["type:ENFP-T", "Warm"],
    dimensions: [
      { code: "EI", label: "E / I", percent: 61 },
      { code: "SN", label: "S / N", percent: 74 },
    ],
    offers: [
      {
        title: "Unlock full report",
      },
    ],
    recommended_reads: [
      {
        title: "Paid-only reading",
      },
    ],
  };
  const shareClickBodies: Array<Record<string, unknown>> = [];

  await page.addInitScript(() => {
    window.localStorage.setItem("fap_anonymous_id_v1", "anon_e2e_share_001");
    Object.defineProperty(window.navigator, "share", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as typeof window & { __copiedShareUrl?: string }).__copiedShareUrl = value;
        },
      },
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createMbtiReportFixture()),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/share`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        share_id: shareId,
        share_url: shareUrl,
      }),
    });
  });

  await page.route(`**/api/v0.3/shares/${shareId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(shareSummary),
    });
  });

  await page.route(`**/api/v0.3/shares/${shareId}/click`, async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    shareClickBodies.push(body);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto(`/en/result/${attemptId}`);
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();

  await page.getByTestId("mbti-footer-cta").getByRole("button", { name: "Share result" }).click();

  await expect
    .poll(async () => page.evaluate(() => (window as typeof window & { __copiedShareUrl?: string }).__copiedShareUrl ?? ""))
    .toBe(shareUrl);
  await expect(page.getByText("Result link copied.")).toBeVisible();

  await page.goto(`${shareUrl}?utm_source=wechat&utm_campaign=mbti`, {
    referer: `http://127.0.0.1:3000/en/result/${attemptId}`,
  });
  await expect(page.getByTestId("mbti-share-summary-card")).toBeVisible();
  await expect(page.getByRole("heading", { name: "ENFP-T" })).toBeVisible();
  await expect(page.getByText("Campaigner")).toBeVisible();
  await expect(page.getByText("Warm, imaginative, and emotionally alert")).toBeVisible();
  await expect(page.getByText("Around 6-8%")).toBeVisible();
  await expect(page.getByText("Warm", { exact: true })).toBeVisible();
  await expect(page.getByTestId("mbti-share-dimension-bars")).toBeVisible();
  await expect(page.getByText("Unlock full report")).toHaveCount(0);
  await expect(page.getByText("Paid-only reading")).toHaveCount(0);
  await expect(page.getByText("type:ENFP-T")).toHaveCount(0);

  await expect.poll(() => shareClickBodies.length).toBe(1);
  expect(shareClickBodies[0]).toMatchObject({
    anon_id: "anon_e2e_share_001",
    meta: {
      entrypoint: "share_page",
      landing_path: `/en/share/${shareId}?utm_source=wechat&utm_campaign=mbti`,
      compare_intent: false,
      utm: {
        utm_source: "wechat",
        utm_campaign: "mbti",
      },
    },
  });
  expect(String((shareClickBodies[0].meta as Record<string, unknown>).referrer ?? "")).toContain(`/en/result/${attemptId}`);
});
