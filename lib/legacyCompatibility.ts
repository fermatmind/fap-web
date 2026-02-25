import { TEST_SLUG_ALIAS_MAP } from "@/lib/assessmentSlugMap";

export type LegacyPathMode = "redirect" | "gone";

export function resolveLegacyPathMode(env: Record<string, string | undefined> = process.env): LegacyPathMode {
  const raw = String(env.FAP_LEGACY_PATH_MODE ?? "redirect").trim().toLowerCase();
  return raw === "gone" ? "gone" : "redirect";
}

export function isLegacyPath(strippedPath: string): boolean {
  if (strippedPath === "/test") return true;
  if (strippedPath.startsWith("/test/")) return true;
  if (strippedPath.startsWith("/quiz/")) return true;
  return false;
}

export function isLegacyAliasSlug(slug: string): boolean {
  const key = String(slug ?? "").trim().toLowerCase();
  if (!key) return false;

  const mapped = TEST_SLUG_ALIAS_MAP[key];
  return Boolean(mapped && mapped !== key);
}
