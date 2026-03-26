"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  historyHref?: string;
  retakeHref: string;
  primaryCtaLabel?: string;
  primaryCtaHref: string;
  primaryCtaIsInternal?: boolean;
  onShare: () => void | Promise<void>;
};

const NAV_ITEMS: Array<{ anchor: string; en: string; zh: string }> = [
  { anchor: "hero", en: "Hero", zh: "总览" },
  { anchor: "intro", en: "Intro", zh: "简介" },
  { anchor: "traits", en: "Traits", zh: "核心特征" },
  { anchor: "career", en: "Career", zh: "职业" },
  { anchor: "growth", en: "Growth", zh: "成长" },
  { anchor: "relationships", en: "Relationships", zh: "关系" },
  { anchor: "offer-full", en: "Unlock", zh: "解锁" },
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

function resolveVisibleModuleLabels(locale: Locale, modulesAllowed: string[] = []) {
  const labelMap: Record<string, { zh: string; en: string }> = {
    core_free: { zh: "结果摘要", en: "Result summary" },
    core_full: { zh: "完整人格判读", en: "Full personality reading" },
    career: { zh: "职业映射", en: "Career mapping" },
    relationships: { zh: "关系映射", en: "Relationship mapping" },
  };

  const normalized = modulesAllowed
    .map((item) => normalizeText(item).toLowerCase())
    .filter(Boolean)
    .map((item) => labelMap[item]?.[locale] ?? item);

  return Array.from(new Set(normalized));
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
  historyHref,
  retakeHref,
  primaryCtaLabel,
  primaryCtaHref,
  primaryCtaIsInternal = false,
  onShare,
}: MbtiStickyRailProps) {
  const [activeAnchor, setActiveAnchor] = useState("hero");
  const unlockSummary = resolveUnlockSummary(locale, locked, accessLevel, variant, modulesAllowed);
  const ctaLabel = resolvePrimaryCtaLabel(locale, primaryCtaLabel);
  const visibleModuleLabels = resolveVisibleModuleLabels(locale, modulesAllowed);

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.anchor);
    const updateFromViewport = () => {
      let next = sectionIds[0];
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;
        const top = element.getBoundingClientRect().top;
        if (top <= 180) {
          next = id;
        }
      }
      setActiveAnchor(window.location.hash.replace("#", "") || next);
    };

    updateFromViewport();
    window.addEventListener("hashchange", updateFromViewport);
    window.addEventListener("scroll", updateFromViewport, { passive: true });

    return () => {
      window.removeEventListener("hashchange", updateFromViewport);
      window.removeEventListener("scroll", updateFromViewport);
    };
  }, []);

  return (
    <aside data-testid="mbti-sticky-rail" className="hidden xl:block xl:sticky xl:top-24">
      <div className="space-y-4">
        <Card className="border-slate-200 bg-white/94 shadow-[0_20px_40px_rgba(15,23,42,0.08)] backdrop-blur">
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

      <Card className="border-slate-200 bg-white/94 shadow-[0_18px_34px_rgba(15,23,42,0.07)] backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">{locale === "zh" ? "章节导航" : "Report sections"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.anchor}
                href={`#${item.anchor}`}
                aria-current={activeAnchor === item.anchor ? "location" : undefined}
                className={`block rounded-xl px-3 py-2 text-sm font-medium transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                  activeAnchor === item.anchor
                    ? "bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.16)]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                {item[locale]}
              </a>
            ))}
          </CardContent>
        </Card>

      <Card className="border-slate-200 bg-white/94 shadow-[0_18px_34px_rgba(15,23,42,0.07)] backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-900">{locale === "zh" ? "内容与动作" : "Report actions"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="m-0 text-sm font-semibold text-slate-900">{unlockSummary.title}</p>
            <p className="m-0 text-sm leading-7 text-slate-600">{unlockSummary.description}</p>
            {visibleModuleLabels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {visibleModuleLabels.map((item) => (
                  <span
                    key={item}
                    className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
            {primaryCtaIsInternal ? (
              <Link
                href={primaryCtaHref}
                className={buttonVariants({
                  className:
                    "w-full transition duration-200 motion-reduce:transition-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-emerald-300 active:translate-y-0",
                })}
              >
                {ctaLabel}
              </Link>
            ) : (
              <a
                href={primaryCtaHref}
                className={buttonVariants({
                  className:
                    "w-full transition duration-200 motion-reduce:transition-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-emerald-300 active:translate-y-0",
                })}
              >
                {ctaLabel}
              </a>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 transition duration-200 motion-reduce:transition-none hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-300"
                onClick={() => void onShare()}
              >
                {locale === "zh" ? "分享" : "Share"}
              </Button>
              <Link
                href={retakeHref}
                className={buttonVariants({
                  variant: "outline",
                  className:
                    "flex-1 transition duration-200 motion-reduce:transition-none hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-300",
                })}
              >
                {locale === "zh" ? "重测" : "Retake"}
              </Link>
            </div>
            {historyHref ? (
              <Link
                href={historyHref}
                className={buttonVariants({
                  variant: "ghost",
                  className:
                    "w-full justify-start rounded-2xl border border-dashed border-slate-200 px-4 text-slate-700 transition duration-200 motion-reduce:transition-none hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-300",
                })}
              >
                {locale === "zh" ? "查看历史记录与已购结果" : "View history and unlocked results"}
              </Link>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
