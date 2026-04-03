import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const PAGE_PATH = path.join(
  process.cwd(),
  "app/(localized)/[locale]/tests/[slug]/page.tsx"
);

describe("test detail landing contract", () => {
  it("consumes backend landing_surface_v1 instead of inventing test landing truth locally", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");

    expect(source).toContain('normalizeLandingSurface(lookup?.landing_surface_v1 ?? null)');
    expect(source).toContain('const startTestHref = landingSurface?.startTestTarget');
    expect(source).toContain('findLandingCta(landingSurface, "back_to_tests")');
    expect(source).toContain('data-testid="test-detail-landing-cta"');
  });

  it("wires mbti dual-entry CTAs without forking the landing slug", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");

    expect(source).toContain('buildMbtiTakeHref');
    expect(source).toContain('getMbtiStartLabel');
    expect(source).toContain('testId: `test-detail-landing-cta-${form.formCode}`');
    expect(source).toContain('scaleCode={test.scale_code}');
  });

  it("derives detail-page lens copy from scale code instead of hardcoding personality framing", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");

    expect(source).toContain("getDetailPageLensCopy(test.scale_code, locale)");
    expect(source).toContain("detailLensCopy.eyebrow");
    expect(source).toContain("detailLensCopy.whenToUseBody");
  });

  it("does not fake a five-star trust signal when highlight_rating is absent", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");

    expect(source).toContain('typeof test.highlight_rating === "number"');
    expect(source).toContain('landingRating !== null ? (');
    expect(source).not.toContain(" : 5;");
  });

  it("wires big5 dual-entry CTAs to the same slug with form-aware query", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");

    expect(source).toContain('buildBig5TakeHref');
    expect(source).toContain('getBig5StartLabel');
    expect(source).toContain('listBig5FormMetas');
    expect(source).toContain('showsBig5Actions');
  });

  it("wires the take page form query into QuizTakeClient props", () => {
    const takeSource = fs.readFileSync(
      path.join(process.cwd(), "app/(localized)/[locale]/tests/[slug]/take/page.tsx"),
      "utf8"
    );

    expect(takeSource).toContain('normalizeMbtiFormCode(firstQueryValue(query.form) || firstQueryValue(query.form_code))');
    expect(takeSource).toContain('formCode={mbtiFormCode ?? undefined}');
    expect(takeSource).toContain('normalizeBig5FormCode(firstQueryValue(query.form) || firstQueryValue(query.form_code))');
    expect(takeSource).toContain('formCode={big5FormCode ?? undefined}');
  });
});
