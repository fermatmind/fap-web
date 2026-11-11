import Link from "next/link";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import type {
  CareerFirstWaveRecommendationCompanionFamilyHubLinkAdapter,
  CareerFirstWaveRecommendationCompanionJobDetailLinkAdapter,
  CareerFirstWaveRecommendationCompanionLinksSummaryAdapter,
  CareerFirstWaveRecommendationCompanionTestLandingLinkAdapter,
  CareerFirstWaveRecommendationCompanionTopicDetailLinkAdapter,
} from "@/lib/career/adapters/types";
import { CAREER_TRACKING_EVENTS } from "@/lib/career/attribution";
import {
  buildCareerFamilyFrontendUrl,
  buildCareerJobFrontendUrl,
  normalizeCareerBundleCanonicalPath,
} from "@/lib/career/urls";
import { buildTopicFrontendUrl } from "@/lib/cms/topics";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { localizedPath, type DisplayLocale, type Locale } from "@/lib/i18n/locales";

type CareerRecommendationCompanionLinksProps = {
  locale: Locale;
  displayLocale?: DisplayLocale;
  traditionalJobTitles?: ReadonlyMap<string, string>;
  summary: CareerFirstWaveRecommendationCompanionLinksSummaryAdapter;
  landingPath: string;
  subjectKey?: string | null;
  testId?: string;
};

function getFamilyHubHref(locale: Locale, link: CareerFirstWaveRecommendationCompanionFamilyHubLinkAdapter): string {
  return normalizeCareerBundleCanonicalPath(
    locale,
    link.canonicalPath,
    buildCareerFamilyFrontendUrl(locale, link.canonicalSlug)
  );
}

function getJobDetailHref(
  locale: Locale,
  link: CareerFirstWaveRecommendationCompanionJobDetailLinkAdapter
): string {
  return normalizeCareerBundleCanonicalPath(locale, link.canonicalPath, buildCareerJobFrontendUrl(locale, link.canonicalSlug));
}

function getTestLandingHref(
  locale: Locale,
  link: CareerFirstWaveRecommendationCompanionTestLandingLinkAdapter
): string {
  return normalizeCareerBundleCanonicalPath(locale, link.canonicalPath, localizedPath(`/tests/${link.canonicalSlug}`, locale));
}

function getTopicDetailHref(
  locale: Locale,
  link: CareerFirstWaveRecommendationCompanionTopicDetailLinkAdapter
): string {
  return normalizeCareerBundleCanonicalPath(locale, link.canonicalPath, buildTopicFrontendUrl(locale, link.canonicalSlug));
}

function renderFamilyHubTitle(locale: DisplayLocale, link: CareerFirstWaveRecommendationCompanionFamilyHubLinkAdapter): string {
  if (link.titleEn) {
    return link.titleEn;
  }

  return locale === "zh-TW" ? "職業群組" : locale === "zh" ? "职业家族" : "Family hub";
}

function renderJobDetailTitle(link: CareerFirstWaveRecommendationCompanionJobDetailLinkAdapter): string {
  return link.canonicalTitleEn ?? link.canonicalSlug;
}

function renderTestLandingTitle(locale: DisplayLocale, link: CareerFirstWaveRecommendationCompanionTestLandingLinkAdapter): string {
  if (link.scaleCode === "MBTI") {
    return locale === "zh-TW" ? "MBTI 人格測驗" : locale === "zh" ? "MBTI 人格测试" : "MBTI personality test";
  }

  return locale === "zh-TW" ? "相關測驗" : locale === "zh" ? "相关测试" : "Related test";
}

function renderTopicDetailTitle(locale: DisplayLocale, link: CareerFirstWaveRecommendationCompanionTopicDetailLinkAdapter): string {
  if (link.topicCode?.toLowerCase() === "mbti" || link.canonicalSlug === "mbti") {
    return locale === "zh-TW" ? "MBTI 專題" : locale === "zh" ? "MBTI 主题页" : "MBTI topic";
  }

  return locale === "zh-TW" ? "相關專題" : locale === "zh" ? "相关主题" : "Related topic";
}

