const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);

export function isCareerAiImpactAssetPreviewEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  const value = env.FAP_CAREER_AI_IMPACT_ASSET_PREVIEW_ENABLED;
  return typeof value === "string" && ENABLED_VALUES.has(value.trim().toLowerCase());
}

export function hasCareerAiImpactAssetPreviewSlug(slug: string | null | undefined): boolean {
  const normalizedSlug = String(slug ?? "").trim().toLowerCase();
  return normalizedSlug.length > 0;
}

export function shouldFetchCareerAiImpactAssetPreview(slug: string | null | undefined): boolean {
  return isCareerAiImpactAssetPreviewEnabled() && hasCareerAiImpactAssetPreviewSlug(slug);
}
