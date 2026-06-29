import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildFAQPageJsonLd } from "@/lib/seo/generateSchema";
import { isMbtiMainFaqSchemaEvidence01AllowedFile } from "./helpers/currentPrScope";

const PAGE_PATH = path.join(
  process.cwd(),
  "app/(localized)/[locale]/tests/[slug]/page.tsx"
);
const CTA_STICKY_PATH = path.join(process.cwd(), "components/business/CTASticky.tsx");
const MBTI_FAQ_SCHEMA_EVIDENCE_PATH = path.join(
  process.cwd(),
  "docs/seo/evidence/mbti-personality-test-16-personality-types/structured-data/faq-schema-parity-readback-2026-06-29.json"
);

function changedFilesAgainstMain(): string[] {
  try {
    return execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], {
      cwd: process.cwd(),
      encoding: "utf8",
    })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

describe("test detail landing contract", () => {
  it("consumes backend landing_surface_v1 instead of inventing test landing truth locally", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");

    expect(source).toContain("getTestDetailCmsLandingSurface(slug, locale)");
    expect(source).toContain("resolveTestDetailCmsLandingSurfaceContent(cmsLandingSurface)");
    expect(source).toContain('normalizeLandingSurface(lookup?.landing_surface_v1 ?? null)');
    expect(source).toContain('const testDetailAuthority = resolveTestDetailAuthority({');
    expect(source).toContain('const startTestHref = withAttribution(');
    expect(source).toContain('landingSurface?.startTestTarget || (testDetailAuthority.cta.allowed ? withLocale(`/tests/${test.slug}/take`) : landingBasePath)');
    expect(source).toContain("const canRenderStartCta = testDetailAuthority.cta.allowed || Boolean(landingSurface?.startTestTarget);");
    expect(source).toContain('findLandingCta(landingSurface, "continue_public_content")');
    expect(source).toContain("const heroTitle = cmsLandingSurfaceContent.heroTitle || flagshipFreeTestCopy?.h1 || localizedTestTitle;");
    expect(source).toContain("const heroCopy = cmsLandingSurfaceContent.heroCopy || landingCopy || test.description;");
    expect(source).toContain("methodologyBoundaryNote: toStringValue(payload?.methodology_boundary_note),");
    expect(source).toContain("const disclaimer =");
    expect(source).toContain("cmsLandingSurfaceContent.methodologyBoundaryNote");
    expect(source).toContain("toStringValue(langNode.disclaimer)");
    expect(source).toContain("|| flagshipFreeTestCopy?.freeBoundary");
    expect(source).toContain("const cmsPrimaryCtaLabel = cmsLandingSurfaceContent.primaryCtaLabel;");
    expect(source).toContain("primaryCtaLabelOverride?: string | null;");
    expect(source).toContain("primaryCtaLabelOverride: cmsPrimaryCtaLabel");
    expect(source).toContain("const override = toStringValue(primaryCtaLabelOverride);");
    expect(source).toContain("return override;");
    expect(source).toContain("{cmsPrimaryCtaLabel || getFreeTestStartLabel({");
    expect(source).toContain("primaryCtaLabel={cmsPrimaryCtaLabel}");
    expect(source).toContain("{disclaimer ? (");
    expect(source).toContain("{disclaimer}");
    expect(source).toContain('data-testid="test-detail-landing-cta"');
    expect(source).toContain(') : canRenderStartCta ? (');
    expect(source).toContain("{testDetailAuthority.cta.allowed ? (");
  });

  it("passes CMS primary CTA labels through to sticky default-form CTAs", () => {
    const source = fs.readFileSync(CTA_STICKY_PATH, "utf8");

    expect(source).toContain("primaryCtaLabel?: string | null;");
    expect(source).toContain('const cmsPrimaryCtaLabel = typeof primaryCtaLabel === "string" ? primaryCtaLabel.trim() : "";');
    expect(source).toContain("function CTASticky");
    expect(source).toContain("const getStickyStartLabel = ({");
    expect(source).toContain("formCode === defaultFormCode");
    expect(source).toContain("return cmsPrimaryCtaLabel;");
    expect(source).toContain("defaultFormCode: DEFAULT_MBTI_FORM_CODE");
    expect(source).toContain("defaultFormCode: DEFAULT_BIG5_FORM_CODE");
    expect(source).toContain("defaultFormCode: DEFAULT_ENNEAGRAM_FORM_CODE");
    expect(source).toContain("defaultFormCode: DEFAULT_RIASEC_FORM_CODE");
    expect(source).toContain("getPrimaryStickyStartLabel");
  });

  it("renders FAQPage only from visible FAQ content or approved compatibility fallback", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");

    expect(source).toContain("hasVisibleFaq: faqItems.length > 0");
    expect(source).toContain(": testDetailAuthority.faq.allowed");
    expect(source).toContain("const faqJsonLd =");
    expect(source).toContain("mergedFaq.length > 0");
    expect(source).toContain('{faqJsonLd ? <JsonLd id={`test-faq-${test.slug}`} data={faqJsonLd} /> : null}');
    expect(source).toContain("{mergedFaq.length > 0 ? (");
  });

  it("keeps MBTI main visible FAQ and FAQPage JSON-LD in parity with backend FAQ readback evidence", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");
    const evidence = JSON.parse(fs.readFileSync(MBTI_FAQ_SCHEMA_EVIDENCE_PATH, "utf8")) as {
      slug: string;
      canonical_path: string;
      source_faq: Array<{ q: string; a: string }>;
      api_readback: Record<string, { faq_questions: string[] }>;
      faq_page_json_ld_projection: unknown;
    };

    const expectedQuestions = [
      "费马的 MBTI免费测试会收费吗？",
      "这份 16型人格完整结果/报告包含哪些内容？",
      "MBTI免费测试结果可以作为职业或心理诊断吗？",
      "完成测试后还能重新查看或重复测试吗？",
    ];
    const projectedJsonLd = buildFAQPageJsonLd(
      evidence.source_faq.map((item) => ({
        question: item.q,
        answer: item.a,
      }))
    );

    expect(evidence.slug).toBe("mbti-personality-test-16-personality-types");
    expect(evidence.canonical_path).toBe("/tests/mbti-personality-test-16-personality-types");
    expect(evidence.source_faq.map((item) => item.q)).toEqual(expectedQuestions);
    expect(evidence.api_readback.production.faq_questions).toEqual(expectedQuestions);
    expect(evidence.api_readback.staging.faq_questions).toEqual(expectedQuestions);
    expect(projectedJsonLd).toEqual(evidence.faq_page_json_ld_projection);

    const faqSourceSegment = source.slice(source.indexOf("const langNode ="), source.indexOf("const continuePublicContentCta"));
    expect(faqSourceSegment).toContain("const faqItems = parseFaq(langNode.faq);");
    expect(faqSourceSegment).toContain("const mergedFaq = faqItems.length > 0");
    expect(faqSourceSegment).toContain("? faqItems");
    expect(faqSourceSegment).toContain("buildFallbackFaq");

    const faqJsonLdStart = source.indexOf("const faqJsonLd =");
    const faqJsonLdSegment = source.slice(faqJsonLdStart, source.indexOf("return (", faqJsonLdStart));
    expect(faqJsonLdSegment).toContain("mergedFaq.length > 0");
    expect(faqJsonLdSegment).toContain("buildFAQPageJsonLd");
    expect(faqJsonLdSegment).toContain("mergedFaq.map((item) => ({");
    expect(faqJsonLdSegment).toContain("question: item.q");
    expect(faqJsonLdSegment).toContain("answer: item.a");

    const visibleFaqStart = source.indexOf("{mergedFaq.length > 0 ? (");
    const visibleFaqSegment = source.slice(visibleFaqStart, source.indexOf("{disclaimer ? (", visibleFaqStart));
    expect(visibleFaqSegment).toContain('data-evidence-block="faq"');
    expect(visibleFaqSegment).toContain("<FAQAccordion items={mergedFaq} />");
  });

  it("keeps MBTI FAQ schema evidence changes inside the approved PR3 scope", () => {
    const changedFiles = changedFilesAgainstMain();

    expect(changedFiles.every(isMbtiMainFaqSchemaEvidence01AllowedFile), changedFiles.join("\n")).toBe(true);
  });

  it("keeps one primary mbti CTA plus a secondary CTA on the landing hero", () => {
    const source = fs.readFileSync(PAGE_PATH, "utf8");

    expect(source).toContain('data-testid="mbti-landing-entry-cta-group"');
    expect(source).toContain('data-testid="mbti-landing-primary-cta"');
    expect(source).toContain('data-testid="mbti-landing-secondary-cta"');
    expect(source).toContain('buildMbtiEntryHref({');
    expect(source).toContain('buildMbtiEntryTrackingPayload({');
    expect(source).toContain('attributionParams: landingAttributionParams');
    expect(source).toContain('attributionPayload: landingAttributionPayload');
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
    expect(source).toContain("withAttribution(buildRiasecTakeHref(test.slug, locale, form.formCode))");
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

    expect(takeSource).toContain("function firstNonEmptyQueryValue");
    expect(takeSource).toContain("getIqDefaultBankDisplayModel");
    expect(takeSource).toContain("firstNonEmptyQueryValue(query.form, query.form_code, query.bank, query.bank_id)");
    expect(takeSource).toContain('redirect(withLocale(`/tests/${slug}?bank_unavailable=1`))');
    expect(takeSource).toContain('normalizeMbtiFormCode(firstNonEmptyQueryValue(query.form, query.form_code))');
    expect(takeSource).toContain('formCode={iqBankModel?.formCode ?? mbtiFormCode ?? undefined}');
    expect(takeSource).toContain('normalizeBig5FormCode(firstNonEmptyQueryValue(query.form, query.form_code))');
    expect(takeSource).toContain('formCode={big5FormCode ?? undefined}');
    expect(takeSource).toContain('normalizeEnneagramFormCode(firstNonEmptyQueryValue(query.form, query.form_code))');
    expect(takeSource).toContain('formCode={enneagramFormCode ?? undefined}');
    expect(takeSource).toContain('normalizeRiasecFormCode(firstNonEmptyQueryValue(query.form, query.form_code))');
    expect(takeSource).toContain('formCode={riasecFormCode ?? undefined}');
    expect(takeSource).toContain('test.scale_code === "RIASEC" ? (');
    expect(takeSource).toContain('questionCount={riasecFormMeta?.questionCount ?? test.questions_count}');
    expect(takeSource).toContain('import EqSjtTakeClient from "./EqSjtTakeClient"');
    expect(takeSource).toContain('test.scale_code === "EQ_SJT_16" ? (');
    expect(takeSource).toContain("<EqSjtTakeClient");
    expect(takeSource).not.toContain('import RiasecTakeClient from "./RiasecTakeClient"');
    expect(takeSource).not.toContain("<RiasecTakeClient");
  });
});
