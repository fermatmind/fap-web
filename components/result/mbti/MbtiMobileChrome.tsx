"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/locales";

type MbtiMobileChromeProps = {
  locale: Locale;
  retakeHref: string;
  primaryCtaLabel?: string;
  primaryCtaHref: string;
  primaryCtaIsInternal?: boolean;
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
}: MbtiMobileChromeProps) {
  const ctaLabel = resolvePrimaryCtaLabel(locale, primaryCtaLabel);
  const [activeAnchor, setActiveAnchor] = useState("hero");

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.anchor);
    const updateAnchor = () => {
      let next = sectionIds[0];
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;
        const top = element.getBoundingClientRect().top;
        if (top <= 160) {
          next = id;
        }
      }
      setActiveAnchor(window.location.hash.replace("#", "") || next);
    };

    updateAnchor();
    window.addEventListener("scroll", updateAnchor, { passive: true });
    window.addEventListener("hashchange", updateAnchor);

    return () => {
      window.removeEventListener("scroll", updateAnchor);
      window.removeEventListener("hashchange", updateAnchor);
    };
  }, []);

  return (
    <div data-testid="mbti-mobile-chrome" className="xl:hidden">
      <div className="sticky top-16 z-30 -mx-4 border-b border-slate-200 bg-white/92 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)] backdrop-blur md:-mx-6 md:px-6">
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={`quick-${item.anchor}`}
              href={`#${item.anchor}`}
              aria-current={activeAnchor === item.anchor ? "location" : undefined}
              className={`inline-flex min-h-[38px] shrink-0 items-center rounded-full border px-3 text-sm font-medium transition motion-reduce:transition-none ${
                activeAnchor === item.anchor
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {item[locale]}
            </a>
          ))}
        </div>
        <details className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
          <summary className="cursor-pointer text-sm font-semibold text-slate-900">
            {locale === "zh" ? "阅读目录与动作" : "Report navigation and actions"}
          </summary>
          <p className="mb-0 mt-2 text-xs leading-6 text-slate-500">
            {locale === "zh"
              ? "目录负责定位章节，底部动作栏负责分享、重测与解锁。"
              : "Use the directory for orientation and the bottom bar for actions."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.anchor}
                href={`#${item.anchor}`}
                aria-current={activeAnchor === item.anchor ? "location" : undefined}
                className={`inline-flex min-h-[40px] items-center rounded-full border px-4 text-sm font-medium transition motion-reduce:transition-none ${
                  activeAnchor === item.anchor
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {item[locale]}
              </a>
            ))}
          </div>
        </details>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl rounded-[20px] border border-white/20 bg-black/80 p-2 shadow-[0_-16px_36px_rgba(15,23,42,0.12)] backdrop-blur">
          {primaryCtaIsInternal ? (
            <Link
              href={primaryCtaHref}
              className={buttonVariants({
                className:
                  "min-h-[46px] w-full bg-white text-slate-950 transition duration-200 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-emerald-300",
              })}
            >
              {ctaLabel}
            </Link>
          ) : (
            <a
              href={primaryCtaHref}
              className={buttonVariants({
                className:
                  "min-h-[46px] w-full bg-white text-slate-950 transition duration-200 motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-emerald-300",
              })}
            >
              {ctaLabel}
            </a>
          )}
          {activeAnchor === "offer-full" ? (
            <p className="m-0 mt-2 text-center text-xs text-white/80">
              {locale === "zh" ? "已定位到解锁区" : "Unlock section in view"}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
