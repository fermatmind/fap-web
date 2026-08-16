"use client";

import Link from "next/link";
import { OfferCard } from "@/components/big5/paywall/OfferCard";
import { PdfDownloadButton } from "@/components/big5/pdf/PdfDownloadButton";
import { SectionRenderer } from "@/components/big5/report/SectionRenderer";
import { SelfUnderstandingDomainBadge } from "@/components/domains/SelfUnderstandingDomainBadge";
import { DimensionBars } from "@/components/result/DimensionBars";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { Big5PublicProjection, OfferPayload } from "@/lib/api/v0_3";
import type { Big5PrivateResultAuthority } from "@/lib/big5/privateResultAuthority";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

type Headline = {
  badge: string;
  typeCode: string;
  displayName: string;
  supportingLine: string;
  summary: string;
  rarity: string;
};

type ReportSection = {
  key?: string;
  title?: string;
  access_level?: string;
  module_code?: string;
  blocks?: Array<Record<string, unknown>>;
  [key: string]: unknown;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function sectionAnchor(sectionKey: unknown): string {
  const normalized = text(sectionKey).replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
  return `big5-section-${normalized || "section"}`;
}

export function Big5ResultShell({
  locale,
  attemptId,
  reportLocked,
  accessProjection,
  headline,
  formSummaryLabel,
  dimensions,
  projection,
  authority,
  normsStatus,
  qualityLevel,
  showPrecisePercentiles = true,
  visibleSections,
  lockedSections,
  recommendedOffers,
}: {
  locale: Locale;
  attemptId: string;
  reportLocked: boolean;
  accessProjection?: AttemptReportAccessView | null;
  headline: Headline;
  formSummaryLabel?: string | null;
  tags: string[];
  dimensions: Array<Record<string, unknown>>;
  projection: Big5PublicProjection | null;
  authority?: Big5PrivateResultAuthority | null;
  normsStatus: string;
  qualityLevel: string;
  showPrecisePercentiles?: boolean;
  visibleSections: ReportSection[];
  lockedSections: ReportSection[];
  recommendedOffers: OfferPayload[];
}) {
  const isZh = locale === "zh";
  const pdfAttemptId = accessProjection?.attemptId ?? attemptId;
  const historyHref = accessProjection?.actions.historyHref ?? localizedPath("/history/big5", locale);
  const compareHref = localizedPath("/history/big5/compare", locale);
  const retakeHref = localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN}/take`, locale);

  return (
    <div
      data-testid="big5-result-shell"
      data-authority-mode={authority?.mode}
      data-source-hash={authority?.source_hash || undefined}
      data-compiled-hash={authority?.compiled_hash || undefined}
      data-public-projection={projection ? "present" : undefined}
      className="space-y-8"
    >
      <SelfUnderstandingDomainBadge locale={locale} />
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-5 p-6 md:p-8">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
              {headline.typeCode || "BIG5"}
            </span>
            {formSummaryLabel ? <span data-testid="big5-form-summary" className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">{formSummaryLabel}</span> : null}
            {qualityLevel ? <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">{isZh ? "质量" : "Quality"} · {qualityLevel.toUpperCase()}</span> : null}
            {normsStatus ? <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">{isZh ? "常模" : "Norms"} · {normsStatus}</span> : null}
          </div>
          {dimensions.length > 0 && showPrecisePercentiles ? <div data-testid="big5-dimensions"><DimensionBars dimensions={dimensions} /></div> : null}
        </CardContent>
      </Card>

      {visibleSections.length > 0 ? (
        <nav aria-label={isZh ? "报告章节" : "Report sections"} className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-4">
          {visibleSections.map((section) => (
            <Link key={`${section.key}-nav`} href={`#${sectionAnchor(section.key)}`} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700">
              {text(section.title) || text(section.key)}
            </Link>
          ))}
        </nav>
      ) : null}

      <div data-testid="big5-sections" className="space-y-4">
        {visibleSections.map((section) => (
          <SectionRenderer
            key={section.key ?? section.title ?? "section"}
            section={section}
            locked={false}
            locale={locale}
            scaleCode="BIG5_OCEAN"
            normsStatus={normsStatus}
            retakeHref={retakeHref}
            showPrecisePercentiles={showPrecisePercentiles}
          />
        ))}
      </div>

      {lockedSections.length > 0 ? (
        <div data-testid="big5-locked-sections" className="space-y-4">
          {lockedSections.map((section) => (
            <SectionRenderer
              key={section.key ?? section.title ?? "locked-section"}
              section={section}
              locked
              locale={locale}
              scaleCode="BIG5_OCEAN"
              ctaLabel={isZh ? "解锁报告" : "Unlock report"}
              normsStatus={normsStatus}
              retakeHref={retakeHref}
              showPrecisePercentiles={showPrecisePercentiles}
            />
          ))}
        </div>
      ) : null}

      <section data-testid="big5-actions-card" className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-5">
        {pdfAttemptId ? <PdfDownloadButton attemptId={pdfAttemptId} locked={reportLocked} accessProjection={accessProjection} locale={locale} /> : null}
        <Link href={historyHref} className={buttonVariants({ variant: "outline" })}>{isZh ? "历史" : "History"}</Link>
        <Link href={compareHref} className={buttonVariants({ variant: "outline" })}>{isZh ? "对比" : "Compare"}</Link>
        <Link href={retakeHref} className={buttonVariants({ variant: "outline" })}>{isZh ? "复测" : "Retake"}</Link>
      </section>

      {recommendedOffers.length > 0 ? (
        <section data-testid="big5-offer-surface" className="grid gap-4 md:grid-cols-2">
          {recommendedOffers.map((offer, index) => (
            <OfferCard key={`${offer.sku ?? offer.title ?? "offer"}-${index}`} offer={offer} locale={locale} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
