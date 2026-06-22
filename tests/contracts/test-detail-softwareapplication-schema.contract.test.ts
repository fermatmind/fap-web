import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildTestSoftwareAppJsonLd } from "@/lib/seo/generateSchema";

const ROOT = process.cwd();
const PAGE_PATH = "app/(localized)/[locale]/tests/[slug]/page.tsx";
const SCHEMA_HELPER_PATH = "lib/seo/generateSchema.ts";
const DOC_PATH = "docs/seo/software-application-schema.md";
const ARTIFACT_PATH = "docs/seo/generated/software-application-schema.v1.json";
const STRUCTURED_DATA_FIXTURE_PATH = "tests/contracts/fixtures/discoverability-foundation/structured-data-contract.v1.json";
const PRIVATE_FLOW_PATHS = [
  "app/(localized)/[locale]/tests/[slug]/take/page.tsx",
  "app/(localized)/[locale]/test/[slug]/take/page.tsx",
  "app/(localized)/[locale]/(app)/result/[id]/page.tsx",
  "app/(localized)/[locale]/orders/[orderNo]/page.tsx",
  "app/(localized)/[locale]/share/[id]/page.tsx",
];

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function collectKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (!value || typeof value !== "object") {
    return keys;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectKeys(item, keys);
    }
    return keys;
  }

  for (const [key, item] of Object.entries(value)) {
    keys.add(key);
    collectKeys(item, keys);
  }
  return keys;
}

