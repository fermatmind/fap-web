import Link from "next/link";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import type {
  CareerFirstWaveNextStepFamilyHubLinkAdapter,
  CareerFirstWaveNextStepJobDetailLinkAdapter,
  CareerFirstWaveNextStepLinksSummaryAdapter,
} from "@/lib/career/adapters/types";
import { CAREER_TRACKING_EVENTS } from "@/lib/career/attribution";
import {
  buildCareerFamilyFrontendUrl,
  buildCareerJobFrontendUrl,
  normalizeCareerBundleCanonicalPath,
} from "@/lib/career/urls";
import type { Locale } from "@/lib/i18n/locales";

type CareerNextStepLinksProps = {
  locale: Locale;
  summary: CareerFirstWaveNextStepLinksSummaryAdapter;
  landingPath: string;
  testId?: string;
};

function getFamilyHubHref(locale: Locale, link: CareerFirstWaveNextStepFamilyHubLinkAdapter): string {
  return normalizeCareerBundleCanonicalPath(
    locale,
    link.canonicalPath,
    buildCareerFamilyFrontendUrl(locale, link.canonicalSlug)
  );
}

function getJobDetailHref(locale: Locale, link: CareerFirstWaveNextStepJobDetailLinkAdapter): string {
  return normalizeCareerBundleCanonicalPath(locale, link.canonicalPath, buildCareerJobFrontendUrl(locale, link.canonicalSlug));
}

function renderFamilyHubTitle(locale: Locale, link: CareerFirstWaveNextStepFamilyHubLinkAdapter): string {
  if (link.titleEn) {
    return link.titleEn;
  }

  return locale === "zh" ? "职业家族" : "Family hub";
}

function renderJobDetailTitle(link: CareerFirstWaveNextStepJobDetailLinkAdapter): string {
  return link.canonicalTitleEn ?? link.canonicalSlug;
}

export function CareerNextStepLinks({ locale, summary, landingPath, testId }: CareerNextStepLinksProps) {
  if (summary.nextStepLinks.length === 0) {
    return null;
  }

  return (
    <section
      className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={testId}
    >
      <div className="space-y-1">
        <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "下一步链接" : "Next-step links"}
        </h2>
      </div>

      {summary.familyHubLinks.length > 0 ? (
        <div className="space-y-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {locale === "zh" ? "职业族中心" : "Family hub"}
          </p>
          <ul className="m-0 space-y-2 pl-5 text-sm text-[var(--fm-text-muted)]">
            {summary.familyHubLinks.map((link) => (
              <li key={`${link.routeKind}:${link.canonicalPath}:${link.canonicalSlug}`} data-testid="career-next-step-family-link">
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
            {locale === "zh" ? "相关职业页面" : "Related job pages"}
          </p>
          <ul className="m-0 space-y-2 pl-5 text-sm text-[var(--fm-text-muted)]">
            {summary.jobDetailLinks.map((link) => (
              <li key={`${link.routeKind}:${link.canonicalPath}:${link.canonicalSlug}`} data-testid="career-next-step-job-link">
                <TrackedCareerLink
                  href={getJobDetailHref(locale, link)}
                  eventName={CAREER_TRACKING_EVENTS.jobDetailCtaClick}
                  eventPayload={{
                    locale,
                    entrySurface: "career_job_detail",
                    sourcePageType: "career_job_detail",
                    targetAction: "open_next_step_link",
                    landingPath,
                    routeFamily: "job_detail",
                    subjectKind: "job_slug",
                    subjectKey: link.canonicalSlug,
                    queryMode: "non_query",
                  }}
                  className="font-medium text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {renderJobDetailTitle(link)}
                </TrackedCareerLink>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
