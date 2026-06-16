const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);

export const CAREER_SALARY_ASSET_PREVIEW_SLUGS = [
  "accountants-and-auditors",
  "actuaries",
  "computer-programmers",
  "agents-and-business-managers-of-artists-performers-and-athletes",
  "writers-and-authors",
  "zoologists-and-wildlife-biologists",
  "wind-turbine-technicians",
  "woodworking-machine-setters-operators-and-tenders-except-sawing",
  "air-traffic-controllers",
  "athletes-and-sports-competitors",
] as const;

const CAREER_SALARY_ASSET_PREVIEW_SLUG_SET = new Set<string>(CAREER_SALARY_ASSET_PREVIEW_SLUGS);

export function isCareerSalaryAssetPreviewEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  const value = env.FAP_CAREER_SALARY_ASSET_PREVIEW_ENABLED;
  return typeof value === "string" && ENABLED_VALUES.has(value.trim().toLowerCase());
}

export function isCareerSalaryAssetPreviewSlug(slug: string | null | undefined): boolean {
  const normalizedSlug = String(slug ?? "").trim().toLowerCase();
  return CAREER_SALARY_ASSET_PREVIEW_SLUG_SET.has(normalizedSlug);
}

export function shouldFetchCareerSalaryAssetPreview(slug: string | null | undefined): boolean {
  return isCareerSalaryAssetPreviewEnabled() && isCareerSalaryAssetPreviewSlug(slug);
}
