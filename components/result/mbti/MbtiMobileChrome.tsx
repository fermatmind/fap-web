"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/locales";

type MbtiMobileChromeProps = {
  locale: Locale;
  retakeHref: string;
  primaryCtaLabel?: string;
  primaryCtaHref: string;
  primaryCtaIsInternal?: boolean;
  onShare: () => void | Promise<void>;
};

const NAV_ITEMS: Array<{ anchor: string; en: string; zh: string }> = [
  { anchor: "hero", en: "Hero", zh: "总览" },
  { anchor: "traits", en: "Traits", zh: "核心特征" },
  { anchor: "career", en: "Career", zh: "职业" },
  { anchor: "growth", en: "Growth", zh: "成长" },
  { anchor: "relationships", en: "Relationships", zh: "关系" },
  { anchor: "offer-full", en: "Unlock", zh: "解锁" },
];

function resolvePrimaryCtaLabel(locale: Locale, primaryCtaLabel?: string) {
  return (primaryCtaLabel ?? "").trim() || (locale === "zh" ? "解锁完整报告" : "Unlock full report");
}

export function MbtiMobileChrome({
  locale,
  retakeHref,
  primaryCtaLabel,
  primaryCtaHref,
  primaryCtaIsInternal = false,
  onShare,
}: MbtiMobileChromeProps) {
  const ctaLabel = resolvePrimaryCtaLabel(locale, primaryCtaLabel);

  return (
    <div data-testid="mbti-mobile-chrome" className="xl:hidden">
      <div className="sticky top-16 z-30 -mx-4 border-b border-slate-200 bg-white/92 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
        <details className="rounded-2xl border border-slate-200 bg-white/95 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-900">
            {locale === "zh" ? "查看目录" : "Report navigation"}
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.anchor}
                href={`#${item.anchor}`}
                className="inline-flex min-h-[40px] items-center rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700"
              >
                {item[locale]}
              </a>
            ))}
          </div>
        </details>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/97 p-3 shadow-[0_-12px_30px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2">
          <Button type="button" variant="outline" className="min-h-[44px] flex-1" onClick={() => void onShare()}>
            {locale === "zh" ? "分享" : "Share"}
          </Button>
          <Link
            href={retakeHref}
            className={buttonVariants({ variant: "outline", className: "min-h-[44px] flex-1" })}
          >
            {locale === "zh" ? "重测" : "Retake"}
          </Link>
          {primaryCtaIsInternal ? (
            <Link href={primaryCtaHref} className={buttonVariants({ className: "min-h-[44px] flex-1" })}>
              {ctaLabel}
            </Link>
          ) : (
            <a href={primaryCtaHref} className={buttonVariants({ className: "min-h-[44px] flex-1" })}>
              {ctaLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
