"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/locales";
import type { RichResultHeadline } from "@/components/result/RichResultReport";

type MbtiStickyRailProps = {
  locale: Locale;
  headline: RichResultHeadline;
  tags: string[];
  locked?: boolean;
  accessLevel?: string;
  variant?: string;
  modulesAllowed?: string[];
  retakeHref: string;
  primaryCtaLabel?: string;
  primaryCtaHref: string;
  primaryCtaIsInternal?: boolean;
  onShare: () => void | Promise<void>;
};

const NAV_ITEMS: Array<{ anchor: string; en: string; zh: string }> = [
  { anchor: "hero", en: "Hero", zh: "总览" },
  { anchor: "dimensions", en: "Dimensions", zh: "维度" },
  { anchor: "dominant-traits", en: "Dominant traits", zh: "主导特质" },
  { anchor: "highlights", en: "Highlights", zh: "亮点" },
  { anchor: "career", en: "Career", zh: "职业" },
  { anchor: "growth", en: "Growth", zh: "成长" },
  { anchor: "overview", en: "Overview", zh: "概览" },
  { anchor: "relationships", en: "Relationships", zh: "关系" },
  { anchor: "offers", en: "Offers", zh: "方案" },
];

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function resolveUnlockSummary(locale: Locale, locked?: boolean, accessLevel?: string, variant?: string, modulesAllowed: string[] = []) {
  const isFreePreview = locked === true || normalizeText(accessLevel).toLowerCase() === "free" || normalizeText(variant).toLowerCase() === "free";
  const title = isFreePreview
    ? locale === "zh"
      ? "当前为免费预览"
      : "Currently on free preview"
    : locale === "zh"
      ? "当前为完整访问"
      : "Currently on full access";
  const description = modulesAllowed.length > 0
    ? locale === "zh"
      ? `已开放模块：${modulesAllowed.join("、")}`
      : `Open modules: ${modulesAllowed.join(", ")}`
    : locale === "zh"
      ? "当前以章节骨架阅读为主，解锁方案集中在下方方案区。"
      : "This view stays focused on the reading shell, with unlock options grouped below.";

  return { title, description };
}

function resolvePrimaryCtaLabel(locale: Locale, primaryCtaLabel?: string) {
  return normalizeText(primaryCtaLabel) || (locale === "zh" ? "解锁完整报告" : "Unlock full report");
}

export function MbtiStickyRail({
  locale,
  headline,
  tags,
  locked,
  accessLevel,
  variant,
  modulesAllowed,
  retakeHref,
  primaryCtaLabel,
  primaryCtaHref,
  primaryCtaIsInternal = false,
  onShare,
}: MbtiStickyRailProps) {
  const unlockSummary = resolveUnlockSummary(locale, locked, accessLevel, variant, modulesAllowed);
  const ctaLabel = resolvePrimaryCtaLabel(locale, primaryCtaLabel);

  return (
    <aside data-testid="mbti-sticky-rail" className="hidden xl:block xl:sticky xl:top-24">
      <div className="space-y-4">
        <Card className="border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
          <CardHeader className="space-y-2 pb-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
              {locale === "zh" ? "人格摘要" : "Personality summary"}
            </p>
            <CardTitle className="text-xl text-slate-950">
              {headline.typeCode}
              {headline.displayName ? <span className="text-slate-600"> · {headline.displayName}</span> : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {headline.supportingLine ? <p className="m-0 text-sm leading-7 text-slate-600">{headline.supportingLine}</p> : null}
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">{locale === "zh" ? "章节导航" : "Chapter navigation"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.anchor}
                href={`#${item.anchor}`}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                {item[locale]}
              </a>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">{locale === "zh" ? "当前状态" : "Current status"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="m-0 text-sm font-semibold text-slate-900">{unlockSummary.title}</p>
            <p className="m-0 text-sm leading-7 text-slate-600">{unlockSummary.description}</p>
            {primaryCtaIsInternal ? (
              <Link href={primaryCtaHref} className={buttonVariants({ className: "w-full" })}>
                {ctaLabel}
              </Link>
            ) : (
              <a href={primaryCtaHref} className={buttonVariants({ className: "w-full" })}>
                {ctaLabel}
              </a>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => void onShare()}>
                {locale === "zh" ? "分享" : "Share"}
              </Button>
              <Link href={retakeHref} className={buttonVariants({ variant: "outline", className: "flex-1" })}>
                {locale === "zh" ? "重测" : "Retake"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
