import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveCanonicalSlug } from "@/lib/assessmentSlugMap";
import {
  buildEnneagramSubmitAnswers,
  fetchEnneagramHistory,
  fetchEnneagramQuestions,
  fetchEnneagramReport,
  fetchEnneagramReportAccess,
  startEnneagramAttempt,
  submitEnneagramAttempt,
} from "@/lib/enneagram/api";
import {
  buildEnneagramTakeHref,
  listEnneagramFormMetas,
  normalizeEnneagramFormCode,
} from "@/lib/enneagram/forms";

const hoisted = vi.hoisted(() => ({
  fetchAttemptReportAccess: vi.fn(),
  fetchScaleQuestions: vi.fn(),
  getAttemptReport: vi.fn(),
  getMyAttempts: vi.fn(),
  startAttempt: vi.fn(),
  submitAttempt: vi.fn(),
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_enneagram_contract",
}));

vi.mock("@/lib/auth/authRetry", () => ({
  runWithGuestTokenRetry: async ({ runner }: { runner: () => Promise<unknown> }) => runner(),
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    fetchAttemptReportAccess: hoisted.fetchAttemptReportAccess,
    fetchScaleQuestions: hoisted.fetchScaleQuestions,
    getAttemptReport: hoisted.getAttemptReport,
    getMyAttempts: hoisted.getMyAttempts,
    startAttempt: hoisted.startAttempt,
    submitAttempt: hoisted.submitAttempt,
  };
});

function questionResponse(formCode: string) {
  return {
    ok: true,
    scale_code: "ENNEAGRAM",
    form_code: formCode,
    questions: {
      items: [
        {
          question_id: "1",
          order: 1,
          text: "Question",
          scoring_mode: formCode === "enneagram_forced_choice_144" ? "forced_choice_pair" : "likert_weighted",
          options: [
            { code: "A", text: "A" },
            { code: "B", text: "B" },
          ],
        },
      ],
    },
  };
}

