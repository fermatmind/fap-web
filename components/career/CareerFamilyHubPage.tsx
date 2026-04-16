import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { TrustStrip } from "@/components/career/TrustStrip";
import { WarningBanner } from "@/components/career/WarningBanner";
import { ConfidenceBoundary } from "@/components/career/v1/ConfidenceBoundary";
import { EvidenceDrawer } from "@/components/career/v1/EvidenceDrawer";
import { NextStepRail } from "@/components/career/v1/NextStepRail";
import { CAREER_TRACKING_EVENTS } from "@/lib/career/attribution";
import type { CareerFamilyHubAdapter } from "@/lib/career/adapters/types";
import { buildCareerFamilyFrontendUrl } from "@/lib/career/urls";
import { getCareerV1RendererCopy } from "@/lib/career/ui/stateCopy";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

type CareerFamilyHubPageProps = {
  locale: Locale;
  hub: CareerFamilyHubAdapter;
};

type CareerRendererContractState = "blocked" | "provisional" | "restricted";

function deriveFamilyRendererState(hub: CareerFamilyHubAdapter): CareerRendererContractState {
  const normalizedIndexState = String(hub.seoContract.indexState ?? "").trim().toLowerCase();
  if (hub.seoContract.indexEligible === false || normalizedIndexState === "blocked" || normalizedIndexState === "noindex") {
    return "blocked";
  }

  if (hub.counts.visibleChildrenCount === 0) {
    return "provisional";
  }

  return "restricted";
}

function deriveFamilyWarningModel(hub: CareerFamilyHubAdapter) {
  return {
    redFlags: hub.counts.blockedNotSafelyRemediableCount > 0 ? [`blocked_not_safely_remediable:${hub.counts.blockedNotSafelyRemediableCount}`] : [],
    amberFlags: hub.counts.blockedOverrideEligibleCount > 0 ? [`blocked_override_eligible:${hub.counts.blockedOverrideEligibleCount}`] : [],
    blockedClaims: [],
  };
}

export function CareerFamilyHubPage({ locale, hub }: CareerFamilyHubPageProps) {
  const hasVisibleChildren = hub.visibleChildren.length > 0;
  const landingPath = buildCareerFamilyFrontendUrl(locale, hub.family.canonicalSlug);
  const rendererState = deriveFamilyRendererState(hub);
  const warnings = deriveFamilyWarningModel(hub);
  const rendererCopy = getCareerV1RendererCopy(rendererState);

  return (
    <section className="space-y-12" data-testid="career-family-hub">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
            {locale === "zh" ? "职业家族" : "Career family"}
          </p>
          <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{hub.family.title}</h1>
          <p className="m-0 max-w-3xl text-base leading-8 text-slate-600">
            {locale === "zh"
              ? "这是一个探索入口，用来先看方向，再进入已放行的具体职业。"
              : "Use this as an exploration hub: start with the direction, then open public-ready roles."}
          </p>
          {rendererCopy ? (
            <ConfidenceBoundary tone={rendererCopy.tone} title={rendererCopy.label} description={rendererCopy.description} />
          ) : null}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            {locale === "zh" ? "可查看职业" : "Visible roles"}
          </p>
          <p className="m-0 mt-3 text-4xl font-semibold tracking-tight text-slate-950">{hub.counts.visibleChildrenCount}</p>
          <p className="m-0 mt-2 text-sm leading-6 text-slate-500">
            {locale === "zh" ? "只列出当前允许公开展示的职业。" : "Only roles currently allowed for public display are listed."}
          </p>
        </div>
      </header>

      <section className="space-y-4" data-testid="career-family-hub-visible-children">
        <div className="space-y-1">
          <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
            {locale === "zh" ? "可以继续看的职业" : "Roles you can open from here"}
          </h2>
          <p className="m-0 text-sm leading-6 text-slate-500">
            {locale === "zh" ? "未放行的成员不会被本地补写成职业页。" : "Members that are not public-ready are not synthesized into role pages."}
          </p>
        </div>
        {hasVisibleChildren ? (
          <div className="grid gap-4 md:grid-cols-2">
            {hub.visibleChildren.map((child) => (
              <article key={child.canonicalSlug} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="career-family-hub-visible-child">
                <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{child.canonicalSlug}</p>
                <TrackedCareerLink
                  href={child.href}
                  eventName={CAREER_TRACKING_EVENTS.familyHubChildClick}
                  eventPayload={{
                    locale,
                    entrySurface: "career_family_hub",
                    sourcePageType: "career_family_hub",
                    targetAction: "open_family_hub_child",
                    landingPath,
                    routeFamily: "family_hub",
                    subjectKind: "job_slug",
                    subjectKey: child.canonicalSlug,
                    queryMode: "non_query",
                  }}
                  className="mt-3 inline-flex text-lg font-semibold tracking-tight text-slate-950 hover:text-orange-600"
                >
                  {child.title}
                </TrackedCareerLink>
                <p className="m-0 mt-3 text-sm leading-6 text-slate-500">
                  {locale === "zh" ? "打开职业页查看概览、边界和下一步。" : "Open the role profile for overview, boundaries, and next steps."}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm leading-6 text-slate-500" data-testid="career-family-hub-empty-state">
            {locale === "zh" ? "该职业家族当前没有可公开显示的职业。请先返回职业库或选择其他家族。" : "This family currently has no public-ready roles. Return to the job library or choose another family."}
          </div>
        )}
      </section>

      <NextStepRail
        title={locale === "zh" ? "下一步" : "Next steps"}
        items={[
          {
            title: locale === "zh" ? "返回职业库" : "Back to job library",
            description: locale === "zh" ? "搜索具体职业。" : "Search for a specific role.",
            href: localizedPath("/career/jobs", locale),
          },
          {
            title: locale === "zh" ? "回到职业入口" : "Back to career home",
            description: locale === "zh" ? "重新选择探索方式。" : "Choose another exploration mode.",
            href: localizedPath("/career", locale),
          },
        ]}
      />

      <section className="space-y-3" data-testid="career-family-v1-evidence">
        <EvidenceDrawer title={locale === "zh" ? "查看方法边界" : "View method boundary"} testId="career-family-v1-boundary-drawer">
          <div data-testid="career-family-renderer-status" data-renderer-state={rendererState}>
            {rendererCopy ? <ConfidenceBoundary tone={rendererCopy.tone} title={rendererCopy.label} description={rendererCopy.description} /> : null}
          </div>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-4" data-testid="career-family-hub-counts">
            <p className="m-0">Visible: {hub.counts.visibleChildrenCount}</p>
            <p className="m-0">Publish ready: {hub.counts.publishReadyCount}</p>
            <p className="m-0">Blocked total: {hub.counts.blockedTotal}</p>
            <p className="m-0">Blocked hard: {hub.counts.blockedNotSafelyRemediableCount}</p>
          </div>
        </EvidenceDrawer>
        <EvidenceDrawer title={locale === "zh" ? "查看来源与限制" : "View source and limits"} testId="career-family-v1-source-drawer">
          <WarningBanner locale={locale} warnings={warnings} title={locale === "zh" ? "限制说明" : "Boundary notes"} testId="career-family-warning-banner" />
          <TrustStrip locale={locale} reviewerStatus={null} indexState={hub.seoContract.indexState} reasonCodes={[]} compact testId="career-family-trust-strip" />
        </EvidenceDrawer>
      </section>
    </section>
  );
}
