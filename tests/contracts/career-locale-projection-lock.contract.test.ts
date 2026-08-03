import { describe, expect, it } from "vitest";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";

/** Minimal raw index item for locale-projection contract tests. */
function enRaw(payload: Record<string, unknown> = {}) {
  return {
    identity: {
      occupation_uuid: "test-uuid-001",
      canonical_slug: "software-developers",
      entity_level: "occupation",
      family_uuid: "test-family",
    },
    titles: {
      canonical_en: "Software Developers",
      canonical_zh: "软件开发人员",
      search_h1_zh: "软件开发人员工作内容",
      ...((payload.titles as Record<string, unknown>) ?? {}),
    },
    trust_summary: {
      reviewer_status: "approved",
      status: "published",
      ...((payload.trust_summary as Record<string, unknown>) ?? {}),
    },
    seo_contract: {
      robots_enabled: false,
      index_eligible: false,
      ...((payload.seo_contract as Record<string, unknown>) ?? {}),
    },
    truth_summary: {
      truth_market: "US",
      ...((payload.truth_summary as Record<string, unknown>) ?? {}),
    },
    proof_summary: payload.proof_summary ?? {},
    score_summary: payload.score_summary ?? {},
    provenance_meta: payload.provenance_meta ?? {},
    search_entry_tier: null,
    search_entry_authority: null,
  };
}

describe("W8-08-WEB career adapter locale projection contract", () => {
  it("English adapter MUST NOT fall back to zh title when canonicalEn is present", () => {
    const result = adaptCareerJobIndex({
      locale: "en",
      payload: { items: [enRaw()] },
      includeNonIndexable: false,
    });

    expect(result).toHaveLength(1);
    // Title resolved from canonicalEn, not canonicalZh
    expect(result[0].titles.title).toBe("Software Developers");
    // Zh fields MUST NOT be present in runtime output for en locale
    expect("canonicalZh" in (result[0].titles as Record<string, unknown>)).toBe(false);
    expect("searchH1Zh" in (result[0].titles as Record<string, unknown>)).toBe(false);
  });

  it("English adapter uses humanizeSlug when canonicalEn is missing — NEVER falls back to zh", () => {
    const result = adaptCareerJobIndex({
      locale: "en",
      payload: {
        items: [
          enRaw({
            titles: {
              canonical_en: null,
              canonical_zh: "软件开发人员",
              search_h1_zh: "软件开发人员工作内容",
            },
          }),
        ],
      },
      includeNonIndexable: false,
    });

    expect(result).toHaveLength(1);
    // Falls back to humanizeSlug("software-developers") = "Software Developers"
    // NOT the zh text "软件开发人员"
    expect(result[0].titles.title).toBe("Software Developers");
  });

  it("Zh adapter resolves zh title correctly", () => {
    const result = adaptCareerJobIndex({
      locale: "zh",
      payload: { items: [enRaw()] },
      includeNonIndexable: false,
    });

    expect(result).toHaveLength(1);
    expect(result[0].titles.title).toBe("软件开发人员");
    // Zh fields MUST be present in zh locale
    expect((result[0].titles as Record<string, unknown>).canonicalZh).toBe("软件开发人员");
    expect((result[0].titles as Record<string, unknown>).searchH1Zh).toBe("软件开发人员工作内容");
  });
});
