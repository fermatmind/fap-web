"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
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
  modulesPreview?: string[];
  historyHref?: string;
  pdfHref?: string;
  pdfReady?: boolean;
  orderLookupHref?: string;
  orderDetailHref?: string;
  relationshipHref?: string;
  retakeHref: string;
  primaryCtaLabel?: string;
  primaryCtaHref: string;
  primaryCtaIsInternal?: boolean;
  shareCtaLabel?: string;
  shareStatusMessage?: string;
  shareDisabled?: boolean;
  onShare: () => void | Promise<void>;
};

type RailLink = {
  anchor: string;
  zh: string;
  en: string;
};

const MAIN_ANCHORS: RailLink[] = [
  { anchor: "traits", zh: "1 Personality Traits", en: "1 Personality Traits" },
  { anchor: "career", zh: "2 Your Career Path", en: "2 Your Career Path" },
  { anchor: "growth", zh: "3 Your Personal Growth", en: "3 Your Personal Growth" },
  { anchor: "relationships", zh: "4 Your Relationships", en: "4 Your Relationships" },
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

function resolveUnlockText(
  locale: Locale,
  locked?: boolean,
  accessLevel?: string,
  variant?: string
) {
  if (locked === true || normalizeText(accessLevel).toLowerCase() === "free" || normalizeText(variant).toLowerCase() === "free") {
    return {
      title: locale === "zh" ? "免费预览中" : "Free preview",
      description:
        locale === "zh"
          ? "完整内容已保留在下方主收口位，当前阶段只显示公开预览。"
          : "Unlockable content remains in the final offer section; this view shows a free preview.",
    };
  }

  return {
    title: locale === "zh" ? "完整访问中" : "Full access",
    description:
      locale === "zh"
        ? "当前为完整解锁状态，章节信息保留在主内容中。"
        : "Full access mode: chapter information stays in the main report flow.",
  };
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

export function MbtiStickyRail({
  locale,
  headline,
  tags,
  locked,
  accessLevel,
  variant,
  modulesAllowed = [],
  modulesPreview = [],
  historyHref,
  pdfHref,
  pdfReady = false,
  orderLookupHref,
  orderDetailHref,
  relationshipHref,
  retakeHref,
  primaryCtaLabel,
  primaryCtaHref,
  primaryCtaIsInternal = false,
  shareCtaLabel,
  shareStatusMessage,
  shareDisabled = false,
  onShare,
}: MbtiStickyRailProps) {
  const [activeAnchor, setActiveAnchor] = useState("traits");
  const unlockSummary = resolveUnlockText(locale, locked, accessLevel, variant);
  const shareLabel = normalizeText(shareCtaLabel, locale === "zh" ? "分享结果" : "Share result");
  const sectionIds = ["hero", ...MAIN_ANCHORS.map((item) => item.anchor), "offer-full", "footer-cta"];
  const visibleModuleLabels = resolveVisibleModuleLabels(
    locale,
    modulesAllowed.filter((item) => normalizeText(item).toLowerCase() !== "core_free").length > 0
      ? modulesAllowed
      : modulesPreview.length > 0
        ? modulesPreview
        : modulesAllowed
  );
  const hasUtilityLinks = Boolean(orderDetailHref || orderLookupHref || relationshipHref || (pdfReady && pdfHref));
  const ctaLabel = normalizeText(primaryCtaLabel) || (locale === "zh" ? "查看完整报告" : "View full report");
  const historyLabel = locale === "zh" ? "结果工作台" : "Result workspace";

  useEffect(() => {
    const sectionNodes = sectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element instanceof HTMLElement);
    const updateFromViewport = () => {
      let next = "traits";
      for (const anchor of sectionIds) {
        const element = document.getElementById(anchor);
        if (!element) {
          continue;
        }

        if (element.getBoundingClientRect().top <= 160) {
          next = anchor === "hero" ? "traits" : anchor;
        }
      }
      setActiveAnchor(next);
    };

    if (sectionNodes.length > 0) {
      updateFromViewport();
    }

    window.addEventListener("scroll", updateFromViewport, { passive: true });
    window.addEventListener("hashchange", updateFromViewport);

    return () => {
      window.removeEventListener("scroll", updateFromViewport);
      window.removeEventListener("hashchange", updateFromViewport);
    };
  }, [sectionIds]);

  return (
    <aside
      data-testid="mbti-sticky-rail"
      className="sticky top-24 hidden xl:block xl:w-[224px]"
    >
      <div className="space-y-4 opacity-60 transition hover:opacity-100">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 rounded-full bg-slate-900/90 text-center text-xs leading-11 font-semibold text-white">
              {normalizeText(headline.typeCode) ? normalizeText(headline.typeCode).slice(0, 1) : "MB"}
            </div>
            <div>
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {locale === "zh" ? "人格类型" : "Type"}
              </p>
              <p className="m-0 text-sm font-semibold text-slate-900">
                {normalizeText(headline.displayName) || normalizeText(headline.typeCode)}
              </p>
              <p className="m-0 text-xs text-slate-500">{headline.typeCode}</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-slate-400">{unlockSummary.title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{unlockSummary.description}</p>
          {headline.supportingLine ? (
            <p className="mt-2 text-xs leading-5 text-slate-500">{headline.supportingLine}</p>
          ) : null}
          {tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_rgba(15,23,42,0.07)]">
          <p className="m-0 border-b border-slate-200 pb-3 text-sm font-semibold text-slate-900">
            {locale === "zh" ? "On this page" : "On this page"}
          </p>
          <div className="mt-3 space-y-1">
            {MAIN_ANCHORS.map((item) => (
              <a
                key={item.anchor}
                href={`#${item.anchor}`}
                aria-current={activeAnchor === item.anchor ? "location" : undefined}
                className={`flex items-center rounded-lg px-3 py-2 text-sm transition ${
                  activeAnchor === item.anchor
                    ? "bg-emerald-50 text-slate-950"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item[locale]}
              </a>
            ))}
            <a
              href="#offer-full"
              className="mt-1 flex items-center rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              {locale === "zh" ? "Offer" : "Offer"}
            </a>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_16px_30px_rgba(15,23,42,0.07)]">
          <p className="m-0 text-sm font-semibold text-slate-900">Tools</p>
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => void onShare()}
              disabled={shareDisabled}
              className="self-start text-sm text-neutral-500 underline underline-offset-2 hover:text-slate-900 disabled:text-slate-300"
            >
              {shareLabel}
            </button>
            <Link href={retakeHref} className="self-start text-sm text-neutral-500 underline underline-offset-2 hover:text-slate-900">
              {locale === "zh" ? "重测" : "Retake"}
            </Link>
            {historyHref ? (
              <Link href={historyHref} className="self-start text-sm text-neutral-500 underline underline-offset-2 hover:text-slate-900">
                {historyLabel}
              </Link>
            ) : null}
            <a
              href={primaryCtaHref}
              className={buttonVariants({
                variant: "outline",
                className:
                  "mt-1 inline-flex w-full justify-center rounded-md border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700",
              })}
            >
              {ctaLabel}
            </a>
          </div>
        </div>

        {(visibleModuleLabels.length > 0 || hasUtilityLinks) ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            {visibleModuleLabels.length > 0 ? (
              <div className="space-y-2">
                {visibleModuleLabels.slice(0, 3).map((item) => (
                  <span
                    key={item}
                    className="inline-flex mr-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
            {shareStatusMessage ? (
              <p className="mt-3 text-xs leading-6 text-emerald-700">{shareStatusMessage}</p>
            ) : null}
            {hasUtilityLinks ? (
              <div className="mt-3 space-y-1 text-xs">
                {pdfReady && pdfHref ? (
                  <a
                    href={pdfHref}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-slate-600 hover:text-slate-900"
                  >
                    {locale === "zh" ? "下载 PDF" : "Download PDF"}
                  </a>
                ) : null}
                {orderDetailHref ? (
                  <Link href={orderDetailHref} className="block text-slate-600 hover:text-slate-900">
                    {locale === "zh" ? "订单详情" : "Order details"}
                  </Link>
                ) : null}
                {orderLookupHref ? (
                  <Link href={orderLookupHref} className="block text-slate-600 hover:text-slate-900">
                    {locale === "zh" ? "订单找回" : "Order lookup"}
                  </Link>
                ) : null}
                {relationshipHref ? (
                  <Link href={relationshipHref} className="block text-slate-600 hover:text-slate-900">
                    {locale === "zh" ? "关系工作台" : "Relationship hub"}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
