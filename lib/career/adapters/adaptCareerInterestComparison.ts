import type { Locale } from "@/lib/i18n/locales";
import { careerPageHasPublicBody, normalizeCareerPage, validateCareerPageAuthority } from "@/lib/career/careerPage";
import { normalizeCareerPublishedComponents } from "@/lib/career/publishedComponentContract";
import type { CareerDisplayComponentId } from "@/lib/career/displaySurface";
import { isSafeCareerJobSlug } from "@/lib/career/slugSafety";

export const CAREER_INTEREST_THEMES = ["R", "I", "A", "S", "E", "C"] as const;
export type CareerInterestTheme = typeof CAREER_INTEREST_THEMES[number];
export type CareerInterestOption = { slug: string; title: string };
export type CareerInterestRole = CareerInterestOption & {
  code: string;
  codeLabel: string;
  interest: string;
  fitInterest: string;
  sourceHash: string;
};
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

/** Select public titles only. No legacy fit scores or invented title fallback. */
export function readCareerInterestDirectory(value: unknown, locale: Locale): CareerInterestOption[] | null {
  if (!record(value) || value.bundle_kind !== "career_job_index" || value.bundle_version !== "career.protocol.job_index.v1" ||
    !Array.isArray(value.items) || value.items.length > 1046) return null;
  const result: CareerInterestOption[] = [], seen = new Set<string>();
  for (const item of value.items) {
    if (!record(item) || item.bundle_kind !== "career_job_list_item" || item.bundle_version !== "career.protocol.job_list_item.v1" ||
      !record(item.identity) || !isSafeCareerJobSlug(item.identity.canonical_slug) || !record(item.titles) || !record(item.seo_contract)) return null;
    const slug = item.identity.canonical_slug, title = item.titles[locale === "zh" ? "canonical_zh" : "canonical_en"];
    if (seen.has(slug) || !text(title) || ![`/career/jobs/${slug}`, `/${locale}/career/jobs/${slug}`].includes(String(item.seo_contract.canonical_path))) return null;
    seen.add(slug); result.push({ slug, title });
  }
  return result;
}

/** A comparison excerpt, not a replacement renderer for the complete Career page. */
export function readCareerInterestRole(value: unknown, locale: Locale, slug: string): CareerInterestRole | null {
  if (!isSafeCareerJobSlug(slug) || !record(value) || value.bundle_kind !== "career_job_detail" || value.bundle_version !== "career.detail.page.v1") return null;
  const page = normalizeCareerPage(value.career_page, locale, slug);
  if (!page || !careerPageHasPublicBody(page)) return null;
  try { validateCareerPageAuthority(value, page, locale, slug); } catch { return null; }
  const display = page.display;
  if (!record(display) || display.contract_version !== "career.detail.display.v1" || display.path !== `/${locale}/career/jobs/${slug}` ||
    !record(display.components) || !Array.isArray(display.component_order) || display.component_order.length === 0 ||
    display.component_order.some(id => typeof id !== "string") || new Set(display.component_order).size !== display.component_order.length ||
    Object.keys(display.components).length !== display.component_order.length) return null;
  const parts = normalizeCareerPublishedComponents(display.components, display.component_order as CareerDisplayComponentId[]);
  const interest = parts?.riasec_fit_block;
  if (!record(interest) || !["riasec", "riasec_short", "interest", "fit_interest"].every(k => text(interest[k])) ||
    typeof interest.riasec !== "string" || !/^[RIASEC]{1,6}$/.test(interest.riasec) || new Set(interest.riasec).size !== interest.riasec.length) return null;
  return {
    slug, title: page.content.subject.name, sourceHash: page.content.sourceContentSha256,
    code: interest.riasec, codeLabel: interest.riasec_short as string,
    interest: interest.interest as string, fitInterest: interest.fit_interest as string,
  };
}

/** Literal theme intersection. There is no similarity score, weighting or occupational ranking. */
export function compareCareerInterestThemes(selection: unknown, code: unknown): { shared: CareerInterestTheme[]; selectedOutsideCode: CareerInterestTheme[] } | null {
  if (!Array.isArray(selection) || selection.length === 0 || selection.length > 6 || new Set(selection).size !== selection.length ||
    selection.some(x => !CAREER_INTEREST_THEMES.includes(x)) || typeof code !== "string" || !/^[RIASEC]{1,6}$/.test(code) || new Set(code).size !== code.length) return null;
  const selected = CAREER_INTEREST_THEMES.filter(x => selection.includes(x));
  return { shared: selected.filter(x => code.includes(x)), selectedOutsideCode: selected.filter(x => !code.includes(x)) };
}
