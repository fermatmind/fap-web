import { HISTORY_DISPLAY_PATHS } from "./historyDisplayRoutes";
import { isCoreSharePath } from "./coreShareDisplay";
import { traditionalMixedQuestionnaireRoute } from "./traditionalMixedQuestionnairePaths";
import { traditionalCulturalSymbolRoute } from "./traditionalCulturalSymbolPaths";
import { traditionalObservationRoute } from "./traditionalObservationPaths";
import { traditionalDirectionalRoute } from "./traditionalDirectionalPaths";
import { isFriendshipDisplayPath } from "@/lib/friendship/routes";
import { CAREER_INTEREST_PILOTS } from "@/lib/career/explorationPilot";
import { CAREER_DATASET_FAMILY_SLUGS } from "@/lib/career/datasetDirectory";
import { localizedPath, normalizeDisplayLocale, type DisplayLocale } from "./locales";
import { ACCOUNT_DISPLAY_PATHS } from "./accountDisplayRoutes";
import { EMAIL_DISPLAY_PATHS } from "./emailDisplayRoutes";
import { traditionalLegacyStoryPath } from "./traditionalLegacyStoryPaths";
import { traditionalLikertRoute } from "./traditionalLikertPaths";
import { traditionalPracticeRoute } from "./traditionalPracticePaths";
import { traditionalArchetypeRoute } from "./traditionalArchetypePaths";
import { relationshipQuestionnaireRoute } from "./relationshipQuestionnairePaths";
import { GLOBAL_HISTORY_PATH } from "@/lib/entertainment/global-history/config";
import { findHistoryPerson } from "@/lib/entertainment/global-history/people";
import { isTraditionalTopicPath } from "./traditionalTopicPaths";
import { isCoreAssessmentSlug } from "@/lib/tests/coreAssessmentSlugs";
// Partial display-language support is deliberately separate from legacy API/form locales.
// No CMS, report-language, region, price or entitlement mapping is inferred here.
export const TRADITIONAL_LOCALE = "zh-TW" as const;
export const TRADITIONAL_QUIZ_PATH = "/tests/explore/chiikawa";
export const TRADITIONAL_PROFILE_IDS = ["chiikawa", "hachiware", "usagi", "momonga", "kurimanju", "rakko"] as const;
export const TRADITIONAL_SEVEN_SINS_PATH = "/tests/explore/seven-sins-virtues-test";
export const TRADITIONAL_SEVEN_SINS_PROFILE_IDS = ["recognition-reading", "resources-reading", "desire-boundaries-reading", "comparison-reading", "rewards-reading", "anger-reading", "starting-rest-reading"] as const;
// Direct readers are deployed before their native CMS publication. Missing
// variants stay 404; only published pages enter cross-language navigation.
export const TRADITIONAL_CMS_READER_PATHS = ["/about", "/brand", "/charter", "/careers", "/privacy", "/terms", "/method-boundaries", "/science", "/help/contact", "/foundation", "/policies", "/help/faq", "/help/about", "/help/team", "/help/used-and-mentioned", "/help/for-business-and-research", "/common-misconceptions", "/data-privacy", "/help/data-deletion", "/help/payment-refund", "/help/privacy-data", "/help/result-recovery", "/help/unlock-failure", "/item-design-notes", "/reliability-validity", "/personality/big-five/methodology", "/personality/big-five/source-review-policy"] as const;
// Expanded only after the corresponding native CMS variants are published.
// Reader deployment and published navigation remain separate inventories.
export const TRADITIONAL_CMS_PUBLISHED_PATHS = ["/about", "/brand", "/charter", "/careers", "/privacy", "/terms", "/method-boundaries", "/science", "/help/contact", "/foundation", "/policies", "/help/faq", "/help/about", "/help/team", "/help/used-and-mentioned", "/help/for-business-and-research", "/common-misconceptions", "/data-privacy", "/help/data-deletion", "/help/payment-refund", "/help/privacy-data", "/help/result-recovery", "/help/unlock-failure", "/item-design-notes", "/reliability-validity"] as const;
export const TRADITIONAL_PUBLIC_PATHS = ["", "/tests", TRADITIONAL_QUIZ_PATH, ...TRADITIONAL_PROFILE_IDS.map(id => `${TRADITIONAL_QUIZ_PATH}/results/${id}`), TRADITIONAL_SEVEN_SINS_PATH, ...TRADITIONAL_SEVEN_SINS_PROFILE_IDS.map(id => `${TRADITIONAL_SEVEN_SINS_PATH}/results/${id}`)];
// Published assessment categories are available in the language menu only.
const TRADITIONAL_CATEGORY_PATHS = ["/tests/category/personality", "/tests/category/career"] as const;

