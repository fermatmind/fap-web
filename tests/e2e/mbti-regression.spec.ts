import { startIqEqPublicApiFixture } from "./helpers/iq-eq-public-api-fixture";
import { expect, test, type Page } from "@playwright/test";
import {
  getMbtiDesktopAnchorHash,
  getMbtiDesktopAnchorId,
} from "@/components/result/mbti/mbtiDesktopAnchorTargets";
import { clickLastOptionAndWaitForSubmitAndUrl } from "./helpers/quiz-flow";
import type { ReportResponse } from "@/lib/api/v0_3";
import { applyMbtiPhase2Fixture } from "@/tests/helpers/mbtiPhase2Fixture";
import reportReadyMbtiProjectionFixture from "../fixtures/report_ready.mbti.projection.json";
import publicEnfpZhDesktopCloneFixture from "../fixtures/mbti/desktop-clone.enfp-t.zh-CN.public.json";

function createMbtiReportFixture(
  mutate?: (fixture: Record<string, unknown>) => void
) {
  const fixture = applyMbtiPhase2Fixture(structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse) as unknown as Record<string, unknown>;
  mutate?.(fixture);
  return fixture;
}

function createMbtiReportFixtureWithOptions(
  options: Parameters<typeof applyMbtiPhase2Fixture>[1],
  mutate?: (fixture: Record<string, unknown>) => void
) {
  const fixture = applyMbtiPhase2Fixture(
    structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse,
    options
  ) as unknown as Record<string, unknown>;
  mutate?.(fixture);
  return fixture;
}

