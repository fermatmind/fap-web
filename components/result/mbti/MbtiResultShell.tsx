"use client";

import Link from "next/link";
import { useState } from "react";
import { DimensionBars } from "@/components/result/DimensionBars";
import { MbtiChapterSection } from "@/components/result/mbti/MbtiChapterSection";
import {
  buildDominantTraitItems,
  MbtiDominantTraitsSection,
} from "@/components/result/mbti/MbtiDominantTraitsSection";
import { MbtiMobileChrome } from "@/components/result/mbti/MbtiMobileChrome";
import { MbtiOfferComparisonSection } from "@/components/result/mbti/MbtiOfferComparisonSection";
import { MbtiRecommendedReadsSection } from "@/components/result/mbti/MbtiRecommendedReadsSection";
import { MbtiStickyRail } from "@/components/result/mbti/MbtiStickyRail";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportCta, ReportIdentityLayer, ReportRecommendedRead, ReportResponse } from "@/lib/api/v0_3";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import type {
  HighlightCard,
  MbtiSectionUnlock,
  ReportSection,
  ResolvedOffer,
  RichResultHeadline,
} from "@/components/result/RichResultReport";

type MbtiResultShellProps = {
  locale: Locale;
  scaleCode: "MBTI";
  reportData: ReportResponse;
  headline: RichResultHeadline;
  tags: string[];
  dimensions: Array<Record<string, unknown>>;
  highlights: HighlightCard[];
  sections: ReportSection[];
  sectionUnlocks: Record<string, MbtiSectionUnlock>;
  offers: ResolvedOffer[];
};

const CHAPTER_ORDER = ["career", "growth", "traits", "relationships"] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => normalizeText(value))
    .filter(Boolean);
}

function resolveShareMessages(locale: Locale, shareStatus: "idle" | "copied" | "failed") {
  if (shareStatus === "copied") {
    return locale === "zh" ? "结果链接已复制。" : "Result link copied.";
  }

  if (shareStatus === "failed") {
    return locale === "zh" ? "当前环境不支持自动分享，请手动复制链接。" : "Sharing is unavailable here. Copy the URL manually.";
  }

  return "";
}

function resolvePrimaryCtaLabel(locale: Locale, cta?: ReportCta | null) {
  return normalizeText(cta?.primary_label) || (locale === "zh" ? "查看解锁方案" : "View unlock options");
}

