const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);

export function isCareerSalaryAssetPreviewEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  const value = env.FAP_CAREER_SALARY_ASSET_PREVIEW_ENABLED;
  return typeof value === "string" && ENABLED_VALUES.has(value.trim().toLowerCase());
}

export function hasCareerSalaryAssetPreviewSlug(slug: string | null | undefined): boolean {
  const normalizedSlug = String(slug ?? "").trim().toLowerCase();
  return normalizedSlug.length > 0;
}

export function shouldFetchCareerSalaryAssetPreview(slug: string | null | undefined): boolean {
  return isCareerSalaryAssetPreviewEnabled() && hasCareerSalaryAssetPreviewSlug(slug);
}
