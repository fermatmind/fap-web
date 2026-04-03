import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import { buildMbtiTakeHref, getMbtiStartLabel, isMbtiScaleCode, isMbtiSlug, listMbtiFormMetas } from "@/lib/mbti/forms";

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
  const mbtiSummary = listMbtiFormMetas()
    .map((form) => (locale === "zh"
      ? `${form.questionCount}题 · 约 ${form.estimatedMinutes} 分钟`
      : `${form.questionCount} questions · about ${form.estimatedMinutes} minutes`))
    .join(locale === "zh" ? " / " : " / ");

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
                : `${questions} ${locale === "zh" ? "题" : "questions"} · ${locale === "zh" ? `约 ${minutes} 分钟` : `about ${minutes} minutes`}.`}
            </p>
            {showsMbtiActions ? (
              <div className="space-y-2">
                {listMbtiFormMetas().map((form) => (
                  <Link
                    key={form.formCode}
                    href={buildMbtiTakeHref(slug, locale, form.formCode)}
                    className={buttonVariants({ className: "w-full" })}
                  >
                    {getMbtiStartLabel(form.formCode, locale)}
                  </Link>
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
            {showsMbtiActions ? `${title} · ${mbtiSummary}` : `${title} · ${questions}Q · ${minutes}m`}
          </p>
          {showsMbtiActions ? (
            <div className="flex w-full gap-2 sm:w-auto">
              {listMbtiFormMetas().map((form) => (
                <Link
                  key={form.formCode}
                  href={buildMbtiTakeHref(slug, locale, form.formCode)}
                  className={buttonVariants({ size: "sm", className: "flex-1 sm:flex-none" })}
                >
                  {locale === "zh" ? `${form.questionCount}题开始` : `${form.questionCount}Q`}
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
