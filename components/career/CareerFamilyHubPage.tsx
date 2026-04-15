import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { TrustStrip } from "@/components/career/TrustStrip";
import { WarningBanner } from "@/components/career/WarningBanner";
import { CAREER_TRACKING_EVENTS } from "@/lib/career/attribution";
import type { CareerFamilyHubAdapter } from "@/lib/career/adapters/types";
import { buildCareerFamilyFrontendUrl } from "@/lib/career/urls";
import type { Locale } from "@/lib/i18n/locales";

type CareerFamilyHubPageProps = {
  locale: Locale;
  hub: CareerFamilyHubAdapter;
};

function CountPill({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] px-4 py-3">
      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">{label}</p>
      <p className="m-0 mt-2 text-2xl font-semibold text-[var(--fm-text)]">{value}</p>
    </div>
  );
}

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
    redFlags:
      hub.counts.blockedNotSafelyRemediableCount > 0
        ? [`blocked_not_safely_remediable:${hub.counts.blockedNotSafelyRemediableCount}`]
        : [],
    amberFlags:
      hub.counts.blockedOverrideEligibleCount > 0
        ? [`blocked_override_eligible:${hub.counts.blockedOverrideEligibleCount}`]
        : [],
    blockedClaims: [],
  };
}

export function CareerFamilyHubPage({
  locale,
  hub,
}: CareerFamilyHubPageProps) {
  const hasVisibleChildren = hub.visibleChildren.length > 0;
  const landingPath = buildCareerFamilyFrontendUrl(locale, hub.family.canonicalSlug);
  const rendererState = deriveFamilyRendererState(hub);
  const warnings = deriveFamilyWarningModel(hub);

  return (
    <section className="space-y-6" data-testid="career-family-hub">
      <header className="space-y-2 rounded-3xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "Career family" : "Career family"}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{hub.family.title}</h1>
        <p className="m-0 font-mono text-xs text-[var(--fm-text-muted)]">{hub.family.canonicalSlug}</p>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "当前页面只消费 backend authority family bundle，不补写 family narrative，也不做 explorer 推断。"
            : "This page consumes the backend family authority bundle directly and does not synthesize family narrative or explorer behavior."}
        </p>
      </header>

      <section
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
        data-testid="career-family-renderer-status"
        data-renderer-state={rendererState}
      >
        <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
          {rendererState === "blocked"
            ? locale === "zh"
              ? "Renderer 状态：Blocked"
              : "Renderer state: Blocked"
            : rendererState === "provisional"
              ? locale === "zh"
                ? "Renderer 状态：Provisional"
                : "Renderer state: Provisional"
              : locale === "zh"
                ? "Renderer 状态：Restricted"
                : "Renderer state: Restricted"}
        </h2>
        <p className="m-0 mt-2 text-sm text-[var(--fm-text-muted)]">
          {rendererState === "blocked"
            ? locale === "zh"
              ? "当前 family hub 仅保留 identity 与计数边界。"
              : "This family hub currently keeps identity and count boundaries only."
            : rendererState === "provisional"
              ? locale === "zh"
                ? "当前 family hub 处于 provisional 渲染，先保留探索层与后续路径。"
                : "This family hub is in provisional rendering mode and keeps the exploration layer with next-step pathways."
              : locale === "zh"
                ? "当前 family hub 可探索，但部分成员仍受限。"
                : "This family hub is explorable, while part of member exposure remains restricted."}
        </p>
      </section>

      <section
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
        data-testid="career-family-hub-counts"
      >
        <CountPill
          label={locale === "zh" ? "Visible children" : "Visible children"}
          value={hub.counts.visibleChildrenCount}
        />
        <CountPill
          label={locale === "zh" ? "Publish ready" : "Publish ready"}
          value={hub.counts.publishReadyCount}
        />
        <CountPill
          label={locale === "zh" ? "Blocked total" : "Blocked total"}
          value={hub.counts.blockedTotal}
        />
        <CountPill
          label={locale === "zh" ? "Blocked override" : "Blocked override"}
          value={hub.counts.blockedOverrideEligibleCount}
        />
        <CountPill
          label={locale === "zh" ? "Blocked hard" : "Blocked hard"}
          value={hub.counts.blockedNotSafelyRemediableCount}
        />
      </section>

      <section
        className="space-y-3 rounded-3xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)]"
        data-testid="career-family-hub-visible-children"
      >
        <div className="space-y-1">
          <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "Visible roles" : "Visible roles"}
          </h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? "这里只列出 backend 已放行的 publish-ready children。blocked children 仅保留在计数中。"
              : "Only backend-authorized publish-ready children are listed here. Blocked children remain counts-only."}
          </p>
        </div>

        {hasVisibleChildren ? (
          <div className="space-y-3">
            {hub.visibleChildren.map((child) => (
              <article
                key={child.canonicalSlug}
                className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
                data-testid="career-family-hub-visible-child"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="m-0 font-mono text-[11px] text-[var(--fm-text-muted)]">{child.canonicalSlug}</p>
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
                      className="text-lg font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                    >
                      {child.title}
                    </TrackedCareerLink>
                  </div>
                  <div className="text-right text-xs text-[var(--fm-text-muted)]">
                    <p className="m-0">reviewer_status: {child.trustSummary.reviewerStatus ?? "unknown"}</p>
                    <p className="m-0">index_state: {child.seoContract.indexState ?? "unknown"}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div
            className="rounded-2xl border border-dashed border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-5 text-sm text-[var(--fm-text-muted)]"
            data-testid="career-family-hub-empty-state"
          >
            {locale === "zh"
              ? "该 family 当前没有可公开显示的 publish-ready children。页面保留 authority identity 与 counts，不做本地补位。"
              : "This family currently has no public publish-ready children. The page preserves the authority identity and counts without local fallback content."}
          </div>
        )}
      </section>

      <WarningBanner
        locale={locale}
        warnings={warnings}
        title={locale === "zh" ? "显式警告与限制" : "Explicit warnings and limits"}
        testId="career-family-warning-banner"
      />

      <TrustStrip
        locale={locale}
        reviewerStatus={null}
        indexState={hub.seoContract.indexState}
        reasonCodes={[]}
        compact
        testId="career-family-trust-strip"
      />
    </section>
  );
}
