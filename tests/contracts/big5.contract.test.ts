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
      manifest_hash: "manifest_v1",
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
        manifest_hash: "manifest_v1",
        norms_version: "2026Q1",
        quality_level: "A",
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
      big5_public_projection_v1: {
        schema_version: "big5.public_projection.v1",
        trait_bands: {
          O: "high",
          C: "mid",
          E: "mid",
          A: "high",
          N: "low",
        },
        dominant_traits: [
          { key: "O", label: "Openness", percentile: 81, band: "high", rank: 1 },
          { key: "A", label: "Agreeableness", percentile: 76, band: "high", rank: 2 },
        ],
        variant_keys: ["profile:explorer", "band:o.high"],
        scene_fingerprint: {
          novelty: "exploratory",
          structure: "balanced",
        },
        explainability_summary: {
          headline: "This profile is primarily driven by Openness.",
          reasons: ["Openness is the primary axis."],
        },
        action_plan_summary: {
          headline: "The best near-term growth lever is Extraversion.",
          focus_trait: "E",
          actions: ["Move feedback checkpoints earlier."],
        },
        ordered_section_keys: [
          "traits.overview",
          "traits.why_this_profile",
          "relationships.interpersonal_style",
          "career.work_style",
          "growth.next_actions",
        ],
        cultural_calibration_v1: {
          version: "cultural_calibration.v1",
          calibration_contract_version: "cultural_calibration.v1",
          locale_context: "en-US",
          cultural_context: "US.en-US",
          calibrated_section_keys: ["result.summary", "traits.overview"],
          calibration_fingerprint: "big5-calibration-fixture",
          calibration_policy_version: "runtime.locale_policy.v1",
          calibration_source: "runtime_policy",
          narrative_overrides: {
            intro: "Locale calibration: use the profile as a planning aid, not an identity box.",
            summary:
              "In an English-speaking context, trait signals should be framed as planning inputs for work style and environment fit, not as identity labels.",
          },
        },
      },
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
            key: "traits.overview",
            title: "Traits Overview",
            access_level: "free",
            blocks: [
              {
                kind: "paragraph",
                title: "Traits Overview",
                body: "This read is shaped by Openness and Agreeableness.",
              },
            ],
          },
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

  it("validates report payload with MISSING norms and unknown block kind", () => {
    const payload = {
      ok: true,
      locked: false,
      variant: "full",
      norms: {
        status: "MISSING",
        norms_version: "2026Q1",
      },
      quality: {
        level: "C",
      },
      meta: {
        accepted_version: "BIG5_OCEAN_v1",
        accepted_hash: "hash_v1",
      },
      report: {
        sections: [
          {
            key: "future_section",
            title: "Future",
            access_level: "free",
            blocks: [
              {
                id: "future_1",
                kind: "future_widget",
                title: "Future Widget",
                body: "new payload",
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
