import { expect, test } from "@playwright/test";
import { clickLastOptionAndWaitForSubmitAndUrl } from "./helpers/quiz-flow";
import type { ReportResponse } from "@/lib/api/v0_3";
import { applyMbtiPhase2Fixture } from "@/tests/helpers/mbtiPhase2Fixture";
import reportReadyMbtiProjectionFixture from "../fixtures/report_ready.mbti.projection.json";

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

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
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
              url: "https://example.com/read-action",
              cta: "Read the action note",
              priority: 10,
              tags: ["action", "growth"],
              estimated_minutes: 5,
              status: "published",
              published_at: "2026-03-01T00:00:00Z",
              updated_at: "2026-03-02T00:00:00Z",
              canonical_id: "read-action",
              canonical_url: "https://example.com/read-action",
            },
            {
              id: "read-career",
              type: "article",
              title: "Career environment alignment",
              desc: "Continue with the work and role-fit cues that match this profile.",
              url: "https://example.com/read-career",
              cta: "Read the career note",
              priority: 20,
              tags: ["career", "work"],
              estimated_minutes: 7,
              status: "published",
              published_at: "2026-03-03T00:00:00Z",
              updated_at: "2026-03-04T00:00:00Z",
              canonical_id: "read-career",
              canonical_url: "https://example.com/read-career",
            },
          ];
        })
      ),
    });
  });

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
  await expect(page.getByText(/Estimated time:\s*15 min/)).toBeVisible();
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
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();
  await expect(page.getByTestId("mbti-hero")).toBeVisible();
  await expect(page.getByTestId("mbti-sticky-rail")).toBeVisible();
  await expect(page.getByTestId("mbti-offer-comparison")).toBeVisible();
  await expect(page.getByTestId("mbti-hero").getByRole("heading", { name: /ENFP-T/ })).toBeVisible();
  await expect(page.getByTestId("mbti-hero")).toContainText("Projection Campaigner");
  await expect(page.getByTestId("mbti-hero")).toContainText("Projection-first subtitle");
  await expect(page.getByTestId("mbti-hero")).toContainText(
    "Projection-first summary that should replace the legacy hero copy on result pages."
  );
  await expect(page.getByTestId("mbti-hero-identity-line")).toContainText("Spark Navigator");
  await expect(page.getByTestId("mbti-scene-fingerprint")).toBeVisible();
  await expect(page.getByTestId("mbti-scene-card-work")).toHaveAttribute(
    "data-style-key",
    "work.primary.EI.E.clear"
  );
  await expect(page.getByTestId("mbti-hero")).not.toContainText("Legacy Hero Title Should Lose");
  await expect(page.getByTestId("mbti-overview-authored-intro")).toContainText("Authored overview title");
  await expect(page.getByTestId("mbti-overview-authored-intro")).toContainText("Authored overview one-liner");
  await expect(page.getByTestId("mbti-projection-section-overview")).toHaveAttribute(
    "data-variant-key",
    "overview:EI.E.clear:identity.T:boundary.none"
  );
  await expect(page.getByTestId("mbti-projection-section-overview")).toContainText(
    "你已经呈现出稳定的外倾倾向"
  );
  await expect(page.getByTestId("mbti-projection-section-traits-why-this-type")).toBeVisible();
  await expect(page.getByTestId("mbti-projection-section-traits-why-this-type")).toContainText(
    "主类型之所以成立"
  );
  await expect(page.getByTestId("mbti-projection-section-traits-close-call-axes")).toContainText(
    "只拉开了7个点差"
  );
  await expect(page.getByTestId("mbti-projection-section-traits-adjacent-type-contrast")).toContainText(
    "最容易把你看成ENFJ"
  );
  await expect(page.getByTestId("mbti-projection-section-traits-decision-style")).toBeVisible();
  await expect(page.getByTestId("mbti-projection-section-traits-decision-style")).toContainText(
    "两套判断入口之间来回校准"
  );
  await expect(page.getByTestId("mbti-recommended-reads")).toBeVisible();
  await expect(page.getByTestId("mbti-offers-primary-cta")).toHaveText("Unlock full report");
  await expect(page.getByTestId("mbti-sticky-rail").getByRole("link", { name: "Unlock full report" })).toBeVisible();
  await expect(page.getByTestId("mbti-post-purchase-section")).toHaveCount(0);
  await expect(page.getByTestId("mbti-chapter-career")).toContainText(
    "你更容易先把能量投向外部互动、讨论与现场反馈"
  );
  await expect(page.getByTestId("mbti-projection-section-career-collaboration-fit")).toContainText(
    "团队协作里"
  );
  await expect(page.getByTestId("mbti-projection-section-career-work-environment")).toContainText(
    "工作环境里"
  );
  await expect(page.getByTestId("mbti-projection-section-career-work-experiments")).toContainText(
    "工作实验"
  );
  await expect(page.getByTestId("mbti-chapter-career")).toContainText("Projection career advantage one");
  await expect(page.getByTestId("mbti-projection-section-career-next-step")).toContainText(
    "先把你看重的判断标准写清楚"
  );
  await expect(page.getByTestId("mbti-action-plan-summary")).toContainText(
    "把成长、关系和工作里的高匹配动作都缩成一周内能重复的小实验"
  );
  await expect(page.getByTestId("mbti-action-plan-summary")).toHaveAttribute("data-primary-focus", "true");
  await expect(page.getByTestId("mbti-projection-section-growth-next-actions")).toHaveAttribute(
    "data-primary-focus",
    "true"
  );
  await expect(page.getByTestId("mbti-projection-section-growth-next-actions")).toHaveAttribute(
    "data-display-order",
    "1"
  );
  await expect(page.getByTestId("mbti-projection-section-growth-next-actions")).toContainText(
    "下一步动作"
  );
  await expect(page.getByTestId("mbti-projection-section-growth-weekly-experiments")).toContainText(
    "本周实验"
  );
  await expect(page.getByTestId("mbti-projection-section-growth-watchouts")).toContainText(
    "风险提醒"
  );
  await expect(page.getByTestId("mbti-chapter-growth")).toContainText("Projection motivators teaser.");
  await expect(page.getByTestId("mbti-projection-section-growth-stability-confidence")).toContainText(
    "情境敏感型稳定"
  );
  await expect(page.getByTestId("mbti-projection-section-growth-stress-recovery")).toContainText(
    "过载时和恢复时可能会切到不同挡位"
  );
  await expect(page.getByTestId("mbti-projection-section-growth-drainers")).toContainText(
    "你在过载时和恢复时可能会切到不同挡位"
  );
  await expect(page.getByTestId("mbti-chapter-relationships")).toContainText("Projection relationship risks teaser.");
  await expect(page.getByTestId("mbti-projection-section-relationships-communication-style")).toContainText(
    "你的起手表达方式"
  );
  await expect(page.getByTestId("mbti-projection-section-relationships-try-this-week")).toContainText(
    "本周关系练习"
  );
  await expect(page.getByTestId("mbti-projection-section-relationships-rel-risks")).toContainText(
    "两套判断入口之间来回校准"
  );
  await expect(page.getByTestId("mbti-career-next-step")).toContainText("先把你看重的判断标准写清楚");
  await expect(page.getByTestId("mbti-career-next-step")).toHaveAttribute("data-cta-rank", "2");
  await expect(page.getByTestId("mbti-career-next-step-cta")).toHaveAttribute(
    "href",
    /\/en\/career\/recommendations\/mbti\/enfp-t\?.*carryover_focus_key=growth.next_actions/
  );
  await expect(page.getByTestId("mbti-offer-comparison")).toHaveAttribute("data-cta-rank", "1");
  await expect(page.getByTestId("mbti-recommended-read-card-1")).toHaveAttribute(
    "data-recommendation-key",
    "read-action"
  );
  await expect(page.getByTestId("mbti-recommended-read-card-1")).toHaveAttribute(
    "data-reading-focus",
    "true"
  );
  await expect(page.getByTestId("mbti-recommended-read-card-2")).toHaveAttribute(
    "data-recommendation-key",
    "read-career"
  );
  await expect(page.getByTestId("mbti-projection-section-growth-next-actions")).toHaveAttribute(
    "data-action-rank",
    "1"
  );
  await expect(page.getByTestId("mbti-projection-section-career-work-experiments")).toHaveAttribute(
    "data-action-rank",
    "2"
  );

  const heroBounds = await page.getByTestId("mbti-hero").boundingBox();
  expect(heroBounds?.width ?? 0).toBeGreaterThan(700);
  const growthOrderIsDynamic = await page.evaluate(() => {
    const nextActions = document.querySelector('[data-testid="mbti-projection-section-growth-next-actions"]');
    const summary = document.querySelector('[data-testid="mbti-projection-section-growth-summary"]');
    if (!nextActions || !summary) {
      return false;
    }

    return Boolean(
      nextActions.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
  expect(growthOrderIsDynamic).toBe(true);
  const sectionsAreOrdered = await page.evaluate(() => {
    const relationships = document.querySelector('[data-testid="mbti-chapter-relationships"]');
    const careerNextStep = document.querySelector('[data-testid="mbti-career-next-step"]');
    const reads = document.querySelector('[data-testid="mbti-recommended-reads"]');
    const offers = document.querySelector('[data-testid="mbti-offer-comparison"]');

    if (!relationships || !careerNextStep || !reads || !offers) {
      return false;
    }

    return Boolean(
      (relationships.compareDocumentPosition(offers) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        (offers.compareDocumentPosition(careerNextStep) & Node.DOCUMENT_POSITION_FOLLOWING) &&
        (careerNextStep.compareDocumentPosition(reads) & Node.DOCUMENT_POSITION_FOLLOWING)
    );
  });
  expect(sectionsAreOrdered).toBe(true);
  await expect(page.getByRole("link", { name: "Read the action note" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Read the career note" })).toBeVisible();
  await expect(page.getByTestId("mbti-scene-feedback")).toHaveAttribute("data-feedback-state", "idle");
  await page.getByRole("button", { name: "Feels accurate" }).click();
  await expect(page.getByTestId("mbti-scene-feedback")).toHaveAttribute("data-feedback-state", "accurate");
  await page.getByTestId("mbti-projection-section-growth-next-actions").getByRole("button", { name: "This helps" }).click();

  await page.getByTestId("mbti-sticky-rail").getByRole("link", { name: "Career" }).click();
  await expect(page).toHaveURL(new RegExp(`#career$`));
  await expect(page.getByTestId("mbti-chapter-career")).toBeVisible();

  await page.getByTestId("mbti-sticky-rail").getByRole("link", { name: "Unlock full report" }).click();
  await expect(page).toHaveURL(new RegExp(`#offer-full$`));
  await page.waitForFunction(() => {
    const offerSection = document.getElementById("offers");
    if (!(offerSection instanceof HTMLElement)) {
      return false;
    }

    const rect = offerSection.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const sectionCenter = rect.top + rect.height / 2;
    return Math.abs(sectionCenter - viewportCenter) < 160;
  });

});

test("MBTI cross assessment: Big Five supplement changes stability and next-actions sections", async ({ page }) => {
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

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
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
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();

  const stability = page.getByTestId("mbti-projection-section-growth-stability-confidence");
  const nextActions = page.getByTestId("mbti-projection-section-growth-next-actions");
  const careerNextStep = page.getByTestId("mbti-projection-section-career-next-step");
  const workingLife = page.getByTestId("mbti-working-life-focus");
  await expect(stability).toHaveAttribute("data-synthesis-key", "big5.neuroticism.high.buffer_reactivity");
  await expect(stability).toContainText("Big Five 显示你的情绪性更高");
  await expect(nextActions).toHaveAttribute("data-synthesis-key", "big5.conscientiousness.low.use_external_scaffolding");
  await expect(nextActions).toContainText("外部提醒");
  await expect(careerNextStep).toHaveAttribute("data-synthesis-key", "big5.career_next_step.low.reduce_activation_friction");
  await expect(careerNextStep).toContainText("一次对话、一次投递或一次环境试探");
  await expect(workingLife).toHaveAttribute("data-career-focus-key", "career.next_step");
  await expect(workingLife).toContainText("Current working-life focus: Career next step");
});

test("MBTI controlled narrative: flag on shows narrative while canonical result stays unchanged", async ({ page }) => {
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

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(createMbtiReportFixtureWithOptions({ narrativeMode: "mock" })),
    });
  });

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
  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();
  await expect(page.getByTestId("mbti-controlled-narrative")).toHaveAttribute("data-runtime-mode", "mock");
  await expect(page.getByTestId("mbti-controlled-narrative")).toContainText(
    "Controlled narrative runtime ready for ENFP-T / identity T / focus career.next_step."
  );
  await expect(page.getByTestId("mbti-hero")).toContainText(
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

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
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

  await page.goto(`/en/result/${attemptId}`);

  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();
  await expect(page.getByTestId("mbti-offer-comparison")).toBeVisible();
  await expect(page.getByRole("button", { name: "Share result" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Retake test" })).toBeVisible();
  await expect(page.getByTestId("mbti-sticky-rail").getByRole("link", { name: "Unlock full report" })).toHaveAttribute(
    "href",
    "#offer-full"
  );
  await expect(page.getByTestId("mbti-footer-cta").getByRole("link", { name: "Unlock full report" })).toHaveAttribute(
    "href",
    "#offer-full"
  );

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

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        locked: false,
        variant: "full",
        report: {
          scale_code: "MBTI",
          sections: [
            {
              key: "summary",
              title: "Summary",
              access_level: "free",
              blocks: [{ kind: "paragraph", title: "Summary", body: "mobile summary" }],
            },
          ],
        },
      }),
    });
  });

  const viewports = [
    { width: 375, height: 812 },
    { width: 320, height: 568 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto("/en/tests/mbti-personality-test-16-personality-types/take");

    await expect(page.getByRole("heading", { name: "MBTI sticky question" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Estimated time:\s*15 min/)).toBeVisible();
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
  }
});

test("MBTI result shell v2 exposes mobile chapter pills and bottom action bar", async ({ page }) => {
  const attemptId = "mbti-result-shell-mobile-0001";

  await page.setViewportSize({ width: 375, height: 812 });
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

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
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

  await page.goto(`/zh/result/${attemptId}`);

  const mobileChrome = page.getByTestId("mbti-mobile-chrome");

  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();
  await expect(mobileChrome).toBeVisible();
  await expect(mobileChrome.getByRole("button", { name: "分享" })).toBeVisible();
  await expect(mobileChrome.getByRole("link", { name: "重测" })).toBeVisible();
  await expect(mobileChrome.getByRole("link", { name: "解锁完整报告" })).toBeVisible();
  await expect(mobileChrome.getByRole("link", { name: "职业" })).toBeVisible();
  await expect(page.getByTestId("mbti-offers-primary-cta")).toHaveText("解锁完整报告");
  await expect(page.getByTestId("mbti-recommended-reads")).toBeVisible();
  await expect(page.getByTestId("mbti-post-purchase-section")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "分享结果" })).toBeVisible();
  await expect(page.getByRole("link", { name: "重新测试" })).toBeVisible();

  await mobileChrome.getByRole("link", { name: "关系" }).click();
  await expect(page).toHaveURL(new RegExp(`#relationships$`));
  await expect(page.getByTestId("mbti-chapter-relationships")).toBeVisible();
  await mobileChrome.getByRole("link", { name: "解锁完整报告" }).click();
  await expect(page).toHaveURL(new RegExp(`#offer-full$`));
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

  await page.route(`**/api/v0.3/attempts/${attemptId}/report*`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        createMbtiReportFixtureWithOptions({
          isRevisit: true,
          hasUnlock: true,
          hasFeedback: true,
          hasShare: false,
          hasActionEngagement: false,
          feedbackSentiment: "negative",
          feedbackCoverage: "explainability_only",
          lastDeepReadSection: "traits.close_call_axes",
          currentIntentCluster: "clarify_type",
        })
      ),
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

  await page.goto(`/en/result/${attemptId}`);

  await expect(page.getByTestId("mbti-result-shell")).toBeVisible();
  await expect(page.getByTestId("mbti-projection-section-traits-close-call-axes")).toHaveAttribute(
    "data-primary-focus",
    "true"
  );
  await expect(page.getByTestId("mbti-projection-section-traits-close-call-axes")).toHaveAttribute(
    "data-display-order",
    "1"
  );
  await expect(page.getByTestId("mbti-recommended-read-card-1")).toHaveAttribute(
    "data-recommendation-key",
    "read-explain"
  );
  await expect(page.getByTestId("mbti-post-purchase-section")).toHaveAttribute("data-cta-rank", "1");
  await expect(page.getByTestId("mbti-career-next-step")).toHaveAttribute("data-cta-rank", "2");
});
