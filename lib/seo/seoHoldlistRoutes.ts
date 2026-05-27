const CLINICAL_PENDING_TEST_SLUGS = new Set([
  "clinical-depression-anxiety-assessment-professional-edition",
  "depression-screening-test-standard-edition",
]);

function normalizePathname(pathname: string): string {
  const pathOnly = pathname.split(/[?#]/, 1)[0] || "/";
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  return withLeadingSlash.replace(/\/+$/, "") || "/";
}

function stripLocalePrefix(pathname: string): string {
  return normalizePathname(pathname).replace(/^\/(?:en|zh)(?=\/|$)/, "") || "/";
}

export function isPrivateUtilityRoute(pathname: string): boolean {
  return stripLocalePrefix(pathname) === "/results/lookup";
}

export function isClinicalDepressionPendingSlug(slug: string | null | undefined): boolean {
  return CLINICAL_PENDING_TEST_SLUGS.has(String(slug ?? "").trim().toLowerCase());
}

export function isClinicalDepressionPendingRoute(pathname: string): boolean {
  const stripped = stripLocalePrefix(pathname);
  const clinicalMatch = stripped.match(/^\/tests\/([^/]+)$/);

  return isClinicalDepressionPendingSlug(clinicalMatch?.[1]);
}

export const isHighRiskPendingAssessmentRoute = isClinicalDepressionPendingRoute;

export function isSeoHoldlistRoute(pathname: string): boolean {
  return isClinicalDepressionPendingRoute(pathname);
}

export function shouldDisableLocaleSwitchLinks(pathname: string): boolean {
  return isPrivateUtilityRoute(pathname) || isSeoHoldlistRoute(pathname);
}
