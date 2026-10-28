import { describe, expect, it } from "vitest";
import { CAREER_INTEREST_THEMES, compareCareerInterestThemes, readCareerInterestDirectory, readCareerInterestRole } from "@/lib/career/adapters/adaptCareerInterestComparison";
import { careerMatchDirectoryFixture, careerMatchRoleFixture } from "@/tests/fixtures/questionnaires/careerMatch";

describe("published Current Career interest comparison source", () => {
  it("compares all3969 nonempty theme-set pairs literally without a rank or weighted fit score", () => {
    let checked = 0;
    for (let a = 1; a < 64; a++) for (let b = 1; b < 64; b++) {
      const selected = CAREER_INTEREST_THEMES.filter((_, i) => (a & (1 << i)) !== 0), code = CAREER_INTEREST_THEMES.filter((_, i) => (b & (1 << i)) !== 0).reverse().join("");
      const actual = compareCareerInterestThemes([...selected].reverse(), code)!;
      expect(actual).toEqual({ shared: CAREER_INTEREST_THEMES.filter((_, i) => (a & b & (1 << i)) !== 0), selectedOutsideCode: CAREER_INTEREST_THEMES.filter((_, i) => (a & (1 << i)) !== 0 && (b & (1 << i)) === 0) });
      checked++;
    }
    expect(checked).toBe(3969);
    expect(compareCareerInterestThemes(["A", "S"], "ASE")).toEqual({ shared: ["A", "S"], selectedOutsideCode: [] });
    expect(compareCareerInterestThemes(["R", "I"], "ASE")).toEqual({ shared: [], selectedOutsideCode: ["R", "I"] });
    for (const selected of [null, [], "AS", ["A", "A"], ["X"], [1], ["R", "I", "A", "S", "E", "C", "R"]]) expect(compareCareerInterestThemes(selected, "ASE")).toBeNull();
    for (const code of [null, "", "AS A", "AAS", "XYZ", ["A"], "a"]) expect(compareCareerInterestThemes(["A"], code)).toBeNull();
  });
  it("uses locale-specific real index titles and preserves source order without identity/translation fallback", () => {
    for (const locale of ["en", "zh"] as const) {
      const source = careerMatchDirectoryFixture(locale);
      expect(readCareerInterestDirectory(source, locale)?.map(x => x.slug)).toEqual(source.items.map(x => x.identity.canonical_slug));
      expect(readCareerInterestDirectory(source, locale === "en" ? "zh" : "en")).toBeNull();
      for (const mutate of [(s: typeof source) => { s.bundle_version = "other"; }, (s: typeof source) => { s.items[0].identity.canonical_slug = "../../private"; }, (s: typeof source) => { s.items[1].identity.canonical_slug = s.items[0].identity.canonical_slug; }, (s: typeof source) => { s.items[0].seo_contract.canonical_path = "https://example.com"; }, (s: typeof source) => { s.items[0].titles = {}; }]) {
        const bad = structuredClone(source); mutate(bad); expect(readCareerInterestDirectory(bad, locale)).toBeNull();
      }
      expect(readCareerInterestDirectory({ ...source, items: [] }, locale)).toEqual([]);
    }
    for (const bad of [null, [], {}, { items: [] }, { bundle_kind: "career_job_index", bundle_version: "career.protocol.job_index.v1", items: Array(1047).fill({}) }]) expect(readCareerInterestDirectory(bad, "en")).toBeNull();
  });
  it("requires the complete existing page/authority/component validators before reading all four interest fields", () => {
    for (const locale of ["en", "zh"] as const) {
      const raw = careerMatchRoleFixture(locale), fields = raw.career_page.display.components.riasec_fit_block;
      expect(readCareerInterestRole(raw, locale, "contract-role-a")).toEqual({ slug: "contract-role-a", title: raw.career_page.subject.name, sourceHash: raw.career_page.source_content_sha256, code: fields.riasec, codeLabel: fields.riasec_short, interest: fields.interest, fitInterest: fields.fit_interest });
      expect(readCareerInterestRole(raw, locale, "contract-role-b")).toBeNull();
      expect(readCareerInterestRole(raw, locale === "en" ? "zh" : "en", "contract-role-a")).toBeNull();
      const changes: ((x: typeof raw) => void)[] = [
        x => { x.bundle_version = "legacy"; }, x => { x.career_page.source_content_sha256 = "b".repeat(64); },
        x => { x.identity.canonical_slug = "different"; }, x => { x.seo_contract.metadata_fingerprint = "b".repeat(64); },
        x => { x.career_page.content.content_state = "legacy"; x.career_page.content.blocks = []; },
        x => { x.career_page.display.component_order = ["riasec_fit_block", "riasec_fit_block"]; },
        x => { x.career_page.display.components.riasec_fit_block.interest = ""; },
        x => { x.career_page.display.components.riasec_fit_block.riasec = "AAS"; },
        x => { x.career_page.content.blocks[0].items[0].data.paragraphs = []; },
      ];
      for (const change of changes) { const bad = structuredClone(raw); change(bad); expect(readCareerInterestRole(bad, locale, "contract-role-a")).toBeNull(); }
      // A legacy numeric profile or alternate display cannot repair a missing Current interest component.
      const poisoned = { ...raw, structured: { riasec_profile: { A: 100 } }, presentation_v2: { riasec: "ASE" }, career_page: { ...raw.career_page, display: undefined } };
      expect(readCareerInterestRole(poisoned, locale, "contract-role-a")).toBeNull();
    }
  });
});
