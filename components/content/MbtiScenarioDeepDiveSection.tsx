import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { DEFAULT_MBTI_FORM_CODE } from "@/lib/mbti/forms";
import {
  buildMbtiEntryHref,
  buildMbtiEntryTrackingPayload,
  type MbtiEntrySourcePageType,
} from "@/lib/mbti/entryTracking";
import type { MbtiSceneDeepModule } from "@/lib/mbti/sceneDeepContent";
import type { Locale } from "@/lib/i18n/locales";
import { normalizeInternalHref } from "@/lib/url/safeContentUrls";

type MbtiScenarioDeepDiveSectionProps = {
  locale: Locale;
  modules: MbtiSceneDeepModule[];
  sourcePageType: MbtiEntrySourcePageType;
  sourcePath: string;
  testId?: string;
  heading?: string;
  subtitle?: string;
};

export function MbtiScenarioDeepDiveSection({
  locale,
  modules,
  sourcePageType,
  sourcePath,
  testId = "mbti-scene-deep-dive",
  heading,
  subtitle,
}: MbtiScenarioDeepDiveSectionProps) {
  if (!Array.isArray(modules) || modules.length === 0) {
    return null;
  }

  const sectionHeading = heading ?? (locale === "zh" ? "场景深化模块" : "Scenario deep-dive modules");
  const sectionSubtitle =
    subtitle ??
    (locale === "zh"
      ? "把场景入口升级成可索引、可解释、可执行下一步的中层内容，并保持主 CTA 清晰。"
      : "Upgrade scene entry cards into indexable, interpretable, and actionable mid-layer content while keeping the primary CTA clear.");

  return (
    <section
      className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={testId}
    >
      <div className="space-y-2">
        <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">{sectionHeading}</h2>
        {sectionSubtitle ? <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{sectionSubtitle}</p> : null}
      </div>

      <div className="grid gap-3">
        {modules.map((module) => (
          <article
            key={module.sceneKey}
            className="space-y-3 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
            data-testid={`${testId}-${module.sceneKey}`}
          >
            <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">{module.title}</h3>
            <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{module.summary}</p>
            <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">
              <span className="font-medium text-[var(--fm-text)]">
                {locale === "zh" ? "为什么这和该类型有关：" : "Why this is type-relevant:"}
              </span>{" "}
              {module.whyTypeRelevant}
            </p>
            <div className="flex flex-wrap gap-2">
              {module.links.map((link) => {
                const targetAction =
                  link.targetAction ||
                  (link.kind === "start_test"
                    ? `start_mbti_test_scene_${module.sceneKey}`
                    : `open_scene_deep_${module.sceneKey}_${link.key}`);
                let trackedHref: string;

                if (link.kind === "start_test") {
                  trackedHref = buildMbtiEntryHref({
                    locale,
                    formCode: DEFAULT_MBTI_FORM_CODE,
                    entrySurface: "mbti_scene_block",
                    sourcePageType,
                    targetAction,
                    sourcePath,
                  });
                } else {
                  const safeLinkHref = normalizeInternalHref(link.href);
                  if (!safeLinkHref) {
                    return null;
                  }
                  trackedHref = safeLinkHref;
                }

                return (
                  <TrackedEntryCtaLink
                    key={link.key}
                    href={trackedHref}
                    prefetch
                    className="fm-help-chip-link"
                    data-testid={`${testId}-${module.sceneKey}-${link.key}`}
                    eventProperties={buildMbtiEntryTrackingPayload({
                      locale,
                      formCode: DEFAULT_MBTI_FORM_CODE,
                      entrySurface: "mbti_scene_block",
                      sourcePageType,
                      targetAction,
                      sourcePath,
                    })}
                  >
                    {link.label}
                  </TrackedEntryCtaLink>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
