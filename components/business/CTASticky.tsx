import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildBig5TakeHref,
  getBig5StartLabel,
  getBig5VariantLabel,
  getBig5VariantSummary,
  isBig5ScaleCode,
  isBig5Slug,
  listBig5FormMetas,
} from "@/lib/big5/forms";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import {
  buildMbtiTakeHref,
  getMbtiStartLabel,
  getMbtiVariantLabel,
  getMbtiVariantSummary,
  isMbtiScaleCode,
  isMbtiSlug,
  listMbtiFormMetas,
} from "@/lib/mbti/forms";

type CTAStickyProps = {
  slug: string;
  title: string;
  questions: number;
  minutes: number;
  scaleCode?: string;
  locale?: Locale;
};

export function CTASticky({ slug, title, questions, minutes, scaleCode, locale = "en" }: CTAStickyProps) {
  const showsMbtiActions = isMbtiScaleCode(scaleCode) || isMbtiSlug(slug);
  const showsBig5Actions = isBig5ScaleCode(scaleCode) || isBig5Slug(slug);
  const mbtiSummary = listMbtiFormMetas().map((form) => getMbtiVariantLabel(form.formCode, locale)).join(" / ");
  const big5Summary = listBig5FormMetas().map((form) => getBig5VariantLabel(form.formCode, locale)).join(" / ");

  return (
    <>
      <div className="hidden lg:block lg:sticky lg:top-24">
        <Card className="overflow-hidden border-[var(--fm-border-strong)] shadow-[var(--fm-shadow-md)]">
          <CardHeader className="bg-[var(--fm-surface-muted)]">
            <CardTitle className="text-base">{locale === "zh" ? "准备开始？" : "Ready to start?"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-6 text-slate-600">
              {title}
              <br />
              {showsMbtiActions
                ? mbtiSummary
                : showsBig5Actions
                ? big5Summary
                : `${questions} ${locale === "zh" ? "题" : "questions"} · ${locale === "zh" ? `约 ${minutes} 分钟` : `about ${minutes} minutes`}.`}
            </p>
            {showsMbtiActions ? (
              <div className="space-y-2">
                {listMbtiFormMetas().map((form) => (
                  <div key={form.formCode} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {getMbtiVariantLabel(form.formCode, locale)}
                    </p>
                    <p className="m-0 mt-2 text-xs leading-6 text-slate-600">{getMbtiVariantSummary(form.formCode, locale)}</p>
                    <Link
                      href={buildMbtiTakeHref(slug, locale, form.formCode)}
                      className={buttonVariants({ className: "mt-3 w-full" })}
                    >
                      {getMbtiStartLabel(form.formCode, locale)}
                    </Link>
                  </div>
                ))}
              </div>
            ) : showsBig5Actions ? (
              <div className="space-y-2">
                {listBig5FormMetas().map((form) => (
                  <div key={form.formCode} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {getBig5VariantLabel(form.formCode, locale)}
                    </p>
                    <p className="m-0 mt-2 text-xs leading-6 text-slate-600">{getBig5VariantSummary(form.formCode, locale)}</p>
                    <Link
                      href={buildBig5TakeHref(slug, locale, form.formCode)}
                      className={buttonVariants({ className: "mt-3 w-full" })}
                    >
                      {getBig5StartLabel(form.formCode, locale)}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <Link href={localizedPath(`/tests/${slug}/take`, locale)} className={buttonVariants({ className: "w-full" })}>
                {locale === "zh" ? "开始此测试" : "Start this test"}
              </Link>
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
              : `${title} · ${questions}Q · ${minutes}m`}
          </p>
          {showsMbtiActions ? (
            <div className="flex w-full gap-2 sm:w-auto">
              {listMbtiFormMetas().map((form) => (
                <Link
                  key={form.formCode}
                  href={buildMbtiTakeHref(slug, locale, form.formCode)}
                  className={buttonVariants({ size: "sm", className: "flex-1 sm:flex-none" })}
                >
                  {getMbtiStartLabel(form.formCode, locale)}
                </Link>
              ))}
            </div>
          ) : showsBig5Actions ? (
            <div className="flex w-full gap-2 sm:w-auto">
              {listBig5FormMetas().map((form) => (
                <Link
                  key={form.formCode}
                  href={buildBig5TakeHref(slug, locale, form.formCode)}
                  className={buttonVariants({ size: "sm", className: "flex-1 sm:flex-none" })}
                >
                  {getBig5StartLabel(form.formCode, locale)}
                </Link>
              ))}
            </div>
          ) : (
            <Link href={localizedPath(`/tests/${slug}/take`, locale)} className={buttonVariants({ size: "sm" })}>
              {locale === "zh" ? "开始" : "Start"}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
