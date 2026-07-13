import type { CmsArticle, CmsArticleSeoAuthorityProjection } from "@/lib/cms/articles";
import type { PersonalityProjectionViewModel } from "@/lib/cms/personality";

export type ArticleJsonLdAuthoritySource =
  | "cms_article_seo_jsonld"
  | "visible_content_compatibility_fallback"
  | "blocked";

const LEGACY_ARTICLE_SCHEMA_COMPATIBILITY_ALLOWLIST = new Set([
  // Pre-existing indexable RIASEC article whose Article/FAQ schema launch was already verified before schema hold decoupling.
  "what-is-riasec-holland-code-career-interest-test",
  // Existing Chinese RIASEC pillar release paired with the English Holland Code article for Article/FAQ schema output.
  "riasec-holland-career-interest-test-explained",
]);

const LEGACY_ARTICLE_HREFLANG_COMPATIBILITY_ALLOWLIST = new Set([
  // Pre-existing indexable RIASEC article whose hreflang launch was already verified before article hreflang hold decoupling.
  "what-is-riasec-holland-code-career-interest-test",
  // Existing Chinese RIASEC pillar release paired with the English Holland Code article for hreflang output.
  "riasec-holland-career-interest-test-explained",
]);

export type ArticleJsonLdAuthorityGate = {
  source: ArticleJsonLdAuthoritySource;
  canRenderJsonLd: boolean;
  classification: "backend_cms_complete" | "compatibility_wrapper" | "blocked";
  blocksExpansion: boolean;
};

export type ArticleSchemaGateSource =
  | "noindex_hold"
  | "backend_authority_projection"
  | "explicit_cms_schema_gate"
  | "legacy_schema_compatibility_allowlist"
  | "schema_hold_default";

export type ArticleSchemaGate = {
  source: ArticleSchemaGateSource;
  canRenderArticleJsonLd: boolean;
  canRenderBreadcrumbJsonLd: boolean;
  canRenderFAQPageJsonLd: boolean;
  reason: string;
};

export type ArticleHreflangGateSource =
  | "noindex_hold"
  | "backend_authority_projection"
  | "explicit_cms_hreflang_gate"
  | "legacy_hreflang_compatibility_allowlist"
  | "hreflang_hold_default";

export type ArticleHreflangGate = {
  source: ArticleHreflangGateSource;
  canRenderHreflang: boolean;
  reason: string;
};

type ArticleSchemaGateAllowances = {
  article: boolean;
  breadcrumb: boolean;
  faq: boolean;
};

type ArticleSchemaGateRead = {
  allowances: ArticleSchemaGateAllowances;
  specified: ArticleSchemaGateAllowances;
  hasExplicitSchemaGate: boolean;
};

function readBooleanGateValue(source: unknown): boolean | null {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return null;
  }

  const record = source as Record<string, unknown>;
  if (record.enabled === true || record.schema_allowed === true || record.schemaAllowed === true) {
    return true;
  }

  if (record.enabled === false || record.schema_allowed === false || record.schemaAllowed === false) {
    return false;
  }

  return null;
}

function allSchemaAllowances(allowed: boolean): ArticleSchemaGateAllowances {
  return {
    article: allowed,
    breadcrumb: allowed,
    faq: allowed,
  };
}

function mergeSchemaGateRead(
  current: ArticleSchemaGateRead,
  next: ArticleSchemaGateRead
): ArticleSchemaGateRead {
  return {
    allowances: {
      article: next.specified.article ? next.allowances.article : current.allowances.article,
      breadcrumb: next.specified.breadcrumb ? next.allowances.breadcrumb : current.allowances.breadcrumb,
      faq: next.specified.faq ? next.allowances.faq : current.allowances.faq,
    },
    specified: {
      article: current.specified.article || next.specified.article,
      breadcrumb: current.specified.breadcrumb || next.specified.breadcrumb,
      faq: current.specified.faq || next.specified.faq,
    },
    hasExplicitSchemaGate: current.hasExplicitSchemaGate || next.hasExplicitSchemaGate,
  };
}

