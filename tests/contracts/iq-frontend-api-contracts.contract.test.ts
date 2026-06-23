import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getIqAttemptQuestion,
  getIqQuestions,
  getIqQuestionsByScaleCode,
  getIqReport,
  getIqReportAccess,
  lookupIqScale,
  normalizeIqSubmitAnswers,
  startIqAttempt,
  submitIqAttempt,
  IQ_CANONICAL_SCALE_CODE,
  IQ_LEGACY_SCALE_CODE,
  IQ_PUBLIC_SLUG,
} from "@/lib/iq/api";
import {
  IQ_CANONICAL_PUBLIC_PATH,
  IQ_DIMENSION_NAME_MAP,
  IQ_OWNER_ORIGINAL_30_BANK_ID,
  IQ_REPORT_DIMENSION_FIELD_MAP,
  IQ_ZH_TAKE_PATH,
} from "@/lib/iq/constants";
import {
  iqQuestionPayloadSchema,
  iqAttemptQuestionDeliverySchema,
  iqReportAccessPayloadSchema,
  iqReportPayloadSchema,
  iqResultPayloadSchema,
} from "@/lib/iq/contracts";

const hoisted = vi.hoisted(() => ({
  fetchAttemptReport: vi.fn(),
  fetchAttemptReportAccess: vi.fn(),
  fetchAttemptQuestions: vi.fn(),
  fetchAttemptResult: vi.fn(),
  fetchScaleQuestions: vi.fn(),
  getScaleLookup: vi.fn(),
  startAttempt: vi.fn(),
  submitAttempt: vi.fn(),
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_iq_contract",
}));

vi.mock("@/lib/auth/authRetry", () => ({
  runWithGuestTokenRetry: async ({ runner }: { runner: () => Promise<unknown> }) => runner(),
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    fetchAttemptReport: hoisted.fetchAttemptReport,
    fetchAttemptReportAccess: hoisted.fetchAttemptReportAccess,
    fetchAttemptQuestions: hoisted.fetchAttemptQuestions,
    fetchAttemptResult: hoisted.fetchAttemptResult,
    fetchScaleQuestions: hoisted.fetchScaleQuestions,
    getScaleLookup: hoisted.getScaleLookup,
    startAttempt: hoisted.startAttempt,
    submitAttempt: hoisted.submitAttempt,
  };
});