export function MbtiResultShell({
  locale,
  scaleCode,
  reportData,
  headline,
  tags,
  dimensions,
  highlights,
  sections,
  sectionUnlocks,
  offers,
}: MbtiResultShellProps) {
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");
  const retakeHref = localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP[scaleCode]}/take`, locale);
  const payload = asRecord(reportData.report);
  const identityCard = asRecord(payload?.identity_card);
  const profile = asRecord(payload?.profile);
  const layers = asRecord(payload?.layers);
  const identityLayer = (asRecord(layers?.identity) ?? null) as ReportIdentityLayer | null;
  const recommendedReads = Array.isArray(payload?.recommended_reads)
    ? (payload?.recommended_reads as ReportRecommendedRead[])
    : [];
  const cta = (reportData.cta ?? null) as ReportCta | null;
  const primaryCtaLabel = resolvePrimaryCtaLabel(locale, cta);
  const globalTraits = buildDominantTraitItems({
    locale,
    roleCard: asRecord(layers?.role_card) ?? undefined,
    strategyCard: asRecord(layers?.strategy_card) ?? undefined,
    identityLayer,
    identityTags: normalizeStringArray(identityCard?.tags),
    profileKeywords: normalizeStringArray(profile?.keywords),
    fallbackTags: tags,
  });
  const sectionsByKey = new Map(sections.map((section) => [normalizeText(section.key).toLowerCase(), section]));
  const shareMessage = resolveShareMessages(locale, shareStatus);

  async function handleShare() {
    if (typeof window === "undefined") return;

    const shareUrl = window.location.href;
    const shareTitle = locale === "zh" ? "分享我的测试结果" : "Share my result";

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: shareTitle,
          text: shareTitle,
          url: shareUrl,
        });
        setShareStatus("idle");
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus("copied");
        return;
      }
    } catch {
      // Fall through to failed state.
    }

    setShareStatus("failed");
  }

  return (
    <div data-testid="mbti-result-shell" className="relative space-y-6 pb-28 md:space-y-8 xl:pb-0">
      <MbtiMobileChrome locale={locale} retakeHref={retakeHref} primaryCtaLabel={primaryCtaLabel} onShare={handleShare} />

      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-10">
        <div className="space-y-6 md:space-y-8">
          <section
            id="hero"
            data-testid="mbti-hero"
            className="scroll-mt-28 overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-emerald-50/70 to-sky-50 shadow-[0_20px_48px_rgba(15,23,42,0.08)]"
          >
            <div className="space-y-6 p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  {headline.badge}
                </span>
                {(reportData.locked === true || normalizeText(reportData.variant).toLowerCase() === "free") ? (
                  <span className="inline-flex rounded-full border border-white/85 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                    {locale === "zh" ? "免费预览" : "Free preview"}
                  </span>
                ) : null}
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h1 className="m-0 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                      {headline.typeCode}
                      {headline.displayName ? <span className="text-slate-600"> · {headline.displayName}</span> : null}
                    </h1>
                    {headline.supportingLine ? <p className="m-0 text-lg font-medium text-slate-700">{headline.supportingLine}</p> : null}
                    {headline.summary ? <p className="m-0 max-w-3xl whitespace-pre-wrap text-base leading-8 text-slate-700">{headline.summary}</p> : null}
                  </div>

                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex rounded-full border border-white/80 bg-white/90 px-3 py-1 text-sm text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-[0_14px_28px_rgba(15,23,42,0.06)]">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
                    {locale === "zh" ? "阅读入口" : "Reading entry"}
                  </p>
                  <p className="m-0 mt-3 text-3xl font-bold tracking-tight text-slate-950">{headline.typeCode}</p>
                  {headline.rarity ? (
                    <p className="m-0 mt-3 text-sm leading-7 text-slate-600">
                      {locale === "zh" ? "稀有度：" : "Rarity: "}
                      {headline.rarity}
                    </p>
                  ) : null}
                  <a href="#offers" className={buttonVariants({ className: "mt-4 w-full" })}>
                    {locale === "zh" ? "查看解锁方案" : "View unlock options"}
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section
            id="dimensions"
            data-testid="mbti-dimensions"
            className="scroll-mt-28 space-y-4 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
          >
            <div className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
                {locale === "zh" ? "维度概览" : "Dimension overview"}
              </p>
              <h2 className="m-0 text-2xl font-semibold tracking-tight text-[var(--fm-text)]">
                {locale === "zh" ? "先看结果的整体受力方向" : "Start with the overall directional balance"}
              </h2>
            </div>
            <DimensionBars dimensions={dimensions} />
          </section>

          <MbtiDominantTraitsSection
            locale={locale}
            roleCard={asRecord(layers?.role_card) ?? undefined}
            strategyCard={asRecord(layers?.strategy_card) ?? undefined}
            identityLayer={identityLayer}
            identityTags={normalizeStringArray(identityCard?.tags)}
            profileKeywords={normalizeStringArray(profile?.keywords)}
            fallbackTags={tags}
          />

          <section
            id="highlights"
            data-testid="mbti-highlights"
            className="scroll-mt-28 space-y-4 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
          >
            <div className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
                {locale === "zh" ? "高频亮点" : "High-frequency highlights"}
              </p>
              <h2 className="m-0 text-2xl font-semibold tracking-tight text-[var(--fm-text)]">
                {locale === "zh" ? "当前免费结果已经公开的正式亮点" : "The formal highlights already open in the free result"}
              </h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {highlights.map((card, index) => (
                <Card
                  key={`${card.title}-${index}`}
                  className="border-slate-200 bg-white/95 shadow-[0_14px_36px_rgba(15,23,42,0.06)]"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-slate-900">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-slate-700">
                    <p className="m-0 whitespace-pre-wrap leading-7">{card.body}</p>
                    {card.tips.length > 0 ? (
                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3">
                        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                          {locale === "zh" ? "行动提示" : "Action tip"}
                        </p>
                        <ul className="mb-0 mt-2 list-disc space-y-1 pl-4">
                          {card.tips.map((tip) => (
                            <li key={tip}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {CHAPTER_ORDER.map((chapterKey) => {
            const section = sectionsByKey.get(chapterKey);
            if (!section) {
              return null;
            }

            return (
              <MbtiChapterSection
                key={chapterKey}
                locale={locale}
                chapterKey={chapterKey}
                section={section}
                globalTraits={globalTraits}
                unlock={sectionUnlocks[chapterKey] ?? null}
                identityLayer={identityLayer}
              />
            );
          })}

          <MbtiRecommendedReadsSection locale={locale} reads={recommendedReads} />

          <MbtiOfferComparisonSection
            locale={locale}
            offers={offers}
            cta={cta}
            primaryCtaHref={offers.some((offer) => offer.moduleCodes.includes("core_full")) ? "#offer-full" : "#offers"}
          />

          <Card
            id="footer-cta"
            data-testid="mbti-footer-cta"
            className="border-slate-950 bg-slate-950 text-white shadow-[0_22px_52px_rgba(15,23,42,0.22)]"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-white">{locale === "zh" ? "继续阅读或继续行动" : "Keep reading or take the next step"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="m-0 text-sm leading-7 text-slate-300">
                {locale === "zh"
                  ? "页尾只保留三件事：分享结果、重新测试、或者回看当前结果页对应的解锁方案。"
                  : "The footer keeps only three actions: share, retake, or jump back to the unlock options tied to this result page."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="secondary" onClick={() => void handleShare()}>
                  {locale === "zh" ? "分享结果" : "Share result"}
                </Button>
                <Link href={retakeHref} className={buttonVariants({ variant: "outline" })}>
                  {locale === "zh" ? "重新测试" : "Retake test"}
                </Link>
                <a href="#offers" className={buttonVariants({ className: "bg-emerald-500 text-white hover:bg-emerald-600" })}>
                  {primaryCtaLabel}
                </a>
              </div>
              {shareMessage ? <p className="m-0 text-sm text-emerald-200">{shareMessage}</p> : null}
            </CardContent>
          </Card>
        </div>

        <MbtiStickyRail
          locale={locale}
          headline={headline}
          tags={tags}
          locked={reportData.locked}
          accessLevel={reportData.access_level}
          variant={reportData.variant}
          modulesAllowed={Array.isArray(reportData.modules_allowed) ? reportData.modules_allowed : []}
          retakeHref={retakeHref}
          primaryCtaLabel={primaryCtaLabel}
          onShare={handleShare}
        />
      </div>
    </div>
  );
}
