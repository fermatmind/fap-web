import Link from "next/link";
import type {
  CareerFirstWaveRecommendationCompanionFamilyHubLinkAdapter,
  CareerFirstWaveRecommendationCompanionJobDetailLinkAdapter,
  CareerFirstWaveRecommendationCompanionLinksSummaryAdapter,
  CareerFirstWaveRecommendationCompanionTestLandingLinkAdapter,
} from "@/lib/career/adapters/types";
import {
  buildCareerFamilyFrontendUrl,
  buildCareerJobFrontendUrl,
  normalizeCareerBundleCanonicalPath,
} from "@/lib/career/urls";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

type CareerRecommendationCompanionLinksProps = {
  locale: Locale;
  summary: CareerFirstWaveRecommendationCompanionLinksSummaryAdapter;
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

function renderFamilyHubTitle(locale: Locale, link: CareerFirstWaveRecommendationCompanionFamilyHubLinkAdapter): string {
  if (link.titleEn) {
    return link.titleEn;
  }

  return locale === "zh" ? "职业家族" : "Family hub";
}

function renderJobDetailTitle(link: CareerFirstWaveRecommendationCompanionJobDetailLinkAdapter): string {
  return link.canonicalTitleEn ?? link.canonicalSlug;
}

function renderTestLandingTitle(locale: Locale, link: CareerFirstWaveRecommendationCompanionTestLandingLinkAdapter): string {
  if (link.scaleCode === "MBTI") {
    return locale === "zh" ? "MBTI 人格测试" : "MBTI personality test";
  }

  return locale === "zh" ? "相关测试" : "Related test";
}

export function CareerRecommendationCompanionLinks({
  locale,
  summary,
  testId,
}: CareerRecommendationCompanionLinksProps) {
  if (summary.companionLinks.length === 0) {
    return null;
  }

  return (
    <section
      className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={testId}
    >
      <div className="space-y-1">
        <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "关联链接" : "Companion links"}
        </h2>
      </div>

      {summary.familyHubLinks.length > 0 ? (
        <div className="space-y-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {locale === "zh" ? "Family hub" : "Family hub"}
          </p>
          <ul className="m-0 space-y-2 pl-5 text-sm text-[var(--fm-text-muted)]">
            {summary.familyHubLinks.map((link) => (
              <li
                key={`${link.routeKind}:${link.canonicalPath}:${link.canonicalSlug}`}
                data-testid="career-recommendation-companion-family-link"
              >
                <Link
                  href={getFamilyHubHref(locale, link)}
                  className="font-medium text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {renderFamilyHubTitle(locale, link)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {summary.jobDetailLinks.length > 0 ? (
        <div className="space-y-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {locale === "zh" ? "Related job pages" : "Related job pages"}
          </p>
          <ul className="m-0 space-y-2 pl-5 text-sm text-[var(--fm-text-muted)]">
            {summary.jobDetailLinks.map((link) => (
              <li
                key={`${link.routeKind}:${link.canonicalPath}:${link.canonicalSlug}`}
                data-testid="career-recommendation-companion-job-link"
              >
                <Link
                  href={getJobDetailHref(locale, link)}
                  className="font-medium text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {renderJobDetailTitle(link)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {summary.testLandingLinks.length > 0 ? (
        <div className="space-y-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {locale === "zh" ? "相关测试" : "Related test"}
          </p>
          <ul className="m-0 space-y-2 pl-5 text-sm text-[var(--fm-text-muted)]">
            {summary.testLandingLinks.map((link) => (
              <li
                key={`${link.routeKind}:${link.canonicalPath}:${link.canonicalSlug}`}
                data-testid="career-recommendation-companion-test-link"
              >
                <Link
                  href={getTestLandingHref(locale, link)}
                  className="font-medium text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {renderTestLandingTitle(locale, link)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