describe("IQ frontend API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    hoisted.getScaleLookup.mockResolvedValue({
      ok: true,
      slug: IQ_PUBLIC_SLUG,
      scale_code: IQ_CANONICAL_SCALE_CODE,
    });

    hoisted.fetchScaleQuestions.mockResolvedValue({
      ok: true,
      scale_code: IQ_CANONICAL_SCALE_CODE,
      bank_id: "IQ_SHOWCASE_12_BETA",
      scoring_mode: "scored",
      questions: {
        items: [
          {
            question_id: "iq_q_01",
            item_id: "FM-IQ-VSPR-MX-L3-0001",
            order: 1,
            dimension: "VSPR",
            item_family: "matrix_reasoning",
            difficulty_level: "L3",
            stem: {
              prompt: "Pick the missing tile.",
              svg: {
                viewBox: "0 0 100 100",
                paths: [{ d: "M0 0h10v10z", fill: "#111" }],
              },
            },
            options: [
              {
                option_code: "A",
                label: "A",
                svg: {
                  view_box: "0 0 50 50",
                  paths: [{ d: "M0 0h5v5z", stroke_width: 2 }],
                },
              },
            ],
          },
        ],
      },
    });

    hoisted.fetchAttemptQuestions.mockResolvedValue({
      ok: true,
      schema_version: "fm.iq.question_delivery.v1",
      attempt_id: "attempt_iq_1",
      scale_code: IQ_CANONICAL_SCALE_CODE,
      scale_code_legacy: IQ_LEGACY_SCALE_CODE,
      bank_id: IQ_OWNER_ORIGINAL_30_BANK_ID,
      form_code: IQ_OWNER_ORIGINAL_30_BANK_ID,
      question_count: 30,
      delivery: {
        mode: "current_question",
        index: 0,
        window_size: 1,
        has_previous: false,
        has_next: true,
      },
      questions: {
        schema_version: "fm.iq.owner_image_bank.items.public.v1",
        items: [
          {
            question_id: "owner_q_01",
            item_id: "owner_item_01",
            order: 1,
            title: "Owner original item 1",
            stem: {
              type: "image",
              media_type: "image/webp",
              assets: {
                image: "/media/iq-owner/q1/stem.webp",
              },
              width: 840,
              height: 552,
              accessibility_label: "Owner original stem 1.",
            },
            options: [
              {
                code: "A",
                label: "A",
                type: "image",
                media_type: "image/webp",
                assets: {
                  image: "/media/iq-owner/q1/a.webp",
                },
                width: 296,
                height: 168,
              },
            ],
          },
        ],
      },
      meta: {
        source: "attempt_bound_owner_bank",
        public_payload: true,
      },
    });

    hoisted.startAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt_iq_1",
      scale_code: IQ_CANONICAL_SCALE_CODE,
      question_count: 12,
    });

    hoisted.submitAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt_iq_1",
      submission_state: "submitted",
    });

    hoisted.fetchAttemptResult.mockResolvedValue({
      ok: true,
      attempt_id: "attempt_iq_1",
      scale_code: IQ_CANONICAL_SCALE_CODE,
      iq_estimate: null,
      percentile: null,
      dimensions: {
        visual_spatial_insight: { score: 8 },
        visual_spatial_pattern_reasoning: { score: 9 },
        numerical_pattern_reasoning: { score: 7 },
      },
    });

    hoisted.fetchAttemptReportAccess.mockResolvedValue({
      ok: true,
      attempt_id: "attempt_iq_1",
      locked: true,
      access_state: "locked",
      report_state: "locked",
      pdf_state: "locked",
      unlock_stage: "locked",
    });

    hoisted.fetchAttemptReport.mockResolvedValue({
      ok: true,
      attempt_id: "attempt_iq_1",
      scale_code: IQ_CANONICAL_SCALE_CODE,
      summary: {
        raw_score: 10,
        iq_estimate: null,
        percentile: null,
        confidence_interval: {
          min: 95,
          max: 109,
        },
      },
      dimensions: {
        visual_spatial_insight: { score: 8 },
        visual_spatial_pattern_reasoning: { score: 9 },
        numerical_pattern_reasoning: { score: 7 },
      },
      quality: {
        level: "review_with_caution",
        flags: ["speeding"],
      },
      stability: {
        status: "review_with_caution",
      },
    });
  });

  it("keeps canonical IQ identity constants and paths", () => {
    expect(IQ_CANONICAL_SCALE_CODE).toBe("IQ_INTELLIGENCE_QUOTIENT");
    expect(IQ_LEGACY_SCALE_CODE).toBe("IQ_RAVEN");
    expect(IQ_PUBLIC_SLUG).toBe("iq-test-intelligence-quotient-assessment");
    expect(IQ_CANONICAL_PUBLIC_PATH).toBe("/tests/iq-test-intelligence-quotient-assessment");
    expect(IQ_ZH_TAKE_PATH).toBe("/zh/tests/iq-test-intelligence-quotient-assessment/take");
  });

  it("keeps legacy IQ alias only as fallback metadata", () => {
    expect(IQ_LEGACY_SCALE_CODE).not.toBe(IQ_CANONICAL_SCALE_CODE);
    expect(IQ_REPORT_DIMENSION_FIELD_MAP).toEqual({
      VSPR: "visual_spatial_pattern_reasoning",
      VSI: "visual_spatial_insight",
      NPR: "numerical_pattern_reasoning",
    });
    expect(IQ_DIMENSION_NAME_MAP.NPR).toBe("数字规律推理");
  });

  it("accepts structured inline SVG question payloads", () => {
    const parsed = iqQuestionPayloadSchema.safeParse({
      ok: true,
      scale_code: IQ_CANONICAL_SCALE_CODE,
      questions: {
        items: [
          {
            question_id: "legacy_01",
            stem: {
              svg: {
                view_box: "0 0 120 120",
                paths: [
                  {
                    d: "M0 0h12v12z",
                    fill: "#222",
                    stroke: "#999",
                    strokeWidth: 1,
                    fillRule: "evenodd",
                  },
                ],
              },
            },
            options: [
              {
                option_code: "A",
                svg: {
                  viewBox: "0 0 64 64",
                  paths: [{ d: "M1 1h5v5z", stroke_width: 2 }],
                },
              },
            ],
          },
        ],
      },
    });

    expect(parsed.success).toBe(true);
  });

  it("supports VSPR, VSI, and NPR report fields with nullable IQ estimate", () => {
    const parsed = iqReportPayloadSchema.safeParse({
      ok: true,
      scale_code: IQ_CANONICAL_SCALE_CODE,
      summary: {
        raw_score: 10,
        iq_estimate: null,
        percentile: null,
      },
      dimensions: {
        visual_spatial_insight: { score: 8 },
        visual_spatial_pattern_reasoning: { score: 9 },
        numerical_pattern_reasoning: { score: 7 },
      },
      quality: {
        level: "stable",
        flags: [],
      },
      stability: {
        status: "stable",
      },
    });

    expect(parsed.success).toBe(true);
  });

  it("supports locked and deferred-commerce-safe report access typing", () => {
    for (const unlockStage of ["locked", "unlocked_adaptive", "unlocked_pro"] as const) {
      const parsed = iqReportAccessPayloadSchema.safeParse({
        ok: true,
        attempt_id: "attempt_iq_1",
        access_state: "ready",
        report_state: "ready",
        pdf_state: "ready",
        unlock_stage: unlockStage,
      });

      expect(parsed.success).toBe(true);
    }
  });

  it("uses canonical IQ scale lookup slug and canonical questions endpoint helper by default", async () => {
    await lookupIqScale({ locale: "zh" });
    await getIqQuestions({ locale: "zh", anonId: "anon_test" });

    expect(hoisted.getScaleLookup).toHaveBeenCalledWith({
      slug: IQ_PUBLIC_SLUG,
      locale: "zh",
    });
    expect(hoisted.fetchScaleQuestions).toHaveBeenCalledWith({
      scaleCode: IQ_CANONICAL_SCALE_CODE,
      formCode: undefined,
      locale: "zh",
      region: undefined,
      anonId: "anon_test",
    });
  });

  it("allows explicit legacy alias fetch without exposing it as the default path", async () => {
    await getIqQuestionsByScaleCode(IQ_LEGACY_SCALE_CODE, {
      locale: "en",
      anonId: "anon_legacy",
    });

    expect(hoisted.fetchScaleQuestions).toHaveBeenCalledWith({
      scaleCode: IQ_LEGACY_SCALE_CODE,
      formCode: undefined,
      locale: "en",
      region: undefined,
      anonId: "anon_legacy",
    });
  });

  it("forwards the owner-original bank as form_code for private backend question delivery", async () => {
    await getIqQuestions({
      locale: "zh",
      anonId: "anon_owner_original",
      formCode: IQ_OWNER_ORIGINAL_30_BANK_ID,
    });

    expect(hoisted.fetchScaleQuestions).toHaveBeenCalledWith({
      scaleCode: IQ_CANONICAL_SCALE_CODE,
      formCode: IQ_OWNER_ORIGINAL_30_BANK_ID,
      locale: "zh",
      region: undefined,
      anonId: "anon_owner_original",
    });
  });

  it("fetches one owner-original IQ question through the attempt-bound delivery helper", async () => {
    const payload = await getIqAttemptQuestion({
      attemptId: "attempt_iq_1",
      index: 0,
      anonId: "anon_owner_original",
      locale: "zh",
    });

    expect(hoisted.fetchAttemptQuestions).toHaveBeenCalledWith({
      attemptId: "attempt_iq_1",
      index: 0,
      anonId: "anon_owner_original",
      locale: "zh",
    });
    expect(iqAttemptQuestionDeliverySchema.safeParse(payload).success).toBe(true);
    expect(payload.questions.items).toHaveLength(1);
    expect(JSON.stringify(payload)).not.toMatch(/answer_key|correct_answer|solution|generator|source_capture_url/i);
  });

  it("does not introduce checkout helpers or payment CTAs in the IQ API module", async () => {
    const apiModule = await import("@/lib/iq/api");

    expect("createIqCheckout" in apiModule).toBe(false);
    expect("createCheckoutOrOrder" in apiModule).toBe(false);
  });

  it("allows nullable iq_estimate in result payloads without injecting fake defaults", () => {
    const parsed = iqResultPayloadSchema.safeParse({
      ok: true,
      scale_code: IQ_CANONICAL_SCALE_CODE,
      attempt_id: "attempt_iq_1",
      iq_estimate: null,
      percentile: null,
    });

    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.iq_estimate).toBeNull();
  });

  it("starts and submits IQ attempts without frontend-computed score fields", async () => {
    await startIqAttempt({
      scale_code: IQ_CANONICAL_SCALE_CODE,
      anon_id: "anon_iq_123",
      locale: "zh-CN",
      form_code: IQ_OWNER_ORIGINAL_30_BANK_ID,
      bank_id: IQ_OWNER_ORIGINAL_30_BANK_ID,
      source: "iq_take_page",
      meta: {
        slug: IQ_PUBLIC_SLUG,
      },
      client_version: "test",
    });

    const answers = normalizeIqSubmitAnswers([
      {
        item_id: "FM-IQ-VSPR-MX-L3-0001",
        option_code: "B",
        question_index: 0,
      },
      {
        question_id: "legacy_02",
        value: "D",
        question_index: 1,
      },
    ]);

    await submitIqAttempt({
      attempt_id: "attempt_iq_1",
      anon_id: "anon_iq_123",
      duration_ms: 180000,
      answers: [
        {
          item_id: "FM-IQ-VSPR-MX-L3-0001",
          option_code: "B",
          question_index: 0,
        },
        {
          question_id: "legacy_02",
          value: "D",
          question_index: 1,
        },
      ],
    });

    expect(hoisted.startAttempt).toHaveBeenCalledWith({
      scaleCode: IQ_CANONICAL_SCALE_CODE,
      formCode: IQ_OWNER_ORIGINAL_30_BANK_ID,
      anonId: "anon_iq_123",
      locale: "zh-CN",
      region: undefined,
      meta: {
        slug: IQ_PUBLIC_SLUG,
        form_code: IQ_OWNER_ORIGINAL_30_BANK_ID,
        bank_id: IQ_OWNER_ORIGINAL_30_BANK_ID,
        source: "iq_take_page",
      },
      clientPlatform: "web",
      clientVersion: "test",
      channel: "web",
    });

    expect(answers).toEqual([
      {
        question_id: "FM-IQ-VSPR-MX-L3-0001",
        option_code: "B",
        question_index: 0,
      },
      {
        question_id: "legacy_02",
        value: "D",
        question_index: 1,
      },
    ]);

    const submitPayload = hoisted.submitAttempt.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(submitPayload).toMatchObject({
      attemptId: "attempt_iq_1",
      anonId: "anon_iq_123",
      durationMs: 180000,
    });
    expect(JSON.stringify(submitPayload.answers)).not.toMatch(/score|raw_score|iq_estimate|checkout|sku/i);
  });

  it("consumes IQ result, access, and report endpoints without mutating report commerce state", async () => {
    const result = await import("@/lib/iq/api").then((module) =>
      module.getIqResult({
        attemptId: "attempt_iq_1",
        anonId: "anon_iq_123",
        locale: "en",
      })
    );
    const access = await getIqReportAccess({
      attemptId: "attempt_iq_1",
      anonId: "anon_iq_123",
      locale: "en",
    });
    const report = await getIqReport({
      attemptId: "attempt_iq_1",
      anonId: "anon_iq_123",
      locale: "en",
    });

    expect(hoisted.fetchAttemptResult).toHaveBeenCalledWith({
      attemptId: "attempt_iq_1",
      anonId: "anon_iq_123",
      locale: "en",
      accessToken: undefined,
    });
    expect(hoisted.fetchAttemptReportAccess).toHaveBeenCalledWith({
      attemptId: "attempt_iq_1",
      anonId: "anon_iq_123",
      locale: "en",
      accessToken: undefined,
    });
    expect(hoisted.fetchAttemptReport).toHaveBeenCalledWith({
      attemptId: "attempt_iq_1",
      anonId: "anon_iq_123",
      locale: "en",
      accessToken: undefined,
      refresh: undefined,
    });
    expect(result.iq_estimate).toBeNull();
    expect(access.unlock_stage).toBe("locked");
    expect(report.summary?.iq_estimate).toBeNull();
  });
});
