import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("schema injection contract", () => {
  it("career canonical protocol files exist and export the frozen contracts", () => {
    const careerAssetSource = read("lib/career/contracts/careerAssetMaster.ts");
    const trustManifestSource = read("lib/career/contracts/trustManifest.ts");
    const scoreResultSource = read("lib/career/contracts/scoreResult.ts");
    const claimPermissionsSource = read("lib/career/contracts/claimPermissions.ts");
    const indexSource = read("lib/career/contracts/index.ts");

    expect(careerAssetSource).toContain("export type CareerAssetMaster");
    expect(trustManifestSource).toContain("export type CareerTrustManifest");
    expect(scoreResultSource).toContain("export type CareerScoreResult");
    expect(claimPermissionsSource).toContain("export type CareerClaimPermissions");
    expect(indexSource).toContain("careerAssetMaster");
    expect(indexSource).toContain("trustManifest");
    expect(indexSource).toContain("scoreResult");
    expect(indexSource).toContain("claimPermissions");
  });

  it("tests detail page injects webpage, breadcrumb and faq JSON-LD", () => {
    const source = read("app/(localized)/[locale]/tests/[slug]/page.tsx");
    expect(source).toContain("JsonLd");
    expect(source).toContain("buildWebPageJsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).toContain("buildFAQPageJsonLd");
    expect(source).toContain('id="faq"');
  });

  it("article detail page injects article and breadcrumb JSON-LD", () => {
    const source = read("app/(localized)/[locale]/articles/[slug]/page.tsx");
    expect(source).toContain("JsonLd");
    expect(source).toContain("buildArticleJsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).toContain("datePublished");
    expect(source).toContain("dateModified");
    expect(source).toContain('data-testid="article-detail-content"');
    expect(source).not.toContain("参考来源请见正文中的文献与公开资料。");
    expect(source).not.toContain("Please refer to citations and public references listed in the article.");
  });

  it("topic detail page injects cms seo jsonld, webpage, breadcrumb, and faq jsonld", () => {
    const source = read("app/(localized)/[locale]/topics/[slug]/page.tsx");
    expect(source).toContain("JsonLd");
    expect(source).toContain("normalizeTopicSeoPayload");
    expect(source).toContain("buildWebPageJsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).toContain("buildFAQPageJsonLd");
    expect(source).toContain("renderTopicSections");
    expect(source).toContain("renderTopicEntryGroups");
  });

  it("career job detail page injects backend occupation and breadcrumb jsonld on the backend bundle path", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");
    expect(source).toContain("fetchCareerJobBundle");
    expect(source).toContain("adaptCareerJobBundle");
    expect(source).toContain("JsonLd");
    expect(source).toContain("job.structuredData.occupation");
    expect(source).toContain("job.structuredData.breadcrumbList");
    expect(source).toContain("career-job-protocol-status");
    expect(source).toContain("job.seoContract.indexEligible");
    expect(source).not.toContain("buildOccupationJsonLd");
    expect(source).not.toContain("buildBreadcrumbJsonLd");
    expect(source).not.toContain("Dataset");
    expect(source).not.toContain("Article");
    expect(source).not.toContain("getCareerJobFromCmsBySlug");
    expect(source).not.toContain("renderSimpleMarkdown");
    expect(source).toContain("Ten-year outlook");
  });

  it("career family hub page injects backend collection, item list, and breadcrumb jsonld on the backend bundle path", () => {
    const source = read("app/(localized)/[locale]/career/family/[slug]/page.tsx");
    expect(source).toContain("fetchCareerFamilyHub");
    expect(source).toContain("adaptCareerFamilyHub");
    expect(source).toContain("JsonLd");
    expect(source).toContain("hub.structuredData.collectionPage");
    expect(source).toContain("hub.structuredData.itemList");
    expect(source).toContain("hub.structuredData.breadcrumbList");
    expect(source).not.toContain("buildCollectionPageJsonLd");
    expect(source).not.toContain("buildItemListJsonLd");
    expect(source).not.toContain("buildBreadcrumbJsonLd");
    expect(source).not.toContain("Dataset");
    expect(source).not.toContain("Article");
    expect(source).not.toContain("DefinedTermSet");
    expect(source).toContain("CareerFamilyHubPage");
    expect(source).toContain("buildPageMetadata");
  });

  it("dataset hub and method pages inject dataset/article structured data on dedicated dataset surfaces only", () => {
    const hubSource = read("app/(localized)/[locale]/datasets/occupations/page.tsx");
    const methodSource = read("app/(localized)/[locale]/datasets/occupations/method/page.tsx");

    expect(hubSource).toContain("fetchCareerDatasetHub");
    expect(hubSource).toContain("adaptCareerDatasetHub");
    expect(hubSource).toContain("JsonLd");
    expect(hubSource).toContain('id="dataset-hub-jsonld"');
    expect(hubSource).toContain('id="dataset-hub-breadcrumb-jsonld"');
    expect(hubSource).toContain("DatasetFilterHub");
    expect(hubSource).toContain("DatasetDownloadInfo");
    expect(hubSource).not.toContain("fetchCareerJobBundle");
    expect(hubSource).not.toContain("fetchCareerFamilyHub");

    expect(methodSource).toContain("fetchCareerDatasetMethod");
    expect(methodSource).toContain("adaptCareerDatasetMethod");
    expect(methodSource).toContain("JsonLd");
    expect(methodSource).toContain('id="dataset-method-article-jsonld"');
    expect(methodSource).toContain('id="dataset-method-breadcrumb-jsonld"');
    expect(methodSource).toContain("DatasetMethodPanel");
    expect(methodSource).not.toContain("fetchCareerJobBundle");
    expect(methodSource).not.toContain("fetchCareerRecommendationBundle");
  });

  it("career guide detail page injects cms seo jsonld and breadcrumb jsonld", () => {
    const source = read("app/(localized)/[locale]/career/guides/[slug]/page.tsx");
    expect(source).toContain("getCareerGuideSeoFromCmsBySlug");
    expect(source).toContain("normalizeCareerGuideSeoPayload");
    expect(source).toContain("JsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).not.toContain("buildWebPageJsonLd");
    expect(source).not.toContain("getCareerGuideBySlug");
    expect(source).not.toContain("renderVeliteMdx");
    expect(source).toContain("renderSimpleMarkdown");
    expect(source).toContain("SanitizedCmsHtml");
  });

  it("career jobs list and alias pages no longer resolve jobs from local content", () => {
    const listSource = read("app/(localized)/[locale]/career/jobs/page.tsx");
    const aliasSource = read("app/(localized)/[locale]/career/[slug]/page.tsx");

    expect(listSource).toContain("fetchCareerJobIndex");
    expect(listSource).toContain("adaptCareerJobIndex");
    expect(listSource).toContain("fetchCareerDatasetHub");
    expect(listSource).toContain("filterCareerDatasetMembers");
    expect(listSource).not.toContain("listCareerJobs(");
    expect(listSource).not.toContain("personalityQuickLocate");
    expect(aliasSource).toContain("fetchCareerJobBundle");
    expect(aliasSource).toContain("adaptCareerJobBundle");
    expect(aliasSource).not.toContain("getCareerJobBySlug");
  });

  it("career guide list and alias pages resolve guides from cms helpers", () => {
    const listSource = read("app/(localized)/[locale]/career/guides/page.tsx");
    const aliasSource = read("app/(localized)/[locale]/career/[slug]/page.tsx");

    expect(listSource).toContain("listCareerGuidesFromCms");
    expect(listSource).not.toContain("listCareerGuides(");
    expect(aliasSource).toContain("getCareerGuideFromCmsBySlug");
    expect(aliasSource).not.toContain("getCareerGuideBySlug");
  });

  it("career landing page composes backend-backed jobs/recommendations with explorer shell boundaries", () => {
    const source = read("app/(localized)/[locale]/career/page.tsx");

    expect(source).not.toContain("listCareerJobs(");
    expect(source).not.toContain("CareerRecommendationPanel");
    expect(source).toContain("getCareerCenterContent");
    expect(source).toContain('data-testid="career-landing-search-entry"');
    expect(source).toContain('action={withLocale(content.pathways[0]?.href ?? "/career/jobs")}');
    expect(source).toContain('data-testid="career-explorer-pathways"');
    expect(source).toContain('data-authority-owner="editorial_ia_shell"');
    expect(source).toContain('data-authority-owner="editorial_support_links"');
    expect(source).not.toContain("growth_path[0]");
  });

  it("personality detail page injects cms seo jsonld, webpage, breadcrumb, and faq jsonld", () => {
    const source = read("app/(localized)/[locale]/personality/[type]/page.tsx");
    expect(source).toContain("normalizePersonalitySeoPayload");
    expect(source).toContain("buildWebPageJsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).toContain("buildFAQPageJsonLd");
    expect(source).toContain("getPersonalityProjectionDetailBySlugOrType");
    expect(source).toContain("renderProjectionSections");
    expect(source).toContain("renderPersonalitySections");
    expect(source).toContain("JsonLd");
  });

  it("career mbti recommendation page injects webpage, breadcrumb, and item list jsonld on the backend bundle path", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");
    expect(source).toContain("JsonLd");
    expect(source).toContain("buildWebPageJsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).toContain("buildItemListJsonLd");
    expect(source).toContain("CareerRecommendationBundleAdapter");
    expect(source).toContain("fetchCareerRecommendationBundle");
    expect(source).toContain("adaptCareerRecommendationBundle");
    expect(source).toContain("permanentRedirect(buildCareerRecommendationFrontendUrl(locale, detail.publicRouteSlug))");
    expect(source).toContain("normalizeCareerBundleCanonicalPath");
    expect(source).toContain("renderCareerDataStatus");
    expect(source).toContain("renderState.canRenderStrongTruth");
    expect(source).toContain('data-testid="career-recommendation-type-interpretation"');
    expect(source).not.toContain("getCareerJobBySlug");
    expect(source).toContain('id="answer-first"');
  });

  it("career recommendation index page uses the lightweight backend index path instead of the cms family list authority", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/page.tsx");

    expect(source).toContain("fetchCareerRecommendationIndex");
    expect(source).toContain("adaptCareerRecommendationIndex");
    expect(source).not.toContain("listMbtiCareerRecommendations");
    expect(source).not.toContain("CareerRecommendationPanel");
  });

  it("help detail page injects webpage and breadcrumb jsonld from content pages", () => {
    const source = read("app/(localized)/[locale]/help/[slug]/page.tsx");
    expect(source).toContain("JsonLd");
    expect(source).toContain("buildWebPageJsonLd");
    expect(source).toContain("buildBreadcrumbJsonLd");
    expect(source).toContain("getContentPage(contentSlug(slug), locale)");
    expect(source).not.toContain("getContentPageWithLastKnownGood");
    expect(source).not.toContain("buildFAQPageJsonLd");
  });

  it("schema builder exposes required types", () => {
    const source = read("lib/seo/generateSchema.ts");
    expect(source).toContain('"@type": "WebPage"');
    expect(source).toContain('"@type": "Article"');
    expect(source).toContain('"@type": "FAQPage"');
    expect(source).toContain('"@type": "BreadcrumbList"');
    expect(source).toContain('"@type": "ItemList"');
    expect(source).toContain('"@type": "Person"');
    expect(source).toContain('"@type": "Occupation"');
  });
});