async function mockMbtiReportAccess(page: Page, attemptId: string, locale: "en" | "zh" = "en", accessState: "locked" | "ready" = "locked") {
  await page.route(`**/api/v0.3/attempts/${attemptId}/report-access*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        access_state: accessState,
        report_state: "ready",
        pdf_state: "ready",
        reason_code: "projection_missing_result_ready",
        projection_version: 1,
        actions: {
          page_href: `/${locale}/result/${attemptId}`,
          pdf_href: `/api/v0.3/attempts/${attemptId}/report.pdf`,
          history_href: "/history/mbti",
          lookup_href: "/orders/lookup",
        },
        payload: {},
        meta: {
          produced_at: "2026-03-27T00:00:00.000Z",
          refreshed_at: "2026-03-27T00:00:00.000Z",
        },
      }),
    });
  });
}

test("MBTI smoke: questions -> submit -> result remains stable", async ({ page }) => {
  const attemptId = "mbti-attempt-0001";
  const questions = Array.from({ length: 8 }, (_, idx) => ({
    question_id: String(idx + 1),
    order: idx + 1,
    text: `MBTI question ${idx + 1}`,
    options: [
      { code: "A", text: "Strongly prefer A" },
      { code: "B", text: "Prefer A" },
      { code: "C", text: "Prefer B" },
      { code: "D", text: "Strongly prefer B" },
    ],
  }));

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "fm_consent_v1",
      JSON.stringify({
        analytics: "granted",
        updatedAt: "2026-03-11T00:00:00.000Z",
      })
    );
  });

  await page.route(/\/api\/track$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/auth/guest*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_e2e_mbti_guest_token_0001",
      }),
    });
  });

  await page.route("**/api/v0.3/scales/MBTI/questions*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        scale_code: "MBTI",
        questions: {
          items: questions,
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
        scale_code: "MBTI",
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/submit", async (route) => {
    const body = route.request().postDataJSON() as {
      answers?: Array<{ question_id?: string; code?: string }>;
    };
    expect(Array.isArray(body.answers)).toBeTruthy();
    expect(body.answers?.length).toBe(8);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
      }),
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${attemptId}/report(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        createMbtiReportFixture((fixture) => {
          const report = fixture.report as Record<string, unknown>;
          const layers = report.layers as Record<string, unknown>;
          const identity = layers.identity as Record<string, unknown>;
          const cta = fixture.cta as Record<string, unknown>;
          cta.title = "Unified MBTI unlock plan";
          cta.subtitle = "Use one primary commerce surface and keep the rest as mirrors.";
          cta.primary_label = "Unlock the authored MBTI report";
          cta.benefit_bullets = ["Get the authored identity bridge", "Open the curated read list"];
          cta.badge = "Primary";
          identity.title = "Authored overview title";
          identity.subtitle = "Authored overview subtitle";
          identity.one_liner = "Authored overview one-liner";
          identity.bullets = [
            "Judgment cue: you quickly test whether a connection is worth continued effort.",
            "Social style: you energize the room first, then review the emotional detail later.",
          ];
          report.recommended_reads = [
            {
              id: "read-action",
              type: "article",
              title: "Action experiments that keep the result moving",
              desc: "Start with a small weekly experiment that turns this profile into action.",
              url: "/en/articles/read-action",
              cta: "Read the action note",
              priority: 10,
              tags: ["action", "growth"],
              estimated_minutes: 5,
              status: "published",
              published_at: "2026-03-01T00:00:00Z",
              updated_at: "2026-03-02T00:00:00Z",
              canonical_id: "read-action",
              canonical_url: "/en/articles/read-action",
            },
            {
              id: "read-career",
              type: "article",
              title: "Career environment alignment",
              desc: "Continue with the work and role-fit cues that match this profile.",
              url: "/en/articles/read-career",
              cta: "Read the career note",
              priority: 20,
              tags: ["career", "work"],
              estimated_minutes: 7,
              status: "published",
              published_at: "2026-03-03T00:00:00Z",
              updated_at: "2026-03-04T00:00:00Z",
              canonical_id: "read-career",
              canonical_url: "/en/articles/read-career",
            },
          ];
        })
      ),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/report.pdf*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/pdf",
      body: "%PDF-1.4\n% mock pdf\n",
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${attemptId}/result(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        result: {
          type_code: "ENFP-T",
          summary: "fallback result summary",
          dimensions: [],
        },
        meta: {
          scale_code: "MBTI",
        },
      }),
    });
  });

  await page.route(`**/api/v0.3/attempts/${attemptId}/submission`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
        submission: {
          id: attemptId,
          state: "ready",
        },
      }),
    });
  });

  await mockMbtiReportAccess(page, attemptId, "en");

  await page.route("**/api/v0.3/scales/lookup?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        slug: "big-five-personality-test-ocean-model",
        capabilities: {
          enabled_in_prod: true,
          paywall_mode: "full",
        },
      }),
    });
  });

  await page.goto("/en/tests/mbti-personality-test-16-personality-types/take");
  await expect(page.getByRole("heading", { name: "MBTI question 1" })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Estimated time:?\s*15 min/)).toBeVisible();
  await expect(page.getByText("No right or wrong answers. Choose the option that fits you best.")).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(4);

  for (let i = 0; i < 7; i += 1) {
    await page.getByRole("radio").first().click();
    await expect(page.getByText(`Question ${i + 2} / 8`)).toBeVisible();
  }

  const submitResponse = await clickLastOptionAndWaitForSubmitAndUrl({
    page,
    option: page.getByRole("radio").first(),
    targetUrl: new RegExp(`/result/${attemptId}(\\?.*)?$`),
    timeoutMs: 30000,
  });
  expect(submitResponse.status()).toBe(200);
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible({ timeout: 20000 });
  await expect(page.getByTestId("mbti-hero")).toContainText("ENFP-T");
  await expect(page.getByTestId("mbti-hero")).toContainText("Projection Campaigner");
  await expect(page.getByTestId("mbti-hero")).not.toContainText("Legacy Hero Title Should Lose");
  // April's unified shell deliberately excludes retired inline projection copy.
  // Identity, scoring, access, navigation and carry-over remain active contracts.
  await expect(page.getByTestId("mbti-hero")).not.toContainText("Projection-first summary");
  for (const chapter of ["traits", "career", "growth", "relationships"]) {
    await expect(page.getByTestId(`mbti-chapter-${chapter}`)).toBeVisible();
  }
  await expect(page.getByRole("button", { name: "67% Extraversion EI", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "68% Turbulent AT", exact: true })).toBeVisible();
  await expect(page.getByTestId("mbti-offers-primary-cta")).toHaveText("Unlock now ¥1.99");
  await expect(page.getByTestId("mbti-post-purchase-section")).toHaveCount(0);
  await expect(page.getByTestId("mbti-career-next-step-cta")).toHaveAttribute(
    "href", /\/en\/career\/recommendations\/mbti\/enfp-t\?.*carryover_focus_key=growth.next_actions/
  );
  await expect(page.getByTestId("mbti-offer-comparison")).toBeVisible();
  await expect(page.getByTestId("mbti-recommended-read-card-1")).toHaveAttribute("data-recommendation-key", "read-action");
  await expect(page.getByTestId("mbti-recommended-read-card-2")).toHaveAttribute("data-recommendation-key", "read-career");
  await expect(page.getByRole("link", { name: "Read the action note" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Read the career note" })).toBeVisible();
  const heroBounds = await page.getByTestId("mbti-hero").boundingBox();
  expect(heroBounds?.width ?? 0).toBeGreaterThan(700);

  const desktopStickyRail = page.getByTestId("mbti-desktop-clone-shell").getByTestId("mbti-sticky-rail");

  await desktopStickyRail.getByRole("link", { name: "2. Your Career Path" }).click();
  await expect(page).toHaveURL(new RegExp(`${getMbtiDesktopAnchorHash("career")}$`));
  await expect(page.getByTestId("mbti-chapter-career")).toBeVisible();

  await desktopStickyRail.getByRole("link", { name: "Unlock full report" }).click();
  await expect(page).toHaveURL(new RegExp(`${getMbtiDesktopAnchorHash("offerFull")}$`));
  await page.waitForFunction((offerId) => {
    const offerSection = document.getElementById(offerId);
    if (!(offerSection instanceof HTMLElement)) {
      return false;
    }

    const rect = offerSection.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const sectionCenter = rect.top + rect.height / 2;
    return Math.abs(sectionCenter - viewportCenter) < 160;
  }, getMbtiDesktopAnchorId("offerFull"));

});

test("MBTI Chinese 93Q isolated free journey submits once without checkout", async ({ page }) => {
  const attemptId = "mbti-zh-free-93-synthetic";
  let starts = 0;
  let submits = 0;
  let checkouts = 0;
  const questions = Array.from({ length: 93 }, (_, index) => ({
    question_id: `SYNTHETIC_ZH_${index + 1}`,
    order: index + 1,
    text: `隔离样本题 ${index + 1}`,
    options: [{ code: "A", text: "符合" }, { code: "B", text: "不符合" }],
  }));
  const freeReport = {
    ...createMbtiReportFixtureWithOptions({ personalizationLocale: "zh-CN", hasUnlock: true }),
    locked: false, variant: "full", access_level: "full", unlock_stage: "full", unlock_source: "none",
    access_mode: "free_full", access_source: "free_full_report_mode", free_full_report_mode: true,
    paywall_suppressed: true, upgrade_sku: null, upgrade_sku_effective: null, offers: [], modules_preview: [],
  };
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "denied", updatedAt: "2026-10-18T00:00:00Z" })));
  const fulfill = (route: Parameters<Parameters<Page["route"]>[1]>[0], body: unknown) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  await page.route("**/api/track", (route) => fulfill(route, { ok: true }));
  await page.route("**/api/v0.3/auth/guest*", (route) => fulfill(route, { ok: true, fm_token: "fm_zh_free_synthetic_token_123456" }));
  await page.route("**/api/v0.3/me/attempts/link-anon*", (route) => fulfill(route, { ok: true, linked_attempt_ids: [] }));
  await page.route("**/api/v0.3/scales/MBTI/questions*", (route) => fulfill(route, { ok: true, scale_code: "MBTI", form_code: "mbti_93", questions: { items: questions } }));
  await page.route("**/api/v0.3/attempts/start", (route) => {
    starts += 1;
    expect(route.request().postDataJSON()).toMatchObject({ scale_code: "MBTI", form_code: "mbti_93" });
    return fulfill(route, { ok: true, attempt_id: attemptId, scale_code: "MBTI", form_code: "mbti_93" });
  });
  await page.route("**/api/v0.3/attempts/submit", (route) => {
    submits += 1;
    const body = route.request().postDataJSON();
    expect(body.attempt_id).toBe(attemptId);
    expect(body.answers).toHaveLength(93);
    expect(body.answers.every((answer: { code: string }) => answer.code === "A")).toBe(true);
    return fulfill(route, { ok: true, attempt_id: attemptId });
  });
  await page.route(`**/api/v0.3/attempts/${attemptId}/report-access*`, (route) => fulfill(route, {
    ok: true, attempt_id: attemptId, access_state: "ready", report_state: "ready", pdf_state: "ready",
    unlock_stage: "full", unlock_source: "none", access_source: "free_full_report_mode", access_mode: "free_full",
    free_full_report_mode: true, paywall_suppressed: true,
    actions: { page_href: `/zh/result/${attemptId}`, history_href: "/zh/history/mbti" }, payload: freeReport,
  }));
  await page.route(`**/api/v0.3/attempts/${attemptId}/report?*`, (route) => fulfill(route, freeReport));
  await page.route(`**/api/v0.3/attempts/${attemptId}/submission*`, (route) => fulfill(route, { ok: true, submission: { id: attemptId, state: "ready" } }));
  await page.route("**/api/v0.3/orders*", (route) => { checkouts += 1; return fulfill(route, { ok: false }); });
  // Published anonymous ENFP-T content captured on 2026-10-18; no private result or answer data.
  await page.route("**/api/v0.5/personality/enfp-t/desktop-clone?*", (route) => fulfill(route, publicEnfpZhDesktopCloneFixture));
  await page.goto("/zh/tests/mbti-personality-test-16-personality-types/take?form=mbti_93");
  await expect(page.getByRole("heading", { name: "隔离样本题 1", exact: true })).toBeVisible();
  expect(starts).toBe(0);
  for (let index = 0; index < 92; index += 1) {
    await page.getByRole("radio").first().click();
    await expect(page.getByRole("heading", { name: `隔离样本题 ${index + 2}`, exact: true })).toBeVisible();
  }
  const response = await clickLastOptionAndWaitForSubmitAndUrl({ page, option: page.getByRole("radio").first(), targetUrl: new RegExp(`/zh/result/${attemptId}`) });
  expect(response.status()).toBe(200);
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible({ timeout: 20000 });
  for (const chapter of ["traits", "career", "growth", "relationships"]) await expect(page.getByTestId(`mbti-chapter-${chapter}`)).toBeVisible();
  await expect(page.getByTestId("result-email-gate")).toHaveCount(0);
  await expect(page.getByTestId("mbti-offers-primary-cta")).toHaveCount(0);
  await expect(page.getByTestId("result-email-recovery-card")).toBeVisible();
  expect(starts).toBe(1);
  expect(submits).toBe(1);
  expect(checkouts).toBe(0);
});

test("MBTI cross assessment metadata preserves canonical identity without retired copy overlays", async ({ page }) => {
  const attemptId = "mbti-cross-assessment-0001";

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "fm_consent_v1",
      JSON.stringify({
        analytics: "granted",
        updatedAt: "2026-03-20T00:00:00.000Z",
      })
    );
  });

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/auth/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_e2e_mbti_cross_assessment_guest",
      }),
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${attemptId}/report(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        createMbtiReportFixture((fixture) => {
          const report = fixture.report as Record<string, unknown>;
          const reportMeta = (report._meta ?? {}) as Record<string, unknown>;
          const reportPersonalization = (reportMeta.personalization ?? {}) as Record<string, unknown>;
          const projection = fixture.mbti_public_projection_v1 as Record<string, unknown>;
          const projectionMeta = (projection._meta ?? {}) as Record<string, unknown>;
          const projectionPersonalization = (projectionMeta.personalization ?? {}) as Record<string, unknown>;
          const crossAssessment = {
            version: "mbti_big5.cross_assessment.v1",
            supporting_scales: ["BIG5_OCEAN"],
            synthesis_keys: [
              "big5.neuroticism.high.buffer_reactivity",
              "big5.conscientiousness.low.use_external_scaffolding",
              "big5.career_next_step.low.reduce_activation_friction",
            ],
            big5_influence_keys: ["big5.band.n.high", "big5.band.c.low"],
            mbti_adjusted_focus_keys: ["growth.stability_confidence", "growth.next_actions", "career.next_step"],
            section_enhancements: {
              "growth.stability_confidence": {
                section_key: "growth.stability_confidence",
                supporting_scale: "BIG5_OCEAN",
                synthesis_key: "big5.neuroticism.high.buffer_reactivity",
                title: "Big Five 补充：高情绪性会放大情境敏感",
                body: "Big Five 显示你的情绪性更高，这会放大 MBTI 里情境敏感的体感强度。",
                influence_keys: ["big5.band.n.high"],
              },
              "growth.next_actions": {
                section_key: "growth.next_actions",
                supporting_scale: "BIG5_OCEAN",
                synthesis_key: "big5.conscientiousness.low.use_external_scaffolding",
                title: "Big Five 补充：低尽责性更需要外部支架",
                body: "把动作拆成更小的可逆步骤，再借助外部提醒和固定触发器。",
                influence_keys: ["big5.band.c.low"],
              },
              "career.next_step": {
                section_key: "career.next_step",
                supporting_scale: "BIG5_OCEAN",
                synthesis_key: "big5.career_next_step.low.reduce_activation_friction",
                title: "Big Five 补充：低尽责性更适合先降低职业动作摩擦",
                body: "先把职业动作缩成一次对话、一次投递或一次环境试探。",
                influence_keys: ["big5.band.c.low"],
              },
            },
          };
          const workingLife = {
            version: "mbti.working_life.v1",
            career_focus_key: "career.next_step",
            career_journey_keys: [
              "career.next_step",
              "career.work_experiments",
              "career.work_environment",
              "career.collaboration_fit",
            ],
            career_action_priority_keys: [
              "career.next_step",
              "career.work_experiments",
              "career_bridge",
            ],
            career_reading_keys: ["read-career", "read-action"],
            supporting_scales: ["BIG5_OCEAN"],
            big5_influence_keys: ["big5.band.n.high", "big5.band.c.low"],
            synthesis_keys: ["big5.career_next_step.low.reduce_activation_friction"],
          };

          reportPersonalization.cross_assessment_v1 = crossAssessment;
          reportPersonalization.synthesis_keys = crossAssessment.synthesis_keys;
          reportPersonalization.supporting_scales = crossAssessment.supporting_scales;
          reportPersonalization.big5_influence_keys = crossAssessment.big5_influence_keys;
          reportPersonalization.mbti_adjusted_focus_keys = crossAssessment.mbti_adjusted_focus_keys;
          reportPersonalization.working_life_v1 = workingLife;
          reportPersonalization.career_focus_key = "career.next_step";
          reportPersonalization.career_journey_keys = workingLife.career_journey_keys;
          reportPersonalization.career_action_priority_keys = workingLife.career_action_priority_keys;
          projectionPersonalization.cross_assessment_v1 = crossAssessment;
          projectionPersonalization.synthesis_keys = crossAssessment.synthesis_keys;
          projectionPersonalization.supporting_scales = crossAssessment.supporting_scales;
          projectionPersonalization.big5_influence_keys = crossAssessment.big5_influence_keys;
          projectionPersonalization.mbti_adjusted_focus_keys = crossAssessment.mbti_adjusted_focus_keys;
          projectionPersonalization.working_life_v1 = workingLife;
          projectionPersonalization.career_focus_key = "career.next_step";
          projectionPersonalization.career_journey_keys = workingLife.career_journey_keys;
          projectionPersonalization.career_action_priority_keys = workingLife.career_action_priority_keys;
        })
      ),
    });
  });

  await mockMbtiReportAccess(page, attemptId, "en");

  await page.route("**/api/v0.3/scales/lookup?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        slug: "big-five-personality-test-ocean-model",
        capabilities: {
          enabled_in_prod: true,
          paywall_mode: "full",
        },
      }),
    });
  });

  await page.goto(`/en/result/${attemptId}`);
  // The result deliberately holds the ready view for ten seconds.
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible({ timeout: 20000 });
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();

  await expect(page.getByTestId("mbti-hero")).toContainText("ENFP-T");
  await expect(page.getByTestId("mbti-chapter-growth")).toBeVisible();
  await expect(page.getByTestId("mbti-chapter-career")).toBeVisible();
  await expect(page.getByTestId("mbti-projection-section-growth-stability-confidence")).toHaveCount(0);
  await expect(page.getByTestId("mbti-projection-section-growth-next-actions")).toHaveCount(0);
  await expect(page.getByText("Big Five 显示你的情绪性更高", { exact: false })).toHaveCount(0);
  await expect(page.getByText("外部提醒", { exact: false })).toHaveCount(0);
  await expect(page.getByTestId("mbti-career-next-step-cta")).toHaveAttribute("href", /\/en\/career\/recommendations\/mbti\/enfp-t/);

});

test("MBTI controlled narrative metadata cannot replace current shell content", async ({ page }) => {
  const attemptId = "mbti-controlled-narrative-0001";

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "fm_consent_v1",
      JSON.stringify({
        analytics: "granted",
        updatedAt: "2026-03-20T00:00:00.000Z",
      })
    );
  });

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/auth/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_e2e_mbti_narrative_guest",
      }),
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${attemptId}/report(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        createMbtiReportFixtureWithOptions({
          narrativeMode: "mock",
          personalizationLocale: "en-US",
        })
      ),
    });
  });

  await mockMbtiReportAccess(page, attemptId, "en");

  await page.route("**/api/v0.3/scales/lookup?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        slug: "big-five-personality-test-ocean-model",
        capabilities: {
          enabled_in_prod: true,
          paywall_mode: "full",
        },
      }),
    });
  });

  await page.goto(`/en/result/${attemptId}`);
  // The result deliberately holds the ready view for ten seconds.
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible({ timeout: 20000 });
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();
  await expect(page.getByTestId("mbti-cultural-calibration-growth-next-actions")).toHaveCount(0);
  await expect(page.getByTestId("mbti-chapter-growth")).toBeVisible();
  await expect(page.getByTestId("mbti-hero")).not.toContainText(
    "Projection-first summary that should replace the legacy hero copy on result pages."
  );
});

test("MBTI primary CTA reuses the existing checkout and order wait flow", async ({ page }) => {
  const attemptId = "mbti-checkout-wiring-0001";
  const orderNo = "ord_mbti_wait_0001";
  const paymentRecoveryToken = "recovery_mbti_wait_0001";

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "fm_consent_v1",
      JSON.stringify({
        analytics: "granted",
        updatedAt: "2026-03-11T00:00:00.000Z",
      })
    );
  });

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/auth/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_e2e_mbti_guest_token_checkout_0001",
      }),
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${attemptId}/report(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        createMbtiReportFixture((fixture) => {
          const cta = fixture.cta as Record<string, unknown>;
          cta.primary_label = "Unlock the authored MBTI report";
        })
      ),
    });
  });

  await page.route("**/api/v0.3/orders/checkout", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        order_no: orderNo,
        attempt_id: attemptId,
        provider: "wechatpay",
        payment_recovery_token: paymentRecoveryToken,
        wait_url: `/pay/wait?order_no=${orderNo}&pay_type=qr&pay_value=${encodeURIComponent("weixin://wxpay/bizpayurl?pr=e2e_mbti_qr")}&provider=wechatpay&payment_recovery_token=${paymentRecoveryToken}`,
        pay: {
          type: "qr",
          value: "weixin://wxpay/bizpayurl?pr=e2e_mbti_qr",
          provider: "wechatpay",
        },
      }),
    });
  });

  await page.route(`**/api/v0.3/orders/${orderNo}*`, async (route) => {
    expect(route.request().url()).toContain(`payment_recovery_token=${paymentRecoveryToken}`);
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        order_no: orderNo,
        attempt_id: attemptId,
        status: "pending",
        message: "Waiting for payment confirmation.",
      }),
    });
  });

  await mockMbtiReportAccess(page, attemptId, "en");

  await page.goto(`/en/result/${attemptId}`);
  // The result deliberately holds the ready view for ten seconds.
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible({ timeout: 20000 });

  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();
  await expect(page.getByTestId("mbti-offer-comparison")).toBeVisible();
  await expect(page.getByTestId("mbti-sticky-rail").getByRole("button", { name: "Share result" })).toBeVisible();
  await expect(page.getByTestId("mbti-sticky-rail").getByRole("link", { name: "Retest" })).toBeVisible();
  await expect(page.getByTestId("mbti-desktop-clone-shell").getByTestId("mbti-sticky-rail").getByRole("link", { name: "Unlock full report" })).toHaveAttribute(
    "href",
    getMbtiDesktopAnchorHash("offerFull")
  );
  await expect(page.getByTestId("mbti-footer-cta")).toHaveCount(0);

  await page.getByTestId("mbti-offers-primary-cta").click();

  await expect(page).toHaveURL(
    new RegExp(`/en/pay/wait\\?order_no=${orderNo}&pay_type=qr&pay_value=.*provider=wechatpay&payment_recovery_token=${paymentRecoveryToken}`)
  );
  expect(page.url()).not.toContain(`/en/orders/${orderNo}`);
  await expect(page.getByText(orderNo)).toBeVisible();
  await expect(page.getByText("Waiting for payment confirmation.")).toBeVisible();
  await expect(page.getByText("Provider: wechatpay")).toBeVisible();
  await expect(page.getByRole("img", { name: "Scan this QR code in your payment app to complete checkout." })).toBeVisible();

  await page.reload();

  await expect(page).toHaveURL(
    new RegExp(`/en/pay/wait\\?order_no=${orderNo}&pay_type=qr&pay_value=.*provider=wechatpay&payment_recovery_token=${paymentRecoveryToken}`)
  );
  await expect(page.getByText(orderNo)).toBeVisible();
});

test("MBTI mobile immersive mode keeps touch targets and auto submits", async ({ page }) => {
  const attemptId = "mbti-mobile-sticky-0001";
  const options = Array.from({ length: 12 }, (_, idx) => ({
    code: `O${idx + 1}`,
    text: `Option ${idx + 1}`,
  }));

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/auth/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_e2e_mbti_guest_token_0002",
      }),
    });
  });

  await page.route("**/api/v0.3/scales/MBTI/questions*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        scale_code: "MBTI",
        questions: {
          items: [
            {
              question_id: "1",
              order: 1,
              text: "MBTI sticky question",
              options,
            },
          ],
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
        scale_code: "MBTI",
      }),
    });
  });

  await page.route("**/api/v0.3/attempts/submit", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        attempt_id: attemptId,
      }),
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${attemptId}/report(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createMbtiReportFixture()),
    });
  });

  await mockMbtiReportAccess(page, attemptId, "en");

  const viewports = [
    { width: 375, height: 812 },
    { width: 320, height: 568 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/en/tests/mbti-personality-test-16-personality-types/take");

    await expect(page.getByRole("heading", { name: "MBTI sticky question" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Estimated time:?\s*15 min/)).toBeVisible();
    await expect(page.getByText("No right or wrong answers. Choose the option that fits you best.")).toBeVisible();
    const firstOption = page.getByRole("radio").first();
    const bounds = await firstOption.boundingBox();
    expect(bounds?.height ?? 0).toBeGreaterThanOrEqual(44);

    const submitResponse = await clickLastOptionAndWaitForSubmitAndUrl({
      page,
      option: firstOption,
      targetUrl: new RegExp(`/result/${attemptId}(\\?.*)?$`),
      timeoutMs: 30000,
    });
    expect(submitResponse.status()).toBe(200);
    await expect(page.getByTestId("mbti-result-shell")).toBeVisible({ timeout: 20000 });
  }
});

test("MBTI result uses the same clone shell across mobile and desktop viewports", async ({ page }, testInfo) => {
  const attemptId = "mbti-result-shell-mobile-0001";
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "fm_consent_v1",
      JSON.stringify({
        analytics: "granted",
        updatedAt: "2026-03-11T00:00:00.000Z",
      })
    );
  });

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/auth/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_e2e_mbti_guest_token_shell_mobile_0001",
      }),
    });
  });

  await page.route(
    new RegExp(`/api/v0\\.3/attempts/${attemptId}/report-access(?:\\?.*)?$`),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          attempt_id: attemptId,
          access_state: "locked",
          report_state: "ready",
          pdf_state: "ready",
          reason_code: "projection_missing_result_ready",
          projection_version: 1,
          actions: {
            page_href: `/zh/result/${attemptId}`,
            pdf_href: `/api/v0.3/attempts/${attemptId}/report.pdf`,
            history_href: "/history/mbti",
            lookup_href: "/orders/lookup",
          },
          payload: {},
          meta: {
            produced_at: "2026-03-27T00:00:00.000Z",
            refreshed_at: "2026-03-27T00:00:00.000Z",
          },
        }),
      });
    }
  );

  await page.route(
    new RegExp(`/api/v0\\.3/attempts/${attemptId}/report(?:\\?.*)?$`),
    async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        createMbtiReportFixture((fixture) => {
          const cta = fixture.cta as Record<string, unknown>;
          const report = fixture.report as Record<string, unknown>;
          cta.primary_label = "解锁作者化完整版";
          report.recommended_reads = [
            {
              id: "read-mobile",
              type: "article",
              title: "移动端推荐阅读",
              desc: "用于验证推荐阅读 section 与底部 action bar 共存。",
              url: "https://example.com/mobile-read",
              cta: "继续阅读",
              priority: 1,
              tags: ["移动端"],
              estimated_minutes: 4,
              status: "published",
              published_at: "2026-03-01T00:00:00Z",
              updated_at: "2026-03-02T00:00:00Z",
              canonical_id: "mobile-read",
              canonical_url: "https://example.com/mobile-read",
            },
          ];
        })
      ),
    });
    }
  );

  await page.route(
    new RegExp(`/api/v0\\.3/attempts/${attemptId}/report\\.pdf(?:\\?.*)?$`),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/pdf",
        body: "%PDF-1.4\n% mock pdf\n",
      });
    }
  );

  await page.route(
    new RegExp(`/api/v0\\.3/attempts/${attemptId}/result(?:\\?.*)?$`),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          attempt_id: attemptId,
          result: {
            type_code: "ENFP-T",
            summary: "fallback result summary",
            dimensions: [],
          },
          meta: {
            scale_code: "MBTI",
          },
        }),
      });
    }
  );

  await page.route(
    new RegExp(`/api/v0\\.3/attempts/${attemptId}/submission(?:\\?.*)?$`),
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          attempt_id: attemptId,
          submission: {
            id: attemptId,
            state: "ready",
          },
        }),
      });
    }
  );

  await page.route(/\/api\/v0\.3\/scales\/lookup\?.*$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        slug: "mbti-personality-test-16-personality-types",
        capabilities: {
          enabled_in_prod: true,
          paywall_mode: "full",
        },
      }),
    });
  });

  const viewports = [
    { width: 375, height: 812 },
    { width: 1724, height: 1288 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto(`/zh/result/${attemptId}`);
  // The result deliberately holds the ready view for ten seconds.
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible({ timeout: 20000 });

    const cloneShell = page.getByTestId("mbti-desktop-clone-shell");
    const stickyRail = cloneShell.getByTestId("mbti-sticky-rail");

    await expect(page.getByTestId("mbti-result-shell")).toBeVisible();
    await expect(cloneShell).toBeVisible();
    await expect(page.getByTestId("site-header-container").getByRole("link", { name: "费马测试", exact: true })).toBeVisible();
    const layout = await page.evaluate(() => {
      const hero = document.querySelector('[data-testid="mbti-hero"]')!.getBoundingClientRect();
      const logo = document.querySelector('header a[href="/"]')!.getBoundingClientRect();
      const account = document.querySelector('header a[href="/zh/account"]')!.getBoundingClientRect();
      return { left: hero.left, right: hero.right, logoLeft: logo.left, accountRight: account.right, overflow: document.documentElement.scrollWidth - window.innerWidth };
    });
    expect(layout.overflow).toBeLessThanOrEqual(1);
    // The current clone shell is centered independently of the shared header.
    expect(Math.abs(layout.left - (viewport.width - layout.right))).toBeLessThanOrEqual(1);
    expect(layout.logoLeft).toBeGreaterThanOrEqual(0);
    if (viewport.width > 860) expect(layout.accountRight).toBeLessThanOrEqual(viewport.width);
    for (const chapter of ["career", "growth", "relationships"]) {
      await expect(page.getByTestId(`mbti-asset-slot-${chapter}`)).toBeHidden();
    }
    await expect(page.getByTestId("mbti-hero-form-summary")).toHaveCount(0);
    for (const axis of ["EI", "SN", "TF", "JP", "AT"]) {
      const button = page.getByTestId(`mbti-traits-axis-${axis}`);
      if (viewport.width > 860) await button.hover();
      else await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      const centers = await page.evaluate((code) => {
        const track = document.querySelector(`[data-testid="mbti-traits-track-${code}"]`)!.getBoundingClientRect();
        const dot = document.querySelector(`[data-testid="mbti-traits-dot-${code}"]`)!.getBoundingClientRect();
        return { track: track.y + track.height / 2, dot: dot.y + dot.height / 2 };
      }, axis);
      expect(Math.abs(centers.track - centers.dot)).toBeLessThanOrEqual(0.5);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.getByTestId("mbti-traits-dot-EI")).toHaveCSS("animation-name", "none");
    expect(parseFloat(await page.getByTestId("mbti-traits-dot-EI").evaluate((el) => getComputedStyle(el).transitionDuration))).toBeLessThanOrEqual(0.001);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const careerCta = page.getByTestId("mbti-career-next-step-cta");
    await expect(careerCta).toHaveText("继续查看 ENFP-T 的职业推荐");
    await expect(careerCta).toHaveCSS("display", "flex");
    await expect(careerCta).toHaveCSS("align-items", "center");
    await expect(careerCta).toHaveCSS("justify-content", "center");
    await expect(page.getByTestId("mbti-career-next-step").getByRole("link")).toHaveCount(1);
    await expect(page.getByTestId("mbti-traits-summary-pane").locator(":scope > div")).toHaveCSS("opacity", "1");
    await expect.poll(async () => page.getByTestId("mbti-traits-track-EI").evaluate((track) => {
      const dot = track.firstElementChild!;
      const expected = parseFloat(getComputedStyle(track).getPropertyValue("--trait-position"));
      return Math.abs(parseFloat(getComputedStyle(dot).left) / track.clientWidth * 100 - expected);
    })).toBeLessThan(0.1);
    await page.screenshot({ path: testInfo.outputPath(`layout-${viewport.width}.png`) });

    await expect(page.getByTestId("mbti-mobile-chrome")).toHaveCount(0);
    await expect(stickyRail).toBeVisible();
    await expect(page.getByTestId("mbti-chapter-traits")).toBeVisible();
    await expect(page.getByTestId("mbti-chapter-career")).toBeVisible();
    await expect(page.getByTestId("mbti-chapter-growth")).toBeVisible();
    await expect(page.getByTestId("mbti-chapter-relationships")).toBeVisible();
    await expect(page.getByTestId("mbti-offers-primary-cta")).toHaveText("1.99元直接解锁");
    await expect(page.getByTestId("mbti-recommended-reads")).toBeVisible();
    await expect(page.getByTestId("mbti-post-purchase-section")).toHaveCount(0);
    await expect(stickyRail.getByRole("button", { name: "分享结果" })).toBeVisible();
    await expect(stickyRail.getByRole("link", { name: "重测" })).toBeVisible();
    await expect(stickyRail.getByRole("link", { name: "4. 关系模式" })).toBeVisible();
    await expect(stickyRail.getByRole("link", { name: "解锁完整报告" })).toHaveAttribute(
      "href",
      "#mbti-desktop-offer-full"
    );

    await stickyRail.getByRole("link", { name: "4. 关系模式" }).click();
    await expect(page).toHaveURL(new RegExp(`#mbti-desktop-relationships$`));
    await expect(page.getByTestId("mbti-chapter-relationships")).toBeVisible();
  }
});

