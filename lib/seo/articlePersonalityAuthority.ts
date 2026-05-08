import type { CmsArticle } from "@/lib/cms/articles";
import type { PersonalityProjectionViewModel } from "@/lib/cms/personality";

export type ArticleJsonLdAuthoritySource =
  | "cms_article_seo_jsonld"
  | "visible_content_compatibility_fallback"
  | "blocked";

export type ArticleJsonLdAuthorityGate = {
  source: ArticleJsonLdAuthoritySource;
  canRenderJsonLd: boolean;
  classification: "backend_cms_complete" | "compatibility_wrapper" | "blocked";
  blocksExpansion: boolean;
};

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
