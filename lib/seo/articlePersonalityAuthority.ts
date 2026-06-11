import type { CmsArticle } from "@/lib/cms/articles";
import type { PersonalityProjectionViewModel } from "@/lib/cms/personality";

export type ArticleJsonLdAuthoritySource =
  | "cms_article_seo_jsonld"
  | "visible_content_compatibility_fallback"
  | "blocked";

const LEGACY_ARTICLE_SCHEMA_COMPATIBILITY_ALLOWLIST = new Set([
  // Pre-existing indexable RIASEC article whose Article/FAQ schema launch was already verified before schema hold decoupling.
  "what-is-riasec-holland-code-career-interest-test",
]);

const LEGACY_ARTICLE_HREFLANG_COMPATIBILITY_ALLOWLIST = new Set([
  // Pre-existing indexable RIASEC article whose hreflang launch was already verified before article hreflang hold decoupling.
  "what-is-riasec-holland-code-career-interest-test",
]);

export type ArticleJsonLdAuthorityGate = {
  source: ArticleJsonLdAuthoritySource;
  canRenderJsonLd: boolean;
  classification: "backend_cms_complete" | "compatibility_wrapper" | "blocked";
  blocksExpansion: boolean;
};

export type ArticleSchemaGateSource =
  | "noindex_hold"
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
  | "explicit_cms_hreflang_gate"
  | "legacy_hreflang_compatibility_allowlist"
  | "hreflang_hold_default";

export type ArticleHreflangGate = {
  source: ArticleHreflangGateSource;
  canRenderHreflang: boolean;
  reason: string;
};

function readSchemaGateValue(source: unknown): boolean {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return false;
  }

  const record = source as Record<string, unknown>;
  if (record.enabled === true || record.schema_allowed === true || record.schemaAllowed === true) {
    return true;
  }

  const schemaGate = record.schema_gate_v1 ?? record.schemaGateV1;
  if (readSchemaGateValue(schemaGate)) {
    return true;
  }

  const articleSchemaGate = record.article_schema_gate_v1 ?? record.articleSchemaGateV1;
  if (readSchemaGateValue(articleSchemaGate)) {
    return true;
  }

  const schemaJson = record.schema_json ?? record.schemaJson;
  if (readSchemaGateValue(schemaJson)) {
    return true;
  }

  return false;
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
  allowed: boolean,
  reason: string
): ArticleSchemaGate {
  return {
    source,
    canRenderArticleJsonLd: allowed,
    canRenderBreadcrumbJsonLd: allowed,
    canRenderFAQPageJsonLd: allowed,
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
}): ArticleSchemaGate {
  if (input.noindex) {
    return articleSchemaGate("noindex_hold", false, "Noindex articles must not emit Article/Breadcrumb/FAQ JSON-LD.");
  }

  if (readSchemaGateValue(input.article.seoMeta)) {
    return articleSchemaGate("explicit_cms_schema_gate", true, "CMS article schema gate explicitly allows schema output.");
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
}): ArticleHreflangGate {
  if (input.noindex) {
    return articleHreflangGate("noindex_hold", false, "Noindex articles must not emit hreflang or x-default alternates.");
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