describe("test detail SoftwareApplication schema contract", () => {
  it("builds conservative SoftwareApplication JSON-LD from visible test-detail facts", () => {
    const payload = buildTestSoftwareAppJsonLd({
      path: "/en/tests/mbti-personality-test-16-personality-types",
      name: "MBTI Personality Test",
      description: "Understand your type preferences and decision style.",
      locale: "en",
      minutes: 15,
      featureList: ["144 questions", "15 minutes", "144 questions"],
    });
    const keys = collectKeys(payload);

    expect(payload).toMatchObject({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "@id": expect.stringContaining("/en/tests/mbti-personality-test-16-personality-types#softwareapplication"),
      name: "MBTI Personality Test",
      description: "Understand your type preferences and decision style.",
      url: expect.stringContaining("/en/tests/mbti-personality-test-16-personality-types"),
      inLanguage: "en",
      operatingSystem: "Web",
      applicationCategory: "EducationalApplication",
      timeRequired: "PT15M",
      featureList: ["144 questions", "15 minutes"],
    });
    expect([...keys]).not.toEqual(expect.arrayContaining([
      "Product",
      "offers",
      "Offer",
      "price",
      "priceCurrency",
      "availability",
      "Review",
      "AggregateRating",
      "ratingValue",
      "reviewCount",
      "questions_count",
      "scale_code",
      "manifest_hash",
      "norms_version",
    ]));
  });

  it("omits timeRequired when minutes are not a valid visible duration", () => {
    const payload = buildTestSoftwareAppJsonLd({
      path: "/zh/tests/mbti-personality-test-16-personality-types",
      name: "MBTI 性格测试",
      description: "了解你的类型偏好。",
      locale: "zh",
      minutes: 0,
      featureList: [],
    });

    expect(payload).toMatchObject({
      "@type": "SoftwareApplication",
      inLanguage: "zh-CN",
      operatingSystem: "Web",
      applicationCategory: "EducationalApplication",
    });
    expect(payload).not.toHaveProperty("timeRequired");
    expect(payload).not.toHaveProperty("featureList");
  });

  it("renders SoftwareApplication only through the gated public test detail path", () => {
    const page = read(PAGE_PATH);

    expect(page).toContain("buildTestSoftwareAppJsonLd");
    expect(page).toContain("softwareApplicationJsonLd");
    expect(page).toContain('id={`test-software-application-${test.slug}`}');
    expect(page).toContain("test.is_public !== false");
    expect(page).toContain("test.is_active !== false");
    expect(page).toContain("lookup?.is_indexable !== false");
    expect(page).toContain("!testDetailAuthority.shouldNoindexMissingMetadataAuthority");
    expect(page).toContain("isSoftwareApplicationSchemaScaleEligible({ slug: test.slug, scaleCode: test.scale_code })");
    expect(page).toContain("!hasBlockedSoftwareApplicationClaim(softwareApplicationClaimText)");
    expect(page).toContain("const heroCopy = cmsLandingSurfaceContent.heroCopy || landingCopy || test.description;");
    expect(page).toContain("softwareApplicationDescription = heroCopy");
    expect(page).toContain("featureList: softwareApplicationFeatureList");
  });

  it("keeps sensitive clinical depression anxiety and IQ ability pages excluded", () => {
    const page = read(PAGE_PATH);

    expect(page).toContain("isMentalHealthScreeningTest({ slug, scaleCode })");
    expect(page).toContain('normalizedScaleCode === "IQ_RAVEN"');
    expect(page).toContain("slug === SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN");
    expect(page).toContain('"MBTI"');
    expect(page).toContain('"BIG5_OCEAN"');
    expect(page).toContain('"ENNEAGRAM"');
    expect(page).toContain('"RIASEC"');
  });

  it("keeps Product Offer Review AggregateRating and fake rating fields out of schema code", () => {
    const schemaHelper = read(SCHEMA_HELPER_PATH);
    const page = read(PAGE_PATH);
    const combined = `${schemaHelper}\n${page}`;

    expect(combined).not.toContain('"@type": "Product"');
    expect(combined).not.toContain('"@type": "Offer"');
    expect(combined).not.toContain('"@type": "Review"');
    expect(combined).not.toContain('"@type": "AggregateRating"');
    expect(combined).not.toContain("ratingValue");
    expect(combined).not.toContain("reviewCount");
    expect(combined).not.toContain("priceCurrency");
    expect(page).toContain('typeof test.highlight_rating === "number"');
    expect(page).not.toContain(" : 5;");
  });

  it("does not add SoftwareApplication JSON-LD to private route families", () => {
    for (const relPath of PRIVATE_FLOW_PATHS) {
      const source = read(relPath);

      expect(source, relPath).not.toContain("SoftwareApplication");
      expect(source, relPath).not.toContain("buildTestSoftwareAppJsonLd");
      expect(source, relPath).not.toContain("test-software-application");
    }
  });

  it("documents the PR-SEO-01B authority boundary and structured-data contract", () => {
    const doc = read(DOC_PATH);
    const artifact = JSON.parse(read(ARTIFACT_PATH)) as {
      version: string;
      scope: string;
      schemaType: string;
      forbiddenSchema: string[];
      sensitiveScalePolicy: Record<string, string>;
      sitemapUrlSetChanged: boolean;
      llmsExposureChanged: boolean;
      backendChangeRequired: boolean;
    };
    const structuredDataFixture = read(STRUCTURED_DATA_FIXTURE_PATH);

    expect(artifact).toMatchObject({
      version: "seo.software_application_schema.v1",
      scope: "PR-SEO-01B",
      schemaType: "SoftwareApplication",
      sitemapUrlSetChanged: false,
      llmsExposureChanged: false,
      backendChangeRequired: false,
    });
    expect(artifact.forbiddenSchema).toEqual(expect.arrayContaining([
      "Product",
      "Offer",
      "Review",
      "AggregateRating",
      "fake ratings",
    ]));
    expect(artifact.sensitiveScalePolicy).toMatchObject({
      clinical_depression_anxiety: "excluded",
      iq_ability: "excluded",
      riasec: "allowed_bounded_career_interest_direction_only",
      big_five: "allowed_bounded_trait_workplace_behavior_only",
    });
    expect(doc).toContain("Product / Offer / Review / AggregateRating remain deferred");
    expect(doc).toContain("No fake ratings");
    expect(doc).toContain("No hidden schema");
    expect(doc).toContain("Sensitive clinical/depression/anxiety and IQ/ability test pages are excluded");
    expect(structuredDataFixture).toContain("SoftwareApplication");
    expect(structuredDataFixture).toContain("Product");
    expect(structuredDataFixture).toContain("AggregateRating");
  });
});