function readArticleSchemaGate(source: unknown): ArticleSchemaGateRead {
  const empty: ArticleSchemaGateRead = {
    allowances: {
      article: false,
      breadcrumb: false,
      faq: false,
    },
    specified: {
      article: false,
      breadcrumb: false,
      faq: false,
    },
    hasExplicitSchemaGate: false,
  };

  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return empty;
  }

  const record = source as Record<string, unknown>;
  let allowances = { ...empty.allowances };
  const specified = { ...empty.specified };
  let hasExplicitSchemaGate = false;

  const directGate = readBooleanGateValue(record);
  if (directGate !== null) {
    allowances = allSchemaAllowances(directGate);
    Object.assign(specified, allSchemaAllowances(true));
    hasExplicitSchemaGate = true;
  }

  const genericGate = readBooleanGateValue(record.schema_gate_v1 ?? record.schemaGateV1);
  if (genericGate !== null) {
    allowances = allSchemaAllowances(genericGate);
    Object.assign(specified, allSchemaAllowances(true));
    hasExplicitSchemaGate = true;
  }

  const articleGate = readBooleanGateValue(record.article_schema_gate_v1 ?? record.articleSchemaGateV1);
  if (articleGate !== null) {
    allowances.article = articleGate;
    specified.article = true;
    hasExplicitSchemaGate = true;
  }

  const breadcrumbGate = readBooleanGateValue(record.breadcrumb_schema_gate_v1 ?? record.breadcrumbSchemaGateV1);
  if (breadcrumbGate !== null) {
    allowances.breadcrumb = breadcrumbGate;
    specified.breadcrumb = true;
    hasExplicitSchemaGate = true;
  }

  const faqGate = readBooleanGateValue(record.faq_schema_gate_v1 ?? record.faqSchemaGateV1);
  if (faqGate !== null) {
    allowances.faq = faqGate;
    specified.faq = true;
    hasExplicitSchemaGate = true;
  }

  let read: ArticleSchemaGateRead = {
    allowances,
    specified,
    hasExplicitSchemaGate,
  };

  const schemaJson = readArticleSchemaGate(record.schema_json ?? record.schemaJson);
  if (schemaJson.hasExplicitSchemaGate) {
    read = mergeSchemaGateRead(read, schemaJson);
  }

  const gateBundle = readArticleSchemaGate(record.schema_gates_v1 ?? record.schemaGatesV1);
  if (gateBundle.hasExplicitSchemaGate) {
    read = mergeSchemaGateRead(read, gateBundle);
  }

  return read;
}

function readSchemaGateValue(source: unknown): boolean {
  const gate = readArticleSchemaGate(source);
  return gate.allowances.article || gate.allowances.breadcrumb || gate.allowances.faq;
}

function readHreflangGateValue(source: unknown): boolean {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return false;
  }

  const record = source as Record<string, unknown>;
  if (record.hreflang_allowed === true || record.hreflangAllowed === true) {
    return true;
  }

  const hreflangGate = record.hreflang_gate_v1 ?? record.hreflangGateV1;
  if (readSchemaGateValue(hreflangGate) || readHreflangGateValue(hreflangGate)) {
    return true;
  }

  const i18nGate = record.i18n_hreflang_gate_v1 ?? record.i18nHreflangGateV1;
  if (readSchemaGateValue(i18nGate) || readHreflangGateValue(i18nGate)) {
    return true;
  }

  const schemaJson = record.schema_json ?? record.schemaJson;
  if (readHreflangGateValue(schemaJson)) {
    return true;
  }

  return false;
}

function articleSchemaGate(
  source: ArticleSchemaGateSource,
  allowed: boolean | ArticleSchemaGateAllowances,
  reason: string
): ArticleSchemaGate {
  const allowances = typeof allowed === "boolean"
    ? { article: allowed, breadcrumb: allowed, faq: allowed }
    : allowed;

  return {
    source,
    canRenderArticleJsonLd: allowances.article,
    canRenderBreadcrumbJsonLd: allowances.breadcrumb,
    canRenderFAQPageJsonLd: allowances.faq,
    reason,
  };
}

function articleHreflangGate(
  source: ArticleHreflangGateSource,
  allowed: boolean,
  reason: string
): ArticleHreflangGate {
  return {
    source,
    canRenderHreflang: allowed,
    reason,
  };
}

export function resolveArticleSchemaGate(input: {
  noindex: boolean;
  cmsArticleSeoJsonLd: unknown | null;
  article: Pick<CmsArticle, "slug" | "seoMeta">;
  projectedAuthority?: CmsArticleSeoAuthorityProjection | null;
}): ArticleSchemaGate {
  if (input.noindex) {
    return articleSchemaGate("noindex_hold", false, "Noindex articles must not emit Article/Breadcrumb/FAQ JSON-LD.");
  }

  if (Object.prototype.hasOwnProperty.call(input, "projectedAuthority")) {
    const projectedAuthority = input.projectedAuthority;
    const explicitSchemaGate = readArticleSchemaGate(input.article.seoMeta);
    return articleSchemaGate(
      "backend_authority_projection",
      {
        article: Boolean(
          projectedAuthority?.structuredDataEligibility.article
          && projectedAuthority.structuredDataFragments.article,
        ),
        breadcrumb: Boolean(
          projectedAuthority?.structuredDataEligibility.breadcrumbList
          && projectedAuthority.structuredDataFragments.breadcrumbList,
        ),
        faq: Boolean(projectedAuthority)
          && explicitSchemaGate.hasExplicitSchemaGate
          && explicitSchemaGate.allowances.faq,
      },
      "Backend Article SEO authority controls Article/Breadcrumb output; visible FAQ schema remains separately explicit and fail-closed.",
    );
  }

  const explicitSchemaGate = readArticleSchemaGate(input.article.seoMeta);
  if (explicitSchemaGate.hasExplicitSchemaGate) {
    return articleSchemaGate(
      "explicit_cms_schema_gate",
      explicitSchemaGate.allowances,
      "CMS article schema gate explicitly controls Article, Breadcrumb, and FAQ schema output."
    );
  }

  if (input.cmsArticleSeoJsonLd && LEGACY_ARTICLE_SCHEMA_COMPATIBILITY_ALLOWLIST.has(input.article.slug)) {
    return articleSchemaGate(
      "legacy_schema_compatibility_allowlist",
      true,
      "Pre-existing indexable article remains schema-compatible while new CMS articles default to schema hold."
    );
  }

  return articleSchemaGate(
    "schema_hold_default",
    false,
    "Article schema defaults off unless CMS explicitly allows it or a legacy compatibility entry applies."
  );
}