export function traditionalPath(pathname: string): string | null {
  if (pathname === "/") return "/zh-TW";
  const prefix = pathname.split("/")[1];
  if (!normalizeDisplayLocale(prefix)) return null;
  const path = pathname.replace(/^\/(?:en|zh|zh-TW)(?=\/|$)/, "").replace(/\/$/, "");
  if (ACCOUNT_DISPLAY_PATHS.some(entry => entry === path) || HISTORY_DISPLAY_PATHS.some(entry => entry === path)) return `/zh-TW${path}`;
  if (EMAIL_DISPLAY_PATHS.some(entry => entry === path)) return `/zh-TW${path}`;
  if (path === "/results/lookup") return "/zh-TW/results/lookup";
  if (path === "/orders/lookup") return "/zh-TW/orders/lookup";
  if (prefix === "zh-TW" && (path === "/pay/wait" || path === "/pay/return/alipay" || /^\/orders\/[A-Za-z0-9_-]{1,128}$/u.test(path))) return `/zh-TW${path}`;
  if (prefix === "zh-TW" && (["/personality", "/personality/big-five", "/personality/enneagram", "/tests/play"].includes(path))) return `/zh-TW${path}`;
  if (path === "/support") return "/zh-TW/support";
  if (path === "/holland-test/pdf-download") return "/zh-TW/holland-test/pdf-download";
  if (path === "/pricing") return "/zh-TW/pricing";
  if (isCoreSharePath(path)) return `/zh-TW${path}`;
  if (isFriendshipDisplayPath(path)) return `/zh-TW${path}`;
  if (traditionalLegacyStoryPath(path)) return `/zh-TW${path}`;
  if (relationshipQuestionnaireRoute(path) || traditionalArchetypeRoute(path) || traditionalPracticeRoute(path) || traditionalLikertRoute(path) || traditionalDirectionalRoute(path) || traditionalObservationRoute(path)) return `/zh-TW${path}`;
  if (traditionalCulturalSymbolRoute(path) || traditionalMixedQuestionnaireRoute(path)) return `/zh-TW${path}`;
  if (path === "/tests/explore/career-match") return `/zh-TW${path}`;
  if (path === "/career") return "/zh-TW/career";
  if (CAREER_INTEREST_PILOTS.some(code => path === `/career/interests/${code}`)) return `/zh-TW${path}`;
  if (/^\/career\/recommendations(?:\/mbti\/[ie][ns][tf][jp](?:-[at])?)?$/u.test(path)) return `/zh-TW${path}`;
  if (path === "/career/compare") return "/zh-TW/career/compare";
  if (path === "/career/industries" || (path.startsWith("/career/industries/")
    && CAREER_DATASET_FAMILY_SLUGS.includes(path.slice("/career/industries/".length)))) return `/zh-TW${path}`;
  if (/^\/career\/(?:guides(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?|jobs\/[a-z0-9]+(?:-[a-z0-9]+)*)$/u.test(path)) return `/zh-TW${path}`;
  if (path === GLOBAL_HISTORY_PATH || path === `${GLOBAL_HISTORY_PATH}/take`) return `/zh-TW${path}`;
  const historyResultPrefix = `${GLOBAL_HISTORY_PATH}/results/`;
  if (path.startsWith(historyResultPrefix) && findHistoryPerson(path.slice(historyResultPrefix.length))) return `/zh-TW${path}`;
  if (prefix === "zh-TW" && isTraditionalTopicPath(path)) return `/zh-TW${path}`;
  // Published CMS pilot: available for language navigation, but not indexable.
  // Keep it out of the sitemap list and reciprocal search alternates.
  if (TRADITIONAL_CMS_PUBLISHED_PATHS.some(entry => entry === path)) return `/zh-TW${path}`;
  if (TRADITIONAL_CATEGORY_PATHS.some(entry => entry === path)) return `/zh-TW${path}`;
  const coreAssessment = /^\/tests\/([a-z0-9_-]+)(?:\/take)?$/iu.exec(path);
  if (prefix === "zh-TW" && coreAssessment && isCoreAssessmentSlug(coreAssessment[1])) return `/zh-TW${path}`;
  if (prefix === "zh-TW" && /^\/result\/[A-Za-z0-9_-]{1,128}$/u.test(path)) return `/zh-TW${path}`;
  if (prefix === "zh-TW" && (
    TRADITIONAL_CMS_READER_PATHS.some(entry => entry === path)
    || path === "/articles"
    || /^\/articles\/(?:category\/[a-z0-9]+(?:-[a-z0-9]+)*|[A-Za-z0-9][A-Za-z0-9_-]{0,127})$/u.test(path)
  )) return `/zh-TW${path}`;
  return TRADITIONAL_PUBLIC_PATHS.includes(path) || path === `${TRADITIONAL_QUIZ_PATH}/take` || path === `${TRADITIONAL_SEVEN_SINS_PATH}/take` ? `/zh-TW${path}` : null;
}
export function traditionalEquivalent(pathname: string): string | null {
  const path = traditionalPath(pathname);
  if (path === "/zh-TW" || path === "/zh-TW/tests") return path;
  if (path && /^\/zh-TW\/career\/jobs\/[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(path)) return path;
  return path && [TRADITIONAL_QUIZ_PATH, TRADITIONAL_SEVEN_SINS_PATH].some(entry => path.startsWith(`/zh-TW${entry}`)) && !path.endsWith("/take") ? path : null;
}

/** Prefer an existing Taiwan route and retain the original path on incomplete surfaces. */
export function displayNavigationPath(path: string, locale: DisplayLocale): string {
  if (locale !== "zh-TW") return localizedPath(path, locale);
  const [originalPathname] = path.split(/[?#]/u, 1);
  const pathname = originalPathname.replace(/^\/(?:en|zh|zh-TW)(?=\/|$)/u, "") || "/";
  const suffix = path.slice(originalPathname.length);
  if (pathname === "/") return `/zh-TW${suffix}`;
  const taiwanPath = traditionalPath(`/zh-TW${pathname}`);
  return (taiwanPath ?? localizedPath(pathname, "zh")) + suffix;
}
