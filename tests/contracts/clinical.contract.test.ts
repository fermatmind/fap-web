import {
  clinicalQuestionsResponseSchema,
  clinicalReportResponseSchema,
  clinicalStartAttemptResponseSchema,
  clinicalSubmitResponseSchema,
} from "@/lib/clinical/contracts/schemas";

describe("Clinical contract schemas", () => {
  it("validates SDS_20 questions payload with options format + meta consent/disclaimer/source", () => {
    const payload = {
      ok: true,
      scale_code: "SDS_20",
      locale: "zh-CN",
      questions: {
        items: Array.from({ length: 20 }, (_, idx) => ({
          question_id: String(idx + 1),
          order: idx + 1,
          direction: idx % 2 === 0 ? 1 : -1,
          text: `SDS Question ${idx + 1}`,
        })),
      },
      options: {
        format: ["很少", "有时", "经常", "总是"],
      },
      meta: {
        consent: {
          required: true,
          version: "SDS20_CONSENT_v1",
          text: "Consent text",
        },
        disclaimer: {
          version: "SDS20_DISC_v1",
          hash: "hash_sds20",
          text: "Disclaimer text",
        },
        source: {
          items: [{ title: "SDS paper" }],
        },
      },
    };

    expect(() => clinicalQuestionsResponseSchema.parse(payload)).not.toThrow();
  });

  it("validates CLINICAL_COMBO_68 questions payload with modules/privacy/crisis metadata", () => {
    const payload = {
      ok: true,
      scale_code: "CLINICAL_COMBO_68",
      locale: "en",
      questions: {
        items: Array.from({ length: 68 }, (_, idx) => ({
          question_id: String(idx + 1),
          order: idx + 1,
          module_code: idx < 17 ? "M1" : idx < 34 ? "M2" : idx < 51 ? "M3" : "M4",
          options_set_code: "L5_FREQ",
          is_reverse: false,
          text: `CC68 Question ${idx + 1}`,
          options: [
            { code: "A", text: "Never", score: 0 },
            { code: "B", text: "Rarely", score: 1 },
            { code: "C", text: "Sometimes", score: 2 },
            { code: "D", text: "Often", score: 3 },
            { code: "E", text: "Almost always", score: 4 },
          ],
        })),
      },
      meta: {
        modules: {
          M1: { title: "Module 1", guidance: "Guidance 1" },
          M2: { title: "Module 2", guidance: "Guidance 2" },
        },
        consent: {
          required: true,
          version: "CC68_CONSENT_v1",
          text: "Consent text",
        },
        privacy_addendum: {
          bullets: ["bullet 1", "bullet 2"],
        },
        crisis_resources: {
          resources: [{ title: "Hotline", phone: "12345" }],
        },
        disclaimer_text: "Not a diagnosis",
      },
    };

    expect(() => clinicalQuestionsResponseSchema.parse(payload)).not.toThrow();
  });

  it("validates clinical start + submit responses", () => {
    expect(() =>
      clinicalStartAttemptResponseSchema.parse({
        ok: true,
        attempt_id: "aaaa-bbbb-cccc-dddd",
        scale_code: "SDS_20",
      })
    ).not.toThrow();

    expect(() =>
      clinicalSubmitResponseSchema.parse({
        ok: true,
        attempt_id: "aaaa-bbbb-cccc-dddd",
        report: {
          ok: true,
          locked: true,
          variant: "free",
          quality: {
            level: "B",
            crisis_alert: false,
          },
          report: {
            scale_code: "SDS_20",
            sections: [
              {
                key: "result_summary_free",
                title: "Summary",
                access_level: "free",
                blocks: [
                  {
                    id: "b1",
                    type: "markdown",
                    title: "Summary",
                    content: "summary content",
                  },
                ],
              },
            ],
          },
        },
      })
    ).not.toThrow();
  });

  it("validates report sections markdown blocks with resources + reasons", () => {
    const payload = {
      ok: true,
      locked: true,
      variant: "free",
      quality: {
        level: "C",
        crisis_alert: true,
      },
      report: {
        scale_code: "CLINICAL_COMBO_68",
        locale: "en",
        sections: [
          {
            key: "disclaimer_top",
            title: "Important Disclaimer",
            access_level: "free",
            module_code: "M0",
            blocks: [
              {
                id: "d1",
                type: "markdown",
                title: "Disclaimer",
                content: "This is not diagnosis.",
              },
            ],
          },
          {
            key: "crisis_banner",
            title: "Crisis",
            access_level: "free",
            module_code: "M0",
            blocks: [
              {
                id: "c1",
                type: "markdown",
                title: "Support",
                content: "Reach out now.",
              },
            ],
            resources: [{ title: "988", phone: "988" }],
            reasons: ["high risk signal"],
          },
        ],
      },
      meta: {
        generating: false,
        snapshot_error: false,
        retry_after_seconds: 3,
      },
    };

    expect(() => clinicalReportResponseSchema.parse(payload)).not.toThrow();
  });
});
