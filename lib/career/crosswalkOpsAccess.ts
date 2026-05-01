const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);

export function isCareerCrosswalkOpsRouteEnabled(
  env: Record<string, string | undefined> = process.env
): boolean {
  const value = env.FAP_ENABLE_CAREER_CROSSWALK_OPS;
  return typeof value === "string" && ENABLED_VALUES.has(value.trim().toLowerCase());
}