describe("enneagram frontend API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.fetchScaleQuestions.mockResolvedValue(questionResponse("enneagram_likert_105"));
    hoisted.startAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt_enneagram_1",
      scale_code: "ENNEAGRAM",
      form_code: "enneagram_likert_105",
    });
    hoisted.submitAttempt.mockResolvedValue({
      ok: true,
      attempt_id: "attempt_enneagram_1",
    });
    hoisted.getAttemptReport.mockResolvedValue({
      ok: true,
      scale_code: "ENNEAGRAM",
      enneagram_form_v1: {
        form_code: "enneagram_likert_105",
        label: "105-question Likert",
        short_label: "105Q Likert",
        question_count: 105,
        estimated_minutes: 12,
        scale_code: "ENNEAGRAM",
      },
      enneagram_public_projection_v1: {
        primary_type: {
          code: "T1",
          label: "Type 1",
        },
      },
      report: {
        scale_code: "ENNEAGRAM",
        sections: [],
      },
    });
    hoisted.fetchAttemptReportAccess.mockResolvedValue({
      ok: true,
      attempt_id: "attempt_enneagram_1",
      access_state: "ready",
      report_state: "ready",
      pdf_state: "ready",
      actions: {
        page_href: "/en/result/attempt_enneagram_1",
        pdf_href: "/api/v0.3/attempts/attempt_enneagram_1/report.pdf",
      },
    });
    hoisted.getMyAttempts.mockResolvedValue({
      ok: true,
      scale_code: "ENNEAGRAM",
      items: [],
      meta: {
        current_page: 1,
        last_page: 1,
      },
    });
  });

  it("registers one Enneagram scale with two backend form codes", () => {
    expect(resolveCanonicalSlug("enneagram")).toBe("enneagram-personality-test-nine-types");
    expect(resolveCanonicalSlug("enneagram-personality-test")).toBe("enneagram-personality-test-nine-types");
    expect(resolveCanonicalSlug("nine-types-personality-test")).toBe("enneagram-personality-test-nine-types");
    expect(normalizeEnneagramFormCode(undefined)).toBe("enneagram_likert_105");
    expect(normalizeEnneagramFormCode("105")).toBe("enneagram_likert_105");
    expect(normalizeEnneagramFormCode("144")).toBe("enneagram_forced_choice_144");
    expect(listEnneagramFormMetas().map((form) => form.formCode)).toEqual([
      "enneagram_likert_105",
      "enneagram_forced_choice_144",
    ]);
    expect(listEnneagramFormMetas().map((form) => [form.formCode, form.questionCount, form.estimatedMinutes])).toEqual([
      ["enneagram_likert_105", 105, 12],
      ["enneagram_forced_choice_144", 144, 18],
    ]);
    expect(buildEnneagramTakeHref("enneagram", "zh", "144")).toBe(
      "/zh/tests/enneagram-personality-test-nine-types/take?form=enneagram_forced_choice_144"
    );
  });

  it("wires the take page to EnneagramTakeClient with form query resolution", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "app/(localized)/[locale]/tests/[slug]/take/page.tsx"),
      "utf8"
    );

    expect(source).toContain("isEnneagramScaleCode(test.scale_code)");
    expect(source).toContain("normalizeEnneagramFormCode(firstQueryValue(query.form) || firstQueryValue(query.form_code))");
    expect(source).toContain("<EnneagramTakeClient");
    expect(source).toContain("formCode={enneagramFormCode ?? undefined}");
  });

  it("wires the landing and sticky entry surfaces to explicit Enneagram form metadata", () => {
    const landingSource = fs.readFileSync(
      path.join(process.cwd(), "app/(localized)/[locale]/tests/[slug]/page.tsx"),
      "utf8"
    );
    const stickySource = fs.readFileSync(path.join(process.cwd(), "components/business/CTASticky.tsx"), "utf8");

    expect(landingSource).toContain("const showsEnneagramActions = isEnneagramScaleCode(test.scale_code)");
    expect(landingSource).toContain("listEnneagramFormMetas().map((form) => ({");
    expect(landingSource).toContain("href: buildEnneagramTakeHref(test.slug, locale, form.formCode)");
    expect(stickySource).toContain("const showsEnneagramActions = isEnneagramScaleCode(scaleCode) || isEnneagramSlug(slug)");
    expect(stickySource).toContain("listEnneagramFormMetas().map((form) => getEnneagramVariantLabel(form.formCode, locale))");
    expect(stickySource).toContain("href={buildEnneagramTakeHref(slug, locale, form.formCode)}");
  });

  it("fetches questions with explicit form_code through the shared v0.3 client", async () => {
    await fetchEnneagramQuestions({
      formCode: "enneagram_forced_choice_144",
      locale: "zh-CN",
      anonId: "anon_test",
    });

    expect(hoisted.fetchScaleQuestions).toHaveBeenCalledWith({
      scaleCode: "ENNEAGRAM",
      formCode: "enneagram_forced_choice_144",
      locale: "zh-CN",
      region: undefined,
      anonId: "anon_test",
    });
  });

  it("starts attempts with same scale and selected form_code", async () => {
    await startEnneagramAttempt({
      formCode: "enneagram_forced_choice_144",
      locale: "en",
      region: "GLOBAL",
      anonId: "anon_test",
      meta: { slug: "enneagram-personality-test-nine-types" },
      clientVersion: "test",
    });

    expect(hoisted.startAttempt).toHaveBeenCalledWith({
      scaleCode: "ENNEAGRAM",
      formCode: "enneagram_forced_choice_144",
      anonId: "anon_test",
      locale: "en",
      region: "GLOBAL",
      meta: { slug: "enneagram-personality-test-nine-types" },
      clientPlatform: "web",
      clientVersion: "test",
      channel: "web",
    });
  });

  it("submits answer-only payloads without frontend scoring fields", async () => {
    const answers = buildEnneagramSubmitAnswers({
      questionIds: ["1", "2"],
      answers: {
        "1": "2",
        "2": "A",
      },
    });

    await submitEnneagramAttempt({
      attemptId: "attempt_enneagram_1",
      anonId: "anon_test",
      answers,
      durationMs: 120000,
    });

    expect(answers).toEqual([
      { question_id: "1", code: "2", question_index: 0 },
      { question_id: "2", code: "A", question_index: 1 },
    ]);
    const payload = hoisted.submitAttempt.mock.calls[0]?.[0] as { answers: Array<Record<string, unknown>> };
    expect(payload).toMatchObject({
      attemptId: "attempt_enneagram_1",
      anonId: "anon_test",
      durationMs: 120000,
    });
    expect(JSON.stringify(payload.answers)).not.toMatch(/score|raw|type_vector|ranked/i);
  });

  it("consumes report, access, and history endpoints without introducing a frontend projection bridge", async () => {
    await fetchEnneagramReport({
      attemptId: "attempt_enneagram_1",
      anonId: "anon_test",
      locale: "en",
    });
    await fetchEnneagramReportAccess({
      attemptId: "attempt_enneagram_1",
      anonId: "anon_test",
      locale: "en",
    });
    await fetchEnneagramHistory({
      anonId: "anon_test",
      locale: "en",
      page: 1,
      pageSize: 10,
    });

    expect(hoisted.getAttemptReport).toHaveBeenCalledWith({
      attemptId: "attempt_enneagram_1",
      refresh: undefined,
      anonId: "anon_test",
      locale: "en",
    });
    expect(hoisted.fetchAttemptReportAccess).toHaveBeenCalledWith({
      attemptId: "attempt_enneagram_1",
      anonId: "anon_test",
      locale: "en",
    });
    expect(hoisted.getMyAttempts).toHaveBeenCalledWith({
      scaleCode: "ENNEAGRAM",
      page: 1,
      pageSize: 10,
      anonId: "anon_test",
      locale: "en",
    });
  });
});