test("MBTI deepened user state can shift revisit focus and recommendation priority", async ({ page }) => {
  const attemptId = "mbti-attempt-8c-0001";

  await page.addInitScript(() => {
    window.localStorage.setItem(
      "fm_consent_v1",
      JSON.stringify({
        analytics: "granted",
        updatedAt: "2026-03-11T00:00:00.000Z",
      })
    );
  });

  await page.route("**/api/track", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.route("**/api/v0.3/auth/guest", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        fm_token: "fm_e2e_mbti_guest_token_8c_0001",
      }),
    });
  });

  await page.route(new RegExp(`/api/v0\\.3/attempts/${attemptId}/report(?:\\?.*)?$`), async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...createMbtiReportFixtureWithOptions({
          isRevisit: true,
          hasUnlock: true,
          hasFeedback: true,
          hasShare: false,
          hasActionEngagement: false,
          feedbackSentiment: "negative",
          feedbackCoverage: "explainability_only",
          lastDeepReadSection: "traits.close_call_axes",
          currentIntentCluster: "clarify_type",
        }),
        locked: false, variant: "full", access_level: "paid",
        modules_allowed: ["core_full", "career", "relationships"],
      }),
    });
  });

  await page.route("**/api/v0.3/scales/lookup?*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        slug: "mbti-personality-test-16-personality-types",
        capabilities: {
          enabled_in_prod: true,
          paywall_mode: "full",
        },
      }),
    });
  });

  await mockMbtiReportAccess(page, attemptId, "en", "ready");

  await page.goto(`/en/result/${attemptId}`);
  // The result deliberately holds the ready view for ten seconds.
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible({ timeout: 20000 });

  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();
  await expect(page.getByTestId("mbti-hero")).toContainText("ENFP-T");
  // Unlocked English reports include the API's explainability projection.
  const closeCallAxes = page.getByTestId("mbti-projection-section-traits-close-call-axes");
  await expect(closeCallAxes).toBeVisible();
  await expect(closeCallAxes).toHaveAttribute("data-section-key", "traits.close_call_axes");
  await expect(page.getByTestId("mbti-recommended-read-card-1")).toHaveAttribute(
    "data-recommendation-key",
    "read-explain"
  );
  await expect(page.getByTestId("mbti-post-purchase-section")).toBeVisible();
  await expect(page.getByTestId("mbti-post-purchase-history")).toHaveAttribute(
    "href", /\/en\/history\/mbti\?.*journey_state=refine_after_feedback.*pulse_state=recalibrate/
  );
  await expect(page.getByTestId("mbti-offers-primary-cta")).toHaveCount(0);

});

// Server-rendered catalog/rollout requests require a real local HTTP fixture.
let stopPublicApiFixture: (() => Promise<void>) | undefined;
test.beforeAll(async () => { stopPublicApiFixture = await startIqEqPublicApiFixture(); });
test.afterAll(async () => { await stopPublicApiFixture?.(); });
