import {
  big5MeAttemptsResponseSchema,
  big5QuestionsResponseSchema,
  big5ReportResponseSchema,
  big5StartAttemptResponseSchema,
  big5SubmitResponseSchema,
} from "@/lib/big5/contracts/schemas";

describe("BIG5 contract schemas", () => {
  it("validates questions payload with disclaimer meta", () => {
    const payload = {
      ok: true,
      scale_code: "BIG5_OCEAN",
      pack_id: "BIG5_OCEAN",
      dir_version: "v1",
      content_package_version: "v1",
      questions: {
        schema: "fap.questions.v1",
        items: Array.from({ length: 120 }, (_, idx) => ({
          question_id: String(idx + 1),
          text: `Q${idx + 1}`,
          order: idx + 1,
          options: [
            { code: "1", text: "Strongly disagree" },
            { code: "2", text: "Disagree" },
            { code: "3", text: "Neutral" },
            { code: "4", text: "Agree" },
            { code: "5", text: "Strongly agree" },
          ],
        })),
      },
      meta: {
        disclaimer_version: "BIG5_OCEAN_v1",
        disclaimer_hash: "abc123",
        disclaimer_text: "Not a medical diagnosis",
      },
    };

    expect(() => big5QuestionsResponseSchema.parse(payload)).not.toThrow();
  });

  it("validates start + submit responses", () => {
    expect(() =>
      big5StartAttemptResponseSchema.parse({
        ok: true,
        attempt_id: "11111111-1111-1111-1111-111111111111",
        resume_token: "resume_token",
      })
    ).not.toThrow();

    expect(() =>
      big5SubmitResponseSchema.parse({
        ok: true,
        attempt_id: "11111111-1111-1111-1111-111111111111",
        idempotent: true,
        report: { locked: true },
      })
    ).not.toThrow();
  });

  it("validates report payload with sections + modules + norms", () => {
    const payload = {
      ok: true,
      locked: true,
      variant: "free",
      modules_allowed: ["big5_core"],
      modules_offered: ["big5_full", "big5_action_plan"],
      norms: {
        status: "CALIBRATED",
        norms_version: "2026Q1",
      },
      quality: {
        level: "A",
      },
      report: {
        sections: [
          {
            key: "summary",
            title: "Summary",
            access_level: "free",
            blocks: [
              {
                id: "summary_1",
                kind: "paragraph",
                title: "Summary",
                body: "Your profile summary.",
              },
            ],
          },
        ],
      },
    };

    expect(() => big5ReportResponseSchema.parse(payload)).not.toThrow();
  });

  it("validates me attempts payload", () => {
    const payload = {
      ok: true,
      scale_code: "BIG5_OCEAN",
      items: [
        {
          attempt_id: "a1",
          submitted_at: "2026-02-01T00:00:00Z",
          result_summary: {
            domains_mean: {
              O: 50,
              C: 50,
              E: 50,
              A: 50,
              N: 50,
            },
          },
        },
      ],
      history_compare: {
        current_attempt_id: "a2",
        previous_attempt_id: "a1",
        domains_delta: {
          O: { delta: 2, direction: "up" },
        },
      },
    };

    expect(() => big5MeAttemptsResponseSchema.parse(payload)).not.toThrow();
  });
});
