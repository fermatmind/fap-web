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
    expect(source).toContain('findLandingCta(landingSurface, "continue_public_content")');
    expect(source).toContain('data-testid="test-detail-landing-cta"');
  });

  it("keeps one primary mbti CTA plus a secondary CTA on the landing hero", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");

    expect(source).toContain('data-testid="mbti-landing-entry-cta-group"');
    expect(source).toContain('data-testid="mbti-landing-primary-cta"');
    expect(source).toContain('data-testid="mbti-landing-secondary-cta"');
    expect(source).toContain('buildMbtiEntryHref({');
    expect(source).toContain('buildMbtiEntryTrackingPayload({');
    expect(source).toContain('targetAction: "start_mbti_test_primary"');
  });

  it("derives detail-page lens copy from scale code instead of hardcoding personality framing", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");

    expect(source).toContain("getDetailPageLensCopy(test.scale_code, locale)");
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

  it("wires riasec dual-entry CTAs from shared forms projection", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");

    expect(source).toContain("const showsRiasecActions = isRiasecScaleCode(test.scale_code)");
    expect(source).toContain("listRiasecFormMetas(lookup?.forms)");
    expect(source).toContain("buildRiasecTakeHref(test.slug, locale, form.formCode)");
    expect(source).toContain("getRiasecStartLabel(form.formCode, locale)");
    expect(source).toContain('testId: `test-detail-landing-cta-${form.formCode}`');
    expect(source).toContain("选择霍兰德职业兴趣版本");
  });

  it("keeps the big5 variant chooser focused on version cards without extra heading copy", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");
    const big5Branch = source.slice(
      source.indexOf(") : showsBig5Actions ? ("),
      source.indexOf(") : showsEnneagramActions ? (")
    );

    expect(big5Branch).toContain("<FlagshipVariantChooser");
    expect(big5Branch).not.toContain("选择更适合你的版本");
    expect(big5Branch).not.toContain("短版用于快速起步");
    expect(big5Branch).not.toContain("Choose the version that fits best");
    expect(big5Branch).not.toContain("Use the shorter version");
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
    expect(takeSource).toContain('normalizeEnneagramFormCode(firstQueryValue(query.form) || firstQueryValue(query.form_code))');
    expect(takeSource).toContain('formCode={enneagramFormCode ?? undefined}');
    expect(takeSource).toContain('normalizeRiasecFormCode(firstQueryValue(query.form) || firstQueryValue(query.form_code))');
    expect(takeSource).toContain('formCode={riasecFormCode ?? undefined}');
  });
});