export function resolveArticleHreflangGate(input: {
  noindex: boolean;
  article: Pick<CmsArticle, "slug" | "seoMeta">;
  projectedAuthority?: CmsArticleSeoAuthorityProjection | null;
}): ArticleHreflangGate {
  if (input.noindex) {
    return articleHreflangGate("noindex_hold", false, "Noindex articles must not emit hreflang or x-default alternates.");
  }

  if (Object.prototype.hasOwnProperty.call(input, "projectedAuthority")) {
    const projectedAuthority = input.projectedAuthority;
    const currentLocale = projectedAuthority?.alternateEligibility.currentLocale ?? null;
    const hasEligibleLocaleSibling = currentLocale !== null
      && projectedAuthority?.alternateEligibility.eligibleLocales.some(
        (locale) => locale !== currentLocale
          && Boolean(projectedAuthority.alternateEligibility.alternates[locale]),
      );
    const canRenderHreflang = Boolean(
      projectedAuthority?.publishedRevisionBacked
      && hasEligibleLocaleSibling,
    );
    return articleHreflangGate(
      "backend_authority_projection",
      canRenderHreflang,
      canRenderHreflang
        ? "Backend Article SEO authority exposes published, indexable locale siblings."
        : "Backend Article SEO authority exposes no eligible locale siblings.",
    );
  }

  if (readHreflangGateValue(input.article.seoMeta)) {
    return articleHreflangGate("explicit_cms_hreflang_gate", true, "CMS article hreflang gate explicitly allows alternate output.");
  }

  if (LEGACY_ARTICLE_HREFLANG_COMPATIBILITY_ALLOWLIST.has(input.article.slug)) {
    return articleHreflangGate(
      "legacy_hreflang_compatibility_allowlist",
      true,
      "Pre-existing indexable article remains hreflang-compatible while new CMS articles default to hreflang hold."
    );
  }

  return articleHreflangGate(
    "hreflang_hold_default",
    false,
    "Article hreflang defaults off unless CMS explicitly allows it or a legacy compatibility entry applies."
  );
}

export function resolveArticleJsonLdAuthority(input: {
  cmsArticleSeoJsonLd: unknown | null;
  article: Pick<CmsArticle, "title" | "excerpt" | "contentHtml" | "contentMd">;
}): ArticleJsonLdAuthorityGate {
  if (input.cmsArticleSeoJsonLd) {
    return {
      source: "cms_article_seo_jsonld",
      canRenderJsonLd: true,
      classification: "backend_cms_complete",
      blocksExpansion: false,
    };
  }

  const hasVisibleArticleContent = Boolean(
    input.article.title.trim() &&
    (input.article.excerpt.trim() || input.article.contentHtml.trim() || input.article.contentMd.trim())
  );

  if (hasVisibleArticleContent) {
    return {
      source: "visible_content_compatibility_fallback",
      canRenderJsonLd: true,
      classification: "compatibility_wrapper",
      blocksExpansion: true,
    };
  }

  return {
    source: "blocked",
    canRenderJsonLd: false,
    classification: "blocked",
    blocksExpansion: true,
  };
}

export type PersonalityFallbackProjectionGate = {
  isFallbackProjection: boolean;
  canRenderPublicSchema: boolean;
  canRenderCareerOrRecommendationClaims: boolean;
  canRenderLocalPersonalityContentPack: boolean;
  canRenderScenarioDeepDive: boolean;
  requiredRobots: "noindex,nofollow" | null;
};

export function resolvePersonalityFallbackProjectionGate(
  detail: PersonalityProjectionViewModel
): PersonalityFallbackProjectionGate {
  const isFallbackProjection =
    detail.projection.meta.routeMode === "fallback" ||
    detail.projection.meta.authoritySource === "frontend_gateway_fallback";

  if (!isFallbackProjection) {
    return {
      isFallbackProjection: false,
      canRenderPublicSchema: true,
      canRenderCareerOrRecommendationClaims: true,
      canRenderLocalPersonalityContentPack: true,
      canRenderScenarioDeepDive: true,
      requiredRobots: null,
    };
  }

  return {
    isFallbackProjection: true,
    canRenderPublicSchema: false,
    canRenderCareerOrRecommendationClaims: false,
    canRenderLocalPersonalityContentPack: false,
    canRenderScenarioDeepDive: false,
    requiredRobots: "noindex,nofollow",
  };
}