export function CareerRecommendationCompanionLinks({
  locale,
  displayLocale = locale,
  traditionalJobTitles,
  summary,
  landingPath,
  subjectKey,
  testId,
}: CareerRecommendationCompanionLinksProps) {
  if (summary.companionLinks.length === 0) {
    return null;
  }

  const linkHref = (href: string) => displayLocale === "zh-TW" ? traditionalPath(href) ?? href : href;

  return (
    <section
      className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={testId}
    >
      <div className="space-y-1">
        <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
          {displayLocale === "zh-TW" ? "相關連結" : locale === "zh" ? "关联链接" : "Companion links"}
        </h2>
      </div>

      {summary.familyHubLinks.length > 0 ? (
        <div className="space-y-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {displayLocale === "zh-TW" ? "職業群組" : locale === "zh" ? "职业族中心" : "Family hub"}
          </p>
          <ul className="m-0 space-y-2 pl-5 text-sm text-[var(--fm-text-muted)]">
            {summary.familyHubLinks.map((link) => (
              <li
                key={`${link.routeKind}:${link.canonicalPath}:${link.canonicalSlug}`}
                data-testid="career-recommendation-companion-family-link"
              >
                <Link
                  href={linkHref(getFamilyHubHref(locale, link))}
                  className="font-medium text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {renderFamilyHubTitle(displayLocale, link)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {summary.jobDetailLinks.length > 0 ? (
        <div className="space-y-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {displayLocale === "zh-TW" ? "相關職業頁面" : locale === "zh" ? "相关职业页面" : "Related job pages"}
          </p>
          <ul className="m-0 space-y-2 pl-5 text-sm text-[var(--fm-text-muted)]">
            {summary.jobDetailLinks.map((link) => (
              <li
                key={`${link.routeKind}:${link.canonicalPath}:${link.canonicalSlug}`}
                data-testid="career-recommendation-companion-job-link"
              >
                <Link
                  href={linkHref(getJobDetailHref(locale, link))}
                  className="font-medium text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {traditionalJobTitles?.get(link.canonicalSlug) ?? renderJobDetailTitle(link)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {summary.testLandingLinks.length > 0 ? (
        <div className="space-y-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {displayLocale === "zh-TW" ? "相關測驗" : locale === "zh" ? "相关测试" : "Related test"}
          </p>
          <ul className="m-0 space-y-2 pl-5 text-sm text-[var(--fm-text-muted)]">
            {summary.testLandingLinks.map((link) => (
              <li
                key={`${link.routeKind}:${link.canonicalPath}:${link.canonicalSlug}`}
                data-testid="career-recommendation-companion-test-link"
              >
                <TrackedCareerLink
                  href={linkHref(getTestLandingHref(locale, link))}
                  eventName={CAREER_TRACKING_EVENTS.supportLinkClick}
                  eventPayload={{
                    locale,
                    entrySurface: "career_recommendation_detail",
                    sourcePageType: "career_recommendation_detail",
                    targetAction: "open_support_link",
                    landingPath,
                    routeFamily: "recommendation_detail",
                    subjectKind: subjectKey ? "job_slug" : "none",
                    subjectKey,
                    queryMode: "non_query",
                  }}
                  className="font-medium text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {renderTestLandingTitle(displayLocale, link)}
                </TrackedCareerLink>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {summary.topicDetailLinks.length > 0 ? (
        <div className="space-y-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {displayLocale === "zh-TW" ? "相關專題" : locale === "zh" ? "相关主题" : "Related topic"}
          </p>
          <ul className="m-0 space-y-2 pl-5 text-sm text-[var(--fm-text-muted)]">
            {summary.topicDetailLinks.map((link) => (
              <li
                key={`${link.routeKind}:${link.canonicalPath}:${link.canonicalSlug}`}
                data-testid="career-recommendation-companion-topic-link"
              >
                <TrackedCareerLink
                  href={linkHref(getTopicDetailHref(locale, link))}
                  eventName={CAREER_TRACKING_EVENTS.supportLinkClick}
                  eventPayload={{
                    locale,
                    entrySurface: "career_recommendation_detail",
                    sourcePageType: "career_recommendation_detail",
                    targetAction: "open_support_link",
                    landingPath,
                    routeFamily: "recommendation_detail",
                    subjectKind: subjectKey ? "job_slug" : "none",
                    subjectKey,
                    queryMode: "non_query",
                  }}
                  className="font-medium text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {renderTopicDetailTitle(displayLocale, link)}
                </TrackedCareerLink>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
