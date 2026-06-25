import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildBig5TakeHref,
  DEFAULT_BIG5_FORM_CODE,
  getBig5StartLabel,
  getBig5VariantLabel,
  getBig5VariantSummary,
  isBig5ScaleCode,
  isBig5Slug,
  listBig5FormMetas,
} from "@/lib/big5/forms";
import {
  buildEnneagramTakeHref,
  DEFAULT_ENNEAGRAM_FORM_CODE,
  getEnneagramStartLabel,
  getEnneagramVariantLabel,
  getEnneagramVariantSummary,
  isEnneagramScaleCode,
  isEnneagramSlug,
  listEnneagramFormMetas,
} from "@/lib/enneagram/forms";
import {
  buildRiasecTakeHref,
  DEFAULT_RIASEC_FORM_CODE,
  getRiasecStartLabel,
  getRiasecVariantLabel,
  getRiasecVariantSummary,
  isRiasecScaleCode,
  isRiasecSlug,
  listRiasecFormMetas,
} from "@/lib/riasec/forms";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import {
  DEFAULT_MBTI_FORM_CODE,
  getMbtiStartLabel,
  getMbtiVariantLabel,
  getMbtiVariantSummary,
  isMbtiScaleCode,
  isMbtiSlug,
  listMbtiFormMetas,
} from "@/lib/mbti/forms";
import { buildMbtiEntryHref, buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";
import {
  appendAttributionParamsToHref,
  type AttributionParams,
  type TrackingAttributionPayload,
} from "@/lib/tracking/attribution";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { getFreeTestStartLabel } from "@/lib/tests/freeTestLabels";

type CTAStickyProps = {
  slug: string;
  title: string;
  questions: number;
  minutes: number;
  scaleCode?: string;
  locale?: Locale;
  primaryCtaLabel?: string | null;
  attributionParams?: AttributionParams;
  attributionPayload?: TrackingAttributionPayload;
};

export function CTASticky({
  slug,
  title,
  questions,
  minutes,
  scaleCode,
  locale = "en",
  primaryCtaLabel,
  attributionParams = {},
  attributionPayload = {},
}: CTAStickyProps) {
  const showsMbtiActions = isMbtiScaleCode(scaleCode) || isMbtiSlug(slug);
  const showsBig5Actions = isBig5ScaleCode(scaleCode) || isBig5Slug(slug);
  const showsEnneagramActions = isEnneagramScaleCode(scaleCode) || isEnneagramSlug(slug);
  const showsRiasecActions = isRiasecScaleCode(scaleCode) || isRiasecSlug(slug);
  const showsEqActions = String(scaleCode ?? "").trim().toUpperCase() === "EQ_60" || slug === SCALE_CANONICAL_SLUG_MAP.EQ_60;
  const mbtiForms = listMbtiFormMetas();
  const mbtiPrimaryForm = mbtiForms.find((form) => form.formCode === DEFAULT_MBTI_FORM_CODE) ?? mbtiForms[0] ?? null;
  const mbtiSecondaryForm = mbtiForms.find((form) => form.formCode !== (mbtiPrimaryForm?.formCode ?? DEFAULT_MBTI_FORM_CODE)) ?? null;
  const mbtiLandingPath = attributionPayload.landing_path ?? localizedPath(`/tests/${slug}`, locale);
  const withAttribution = (href: string) => appendAttributionParamsToHref(href, attributionParams);
  const cmsPrimaryCtaLabel = typeof primaryCtaLabel === "string" ? primaryCtaLabel.trim() : "";
  const getStickyStartLabel = ({
    formCode,
    defaultFormCode,
    fallback,
  }: {
    formCode?: string | null;
    defaultFormCode?: string | null;
    fallback: string;
  }): string => {
    if (cmsPrimaryCtaLabel && formCode && defaultFormCode && formCode === defaultFormCode) {
      return cmsPrimaryCtaLabel;
    }

    return getFreeTestStartLabel({
      locale,
      scaleCode,
      slug,
      title,
      fallback,
    });
  };
  const getPrimaryStickyStartLabel = (fallback: string): string =>
    cmsPrimaryCtaLabel ||
    getFreeTestStartLabel({
      locale,
      scaleCode,
      slug,
      title,
      fallback,
    });
  const buildStartClickTrackingProps = ({
    formCode,
    targetAction,
  }: {
    formCode?: string;
    targetAction: string;
  }): Record<string, string> => ({
    ...attributionPayload,
    slug,
    test_slug: slug,
    ...(formCode ? { form_code: formCode } : {}),
    entry_surface: "test_landing",
    source_page_type: "test_landing",
    target_action: targetAction,
    landing_path: attributionPayload.landing_path ?? mbtiLandingPath,
    locale,
  });
  const mbtiPrimaryHref = mbtiPrimaryForm
    ? buildMbtiEntryHref({
        locale,
        testSlug: slug,
        formCode: mbtiPrimaryForm.formCode,
        entrySurface: "mbti_test_landing",
        sourcePageType: "test_landing",
        targetAction: "start_mbti_test_primary",
        sourcePath: mbtiLandingPath,
        attributionParams,
      })
    : null;
  const mbtiSecondaryHref = mbtiSecondaryForm
    ? buildMbtiEntryHref({
        locale,
        testSlug: slug,
        formCode: mbtiSecondaryForm.formCode,
        entrySurface: "mbti_test_landing",
        sourcePageType: "test_landing",
        targetAction: "start_mbti_test_secondary",
        sourcePath: mbtiLandingPath,
        attributionParams,
      })
    : null;
  const mbtiPrimaryTrackingProps = mbtiPrimaryForm
    ? buildMbtiEntryTrackingPayload({
        locale,
        testSlug: slug,
        formCode: mbtiPrimaryForm.formCode,
        entrySurface: "mbti_test_landing",
        sourcePageType: "test_landing",
        targetAction: "start_mbti_test_primary",
        sourcePath: mbtiLandingPath,
        attributionPayload,
      })
    : null;
  const mbtiSecondaryTrackingProps = mbtiSecondaryForm
    ? buildMbtiEntryTrackingPayload({
        locale,
        testSlug: slug,
        formCode: mbtiSecondaryForm.formCode,
        entrySurface: "mbti_test_landing",
        sourcePageType: "test_landing",
        targetAction: "start_mbti_test_secondary",
        sourcePath: mbtiLandingPath,
        attributionPayload,
      })
    : null;
  const mbtiSummary = listMbtiFormMetas().map((form) => getMbtiVariantLabel(form.formCode, locale)).join(" / ");
  const big5Summary = listBig5FormMetas().map((form) => getBig5VariantLabel(form.formCode, locale)).join(" / ");
  const enneagramSummary = listEnneagramFormMetas().map((form) => getEnneagramVariantLabel(form.formCode, locale)).join(" / ");
  const riasecSummary = listRiasecFormMetas().map((form) => getRiasecVariantLabel(form.formCode, locale)).join(" / ");

  return (
    <>
      <div className="hidden lg:block lg:sticky lg:top-24">
        <Card className="overflow-hidden border-[var(--fm-border-strong)] shadow-[var(--fm-shadow-md)]">
          <CardHeader className="bg-[var(--fm-surface-muted)]">
            <CardTitle className="text-base">{locale === "zh" ? "准备开始？" : "Ready to start?"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {showsMbtiActions ? (
              <div className="space-y-2" data-testid="mbti-sticky-entry-cta-group">
                {mbtiPrimaryForm && mbtiPrimaryHref && mbtiPrimaryTrackingProps ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {getMbtiVariantLabel(mbtiPrimaryForm.formCode, locale)}
                    </p>
                    <p className="m-0 mt-2 text-xs leading-6 text-slate-600">{getMbtiVariantSummary(mbtiPrimaryForm.formCode, locale)}</p>
                    <TrackedEntryCtaLink
                      href={mbtiPrimaryHref}
                      eventProperties={mbtiPrimaryTrackingProps}
                      data-testid="mbti-sticky-primary-cta"
                      className={buttonVariants({ className: "mt-3 w-full" })}
                    >
                      {getStickyStartLabel({
                        formCode: mbtiPrimaryForm.formCode,
                        defaultFormCode: DEFAULT_MBTI_FORM_CODE,
                        fallback: getMbtiStartLabel(mbtiPrimaryForm.formCode, locale),
                      })}
                    </TrackedEntryCtaLink>
                  </div>
                ) : null}
                {mbtiSecondaryForm && mbtiSecondaryHref && mbtiSecondaryTrackingProps ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {getMbtiVariantLabel(mbtiSecondaryForm.formCode, locale)}
                    </p>
                    <p className="m-0 mt-2 text-xs leading-6 text-slate-600">{getMbtiVariantSummary(mbtiSecondaryForm.formCode, locale)}</p>
                    <TrackedEntryCtaLink
                      href={mbtiSecondaryHref}
                      eventProperties={mbtiSecondaryTrackingProps}
                      data-testid="mbti-sticky-secondary-cta"
                      className={buttonVariants({ variant: "outline", className: "mt-3 w-full" })}
                    >
                      {getStickyStartLabel({
                        formCode: mbtiSecondaryForm.formCode,
                        defaultFormCode: DEFAULT_MBTI_FORM_CODE,
                        fallback: getMbtiStartLabel(mbtiSecondaryForm.formCode, locale),
                      })}
                    </TrackedEntryCtaLink>
                  </div>
                ) : null}
              </div>
            ) : showsBig5Actions ? (
              <div className="space-y-2">
                {listBig5FormMetas().map((form) => (
                  <div key={form.formCode} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {getBig5VariantLabel(form.formCode, locale)}
                    </p>
                    <p className="m-0 mt-2 text-xs leading-6 text-slate-600">{getBig5VariantSummary(form.formCode, locale)}</p>
                    <TrackedEntryCtaLink
                      href={withAttribution(buildBig5TakeHref(slug, locale, form.formCode))}
                      eventProperties={buildStartClickTrackingProps({
                        formCode: form.formCode,
                        targetAction: `start_${form.formCode}`,
                      })}
                      className={buttonVariants({ className: "mt-3 w-full" })}
                    >
                      {getStickyStartLabel({
                        formCode: form.formCode,
                        defaultFormCode: DEFAULT_BIG5_FORM_CODE,
                        fallback: getBig5StartLabel(form.formCode, locale),
                      })}
                    </TrackedEntryCtaLink>
                  </div>
                ))}
              </div>
            ) : showsEnneagramActions ? (
              <div className="space-y-2">
                {listEnneagramFormMetas().map((form) => (
                  <div key={form.formCode} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {getEnneagramVariantLabel(form.formCode, locale)}
                    </p>
                    <p className="m-0 mt-2 text-xs leading-6 text-slate-600">{getEnneagramVariantSummary(form.formCode, locale)}</p>
                    <TrackedEntryCtaLink
                      href={buildEnneagramTakeHref(slug, locale, form.formCode)}
                      eventProperties={buildStartClickTrackingProps({
                        formCode: form.formCode,
                        targetAction: `start_${form.formCode}`,
                      })}
                      className={buttonVariants({ className: "mt-3 w-full" })}
                    >
                      {getStickyStartLabel({
                        formCode: form.formCode,
                        defaultFormCode: DEFAULT_ENNEAGRAM_FORM_CODE,
                        fallback: getEnneagramStartLabel(form.formCode, locale),
                      })}
                    </TrackedEntryCtaLink>
                  </div>
                ))}
              </div>
            ) : showsRiasecActions ? (
              <div className="space-y-2">
                {listRiasecFormMetas().map((form) => (
                  <div key={form.formCode} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {getRiasecVariantLabel(form.formCode, locale)}
                    </p>
                    <p className="m-0 mt-2 text-xs leading-6 text-slate-600">{getRiasecVariantSummary(form.formCode, locale)}</p>
                    <TrackedEntryCtaLink
                      href={withAttribution(buildRiasecTakeHref(slug, locale, form.formCode))}
                      eventProperties={buildStartClickTrackingProps({
                        formCode: form.formCode,
                        targetAction: `start_${form.formCode}`,
                      })}
                      data-testid={`riasec-sticky-cta-${form.formCode}`}
                      className={buttonVariants({ className: "mt-3 w-full" })}
                    >
                      {getStickyStartLabel({
                        formCode: form.formCode,
                        defaultFormCode: DEFAULT_RIASEC_FORM_CODE,
                        fallback: getRiasecStartLabel(form.formCode, locale),
                      })}
                    </TrackedEntryCtaLink>
                  </div>
                ))}
              </div>
            ) : showsEqActions ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {locale === "zh" ? "EQ 60Q · 情绪智力档案" : "EQ 60Q · Emotional intelligence profile"}
                </p>
                <p className="m-0 mt-2 text-xs leading-6 text-slate-600">
                  {locale === "zh"
                    ? "约 10 分钟，了解情绪觉察、调节、共情与人际沟通倾向。"
                    : "About 10 minutes to review emotional awareness, regulation, empathy, and communication patterns."}
                </p>
                <TrackedEntryCtaLink
                  href={withAttribution(localizedPath(`/tests/${slug}/take`, locale))}
                  eventProperties={buildStartClickTrackingProps({ targetAction: "start_test" })}
                  data-testid="eq-sticky-cta"
                  className={buttonVariants({ className: "mt-3 w-full" })}
                >
                  {getPrimaryStickyStartLabel(locale === "zh" ? "开始情商免费测试" : "Start the free EQ test")}
                </TrackedEntryCtaLink>
              </div>
            ) : (
              <TrackedEntryCtaLink
                href={withAttribution(localizedPath(`/tests/${slug}/take`, locale))}
                eventProperties={buildStartClickTrackingProps({ targetAction: "start_test" })}
                className={buttonVariants({ className: "w-full" })}
              >
                {getPrimaryStickyStartLabel(locale === "zh" ? "开始此测试" : "Start the free test")}
              </TrackedEntryCtaLink>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/97 p-3 shadow-[0_-10px_24px_rgba(15,23,42,0.1)] backdrop-blur lg:hidden">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="line-clamp-2 text-xs font-medium text-slate-700 sm:flex-1">
            {showsMbtiActions
              ? `${title} · ${mbtiSummary}`
              : showsBig5Actions
              ? `${title} · ${big5Summary}`
              : showsEnneagramActions
              ? `${title} · ${enneagramSummary}`
              : showsRiasecActions
              ? `${title} · ${riasecSummary}`
              : showsEqActions
              ? `${title} · EQ 60Q`
              : `${title} · ${questions}Q · ${minutes}m`}
          </p>
          {showsMbtiActions ? (
            <div className="flex w-full gap-2 sm:w-auto">
              {mbtiPrimaryForm && mbtiPrimaryHref && mbtiPrimaryTrackingProps ? (
                <TrackedEntryCtaLink
                  href={mbtiPrimaryHref}
                  eventProperties={mbtiPrimaryTrackingProps}
                  data-testid="mbti-sticky-mobile-primary-cta"
                  className={buttonVariants({ size: "sm", className: "flex-1 sm:flex-none" })}
                >
                  {getStickyStartLabel({
                    formCode: mbtiPrimaryForm.formCode,
                    defaultFormCode: DEFAULT_MBTI_FORM_CODE,
                    fallback: getMbtiStartLabel(mbtiPrimaryForm.formCode, locale),
                  })}
                </TrackedEntryCtaLink>
              ) : null}
              {mbtiSecondaryForm && mbtiSecondaryHref && mbtiSecondaryTrackingProps ? (
                <TrackedEntryCtaLink
                  href={mbtiSecondaryHref}
                  eventProperties={mbtiSecondaryTrackingProps}
                  data-testid="mbti-sticky-mobile-secondary-cta"
                  className={buttonVariants({ size: "sm", variant: "outline", className: "sm:flex-none" })}
                >
                  {getStickyStartLabel({
                    formCode: mbtiSecondaryForm.formCode,
                    defaultFormCode: DEFAULT_MBTI_FORM_CODE,
                    fallback: getMbtiStartLabel(mbtiSecondaryForm.formCode, locale),
                  })}
                </TrackedEntryCtaLink>
              ) : null}
            </div>
          ) : showsBig5Actions ? (
            <div className="flex w-full gap-2 sm:w-auto">
              {listBig5FormMetas().map((form) => (
                <TrackedEntryCtaLink
                  key={form.formCode}
                  href={withAttribution(buildBig5TakeHref(slug, locale, form.formCode))}
                  eventProperties={buildStartClickTrackingProps({
                    formCode: form.formCode,
                    targetAction: `start_${form.formCode}`,
                  })}
                  className={buttonVariants({ size: "sm", className: "flex-1 sm:flex-none" })}
                >
                  {getStickyStartLabel({
                    formCode: form.formCode,
                    defaultFormCode: DEFAULT_BIG5_FORM_CODE,
                    fallback: getBig5StartLabel(form.formCode, locale),
                  })}
                </TrackedEntryCtaLink>
              ))}
            </div>
          ) : showsEnneagramActions ? (
            <div className="flex w-full gap-2 sm:w-auto">
              {listEnneagramFormMetas().map((form) => (
                <TrackedEntryCtaLink
                  key={form.formCode}
                  href={buildEnneagramTakeHref(slug, locale, form.formCode)}
                  eventProperties={buildStartClickTrackingProps({
                    formCode: form.formCode,
                    targetAction: `start_${form.formCode}`,
                  })}
                  className={buttonVariants({ size: "sm", className: "flex-1 sm:flex-none" })}
                >
                  {getStickyStartLabel({
                    formCode: form.formCode,
                    defaultFormCode: DEFAULT_ENNEAGRAM_FORM_CODE,
                    fallback: getEnneagramStartLabel(form.formCode, locale),
                  })}
                </TrackedEntryCtaLink>
              ))}
            </div>
          ) : showsRiasecActions ? (
            <div className="flex w-full gap-2 sm:w-auto">
              {listRiasecFormMetas().map((form) => (
                <TrackedEntryCtaLink
                  key={form.formCode}
                  href={withAttribution(buildRiasecTakeHref(slug, locale, form.formCode))}
                  eventProperties={buildStartClickTrackingProps({
                    formCode: form.formCode,
                    targetAction: `start_${form.formCode}`,
                  })}
                  data-testid={`riasec-sticky-mobile-cta-${form.formCode}`}
                  className={buttonVariants({ size: "sm", className: "flex-1 sm:flex-none" })}
                >
                  {getStickyStartLabel({
                    formCode: form.formCode,
                    defaultFormCode: DEFAULT_RIASEC_FORM_CODE,
                    fallback: getRiasecStartLabel(form.formCode, locale),
                  })}
                </TrackedEntryCtaLink>
              ))}
            </div>
          ) : showsEqActions ? (
            <TrackedEntryCtaLink
              href={withAttribution(localizedPath(`/tests/${slug}/take`, locale))}
              eventProperties={buildStartClickTrackingProps({ targetAction: "start_test" })}
              data-testid="eq-sticky-mobile-cta"
              className={buttonVariants({ size: "sm", className: "w-full sm:w-auto" })}
            >
              {getPrimaryStickyStartLabel(locale === "zh" ? "开始情商免费测试" : "Start the free EQ test")}
            </TrackedEntryCtaLink>
          ) : (
            <TrackedEntryCtaLink
              href={withAttribution(localizedPath(`/tests/${slug}/take`, locale))}
              eventProperties={buildStartClickTrackingProps({ targetAction: "start_test" })}
              className={buttonVariants({ size: "sm" })}
            >
              {getPrimaryStickyStartLabel(locale === "zh" ? "开始" : "Start")}
            </TrackedEntryCtaLink>
          )}
        </div>
      </div>
    </>
  );
}
