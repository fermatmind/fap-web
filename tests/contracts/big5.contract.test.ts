import {
  big5MeAttemptsResponseSchema,
  big5QuestionsResponseSchema,
  big5ReportResponseSchema,
  big5StartAttemptResponseSchema,
  big5SubmitResponseSchema,
} from "@/lib/big5/contracts/schemas";
import type { ReportResponse } from "@/lib/api/v0_3";
import canonical120ReportFixture from "@/tests/fixtures/big5/report_canonical_120_readable.projection.json";
import canonical90ReportFixture from "@/tests/fixtures/big5/report_canonical_90_readable.projection.json";
import canonicalDegradedReportFixture from "@/tests/fixtures/big5/report_canonical_degraded.projection.json";

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
        form_code: "big5_90",
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

  it("validates canonical heavy report fixtures (120/90/degraded) as stable report contracts", () => {
    const canonical120 = structuredClone(canonical120ReportFixture) as ReportResponse;
    const canonical90 = structuredClone(canonical90ReportFixture) as ReportResponse;
    const canonicalDegraded = structuredClone(canonicalDegradedReportFixture) as ReportResponse;

    expect(() => big5ReportResponseSchema.parse(canonical120)).not.toThrow();
    expect(() => big5ReportResponseSchema.parse(canonical90)).not.toThrow();
    expect(() => big5ReportResponseSchema.parse(canonicalDegraded)).not.toThrow();

    expect(canonical120.locked).toBe(false);
    expect(canonical120.variant).toBe("full");
    const canonical120Offers = (canonical120 as { offers?: unknown }).offers;
    expect(Array.isArray(canonical120Offers) ? canonical120Offers : []).toHaveLength(0);
    expect(canonical120.big5_form_v1?.form_code).toBe("big5_120");
    expect(canonical120.big5_form_v1?.question_count).toBe(120);
    expect(canonical120.big5_public_projection_v1?.ordered_section_keys ?? []).toEqual([
      "traits.overview",
      "traits.why_this_profile",
      "relationships.interpersonal_style",
      "career.work_style",
      "growth.next_actions",
    ]);
    expect(canonical120.big5_public_projection_v1?.facet_vector ?? []).toHaveLength(30);
    expect(canonical120.report?.sections ?? []).toHaveLength(13);

    expect(canonical90.locked).toBe(false);
    expect(canonical90.variant).toBe("full");
    expect(canonical90.big5_form_v1?.form_code).toBe("big5_90");
    expect(canonical90.big5_form_v1?.question_count).toBe(90);
    expect(canonical90.big5_public_projection_v1?.facet_vector ?? []).toHaveLength(30);
    expect(canonical90.report?.sections ?? []).toHaveLength(13);

    expect(canonicalDegraded.locked).toBe(false);
    expect(canonicalDegraded.variant).toBe("full");
    expect(canonicalDegraded.big5_form_v1?.form_code).toBe("big5_120");
    expect(canonicalDegraded.big5_public_projection_v1?.facet_vector ?? []).toHaveLength(30);
    expect(canonicalDegraded.report?.sections ?? []).toHaveLength(13);
    expect(canonicalDegraded.quality?.flags ?? []).toContain("ATTENTION_CHECK_FAILED");
  });

  it("validates me attempts payload", () => {
    const payload = {
      ok: true,
      scale_code: "BIG5_OCEAN",
      items: [
        {
          attempt_id: "a1",
          submitted_at: "2026-02-01T00:00:00Z",
          access_summary: {
            access_state: "ready",
            report_state: "ready",
            pdf_state: "ready",
            reason_code: "entitlement_granted",
            access_level: "full",
            variant: "full",
            modules_allowed: ["summary", "report.full", "pdf"],
            modules_preview: [],
            actions: {
              page_href: "/en/result/a1",
              pdf_href: "/api/v0.3/attempts/a1/report.pdf",
            },
          },
          result_summary: {
            domains_mean: {
              O: 50,
              C: 50,
              E: 50,
              A: 50,
              N: 50,
            },
          },
          top_facets_summary_v1: {
            items: [
              {
                key: "O5",
                label: "O5 Intellect",
                domain: "O",
                percentile: 88,
                bucket: "high",
                kind: "strength",
              },
            ],
          },
          quality_summary: {
            level: "A",
            grade: "A",
          },
          norms_summary: {
            status: "CALIBRATED",
            norms_version: "2026Q1",
          },
          offer_summary: {
            primary_offer: null,
          },
          share_summary: {
            enabled: true,
            share_kind: "big5_result",
          },
        },
      ],
      history_compare: {
        current_attempt_id: "a2",
        previous_attempt_id: "a1",
        current_domains_mean: {
          O: 52,
          C: 48,
        },
        previous_domains_mean: {
          O: 50,
          C: 49,
        },
        domains_delta: {
          O: { delta: 2, direction: "up" },
        },
      },
    };

    expect(() => big5MeAttemptsResponseSchema.parse(payload)).not.toThrow();
  });
});
