import { expect, test } from "@playwright/test";

function buildCc68Questions() {
  return Array.from({ length: 68 }, (_, idx) => {
    const index = idx + 1;
    const moduleCode = index <= 17 ? "M1" : index <= 34 ? "M2" : index <= 51 ? "M3" : "M4";

    return {
      question_id: String(index),
      order: index,
      module_code: moduleCode,
      options_set_code: "L5_FREQ",
      is_reverse: false,
      text: `CC68 question ${index}`,
      options: [
        { code: "A", text: "Never", score: 0 },
        { code: "B", text: "Rarely", score: 1 },
        { code: "C", text: "Sometimes", score: 2 },
        { code: "D", text: "Often", score: 3 },
        { code: "E", text: "Almost always", score: 4 },
      ],
    };
  });
}

test("CC68 flow: module transition, crisis ordering, paid sections hidden", async ({ page }) => {
  const attemptId = "cc68-attempt-0001";
  const questions = buildCc68Questions();

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/scales/CLINICAL_COMBO_68/questions*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        scale_code: "CLINICAL_COMBO_68",
        locale: "en",
        questions: {
          items: questions,
        },
        meta: {
          consent: {
            required: true,
            version: "CC68_CONSENT_v1",
            text: "Please accept consent.",
          },
          modules: {
            M1: { title: "Module 1", guidance: "Guidance M1" },
            M2: { title: "Module 2", guidance: "Guidance M2" },
            M3: { title: "Module 3", guidance: "Guidance M3" },
            M4: { title: "Module 4", guidance: "Guidance M4" },
          },
        },
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/start", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        scale_code: "CLINICAL_COMBO_68",
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/submit", async (route) => {
    const body = route.request().postDataJSON() as {
      answers?: Array<{ question_id?: string; code?: string }>;
    };
    expect(Array.isArray(body.answers)).toBeTruthy();
    expect(body.answers?.length).toBe(68);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        locked: true,
        variant: "free",
        quality: {
          level: "D",
          crisis_alert: true,
        },
        offers: [
          {
            sku: "CC68_FULL",
            title: "CC68 Full",
            price_cents: 1299,
            currency: "USD",
            modules_included: ["paid_deep_dive", "action_plan"],
          },
        ],
        report: {
          scale_code: "CLINICAL_COMBO_68",
          sections: [
            {
              key: "disclaimer_top",
              title: "Important Disclaimer",
              access_level: "free",
              blocks: [{ id: "d1", type: "markdown", content: "Disclaimer" }],
            },
            {
              key: "quick_overview",
              title: "Quick Overview",
              access_level: "free",
              blocks: [{ id: "q1", type: "markdown", content: "Overview" }],
            },
            {
              key: "crisis_banner",
              title: "Crisis Support",
              access_level: "free",
              blocks: [{ id: "c1", type: "markdown", content: "Seek support now." }],
              resources: [{ title: "988 Hotline", phone: "988" }],
              reasons: ["critical threshold"],
            },
            {
              key: "action_plan",
              title: "Action Plan",
              access_level: "paid",
              blocks: [{ id: "a1", type: "markdown", content: "Action content" }],
            },
            {
              key: "paid_deep_dive",
              title: "Paid Deep Dive",
              access_level: "paid",
              blocks: [{ id: "p1", type: "markdown", content: "Paid content" }],
            },
          ],
        },
      }),
    });
  });

  await page.goto("/en/tests/clinical-combo-68/take");

  await page.getByLabel("I have read and agree to the statement above").check();
  await page.getByRole("button", { name: "Agree and start" }).click();

  for (let index = 0; index < 68; index += 1) {
    await expect(page.getByText(`Question ${index + 1} / 68`)).toBeVisible();
    await page.getByRole("radio").first().click();

    if (index < 67) {
      await page.getByRole("button", { name: "Next", exact: true }).click();

      const continueButton = page.getByRole("button", { name: "Continue" });
      const hasContinue = await continueButton.isVisible().catch(() => false);
      if (hasContinue) {
        if (index === 16) {
          await expect(page.getByText("M2", { exact: true })).toBeVisible();
          await expect(page.getByText("Guidance M2")).toBeVisible();
        }
        await continueButton.click();
      }
    }
  }

  await page.getByRole("button", { name: "Submit" }).click();

  await expect(page).toHaveURL(new RegExp(`/en/attempts/${attemptId}/report`));
  await expect(page.getByText("988 Hotline: 988")).toBeVisible();
  await expect(page.getByRole("button", { name: "Unlock now" })).toHaveCount(0);

  const sectionKeys = await page
    .locator("[data-section-key]")
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-section-key") || ""));

  expect(sectionKeys[0]).toBe("disclaimer_top");
  expect(sectionKeys[1]).toBe("crisis_banner");
  expect(sectionKeys).not.toContain("action_plan");
  expect(sectionKeys).not.toContain("paid_deep_dive");
});

test("CC68 report unlock is only reflected after locked=false", async ({ page }) => {
  const attemptId = "cc68-attempt-unlock";
  const pendingUnlockStorageKey = `fm_clinical_pending_unlock_v1_${attemptId}`;
  let reportCalls = 0;

  await page.addInitScript((storageKey) => {
    window.localStorage.setItem(storageKey, "ord_cc68_unlock_1");
  }, pendingUnlockStorageKey);

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    reportCalls += 1;
    const unlocked = reportCalls >= 3;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        locked: !unlocked,
        variant: unlocked ? "full" : "free",
        quality: {
          level: "B",
          crisis_alert: false,
        },
        offers: [
          {
            sku: "CC68_FULL",
            title: "CC68 Full",
            price_cents: 1299,
            currency: "USD",
          },
        ],
        report: {
          scale_code: "CLINICAL_COMBO_68",
          sections: [
            {
              key: "disclaimer_top",
              title: "Important Disclaimer",
              access_level: "free",
              blocks: [{ id: "d1", type: "markdown", content: "Disclaimer" }],
            },
            {
              key: "paid_deep_dive",
              title: "Paid Deep Dive",
              access_level: "paid",
              blocks: [{ id: "p1", type: "markdown", content: "Deep paid content" }],
            },
          ],
        },
      }),
    });
  });

  await page.goto(`/en/attempts/${attemptId}/report`);

  await expect(page.getByRole("button", { name: "Unlock now" })).toBeVisible();
  await expect(page.getByText("Unlock to view this section.")).toBeVisible();

  await expect(page.getByRole("button", { name: "Unlock now" })).toHaveCount(0, {
    timeout: 20000,
  });
  await expect(page.getByText("Unlock to view this section.")).toHaveCount(0);
  await expect(page.getByText("Deep paid content")).toBeVisible();
  expect(reportCalls).toBeGreaterThanOrEqual(3);
});
