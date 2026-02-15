import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

type CTAStickyProps = {
  slug: string;
  title: string;
  questions: number;
  minutes: number;
  locale?: Locale;
};

export function CTASticky({ slug, title, questions, minutes, locale = "en" }: CTAStickyProps) {
  return (
    <>
      <div className="hidden lg:block lg:sticky lg:top-24">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{locale === "zh" ? "准备开始？" : "Ready to start?"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600">
              {title}
              <br />
              {questions} {locale === "zh" ? "题" : "questions"} · {locale === "zh" ? `约 ${minutes} 分钟` : `about ${minutes} minutes`}.
            </p>
            <Link href={localizedPath(`/tests/${slug}/take`, locale)} className={buttonVariants({ className: "w-full" })}>
              {locale === "zh" ? "开始此测试" : "Start this test"}
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-3">
          <p className="line-clamp-2 text-xs font-medium text-slate-700">
            {title} · {questions}Q · {minutes}m
          </p>
          <Link href={localizedPath(`/tests/${slug}/take`, locale)} className={buttonVariants({ size: "sm" })}>
            {locale === "zh" ? "开始" : "Start"}
          </Link>
        </div>
      </div>
    </>
  );
}
