"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import type { ReportRecommendedRead } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MbtiRecommendedReadsSectionProps = {
  locale: Locale;
  reads: ReportRecommendedRead[];
};

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

  return values.map((value) => normalizeText(value)).filter(Boolean);
}

export function MbtiRecommendedReadsSection({ locale, reads }: MbtiRecommendedReadsSectionProps) {
  const impressionTrackedRef = useRef(false);

  useEffect(() => {
    if (reads.length === 0 || impressionTrackedRef.current) return;
    impressionTrackedRef.current = true;

    trackEvent("ui_card_impression", {
      slug: "mbti-result-shell",
      scale_code: "MBTI",
      visual_kind: "recommended_reads",
      locale,
    });
  }, [locale, reads.length]);

  if (reads.length === 0) {
    return null;
  }

  return (
    <section
      data-testid="mbti-recommended-reads"
      className="space-y-4 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
    >
      <div className="space-y-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "延伸阅读" : "Recommended reads"}
        </p>
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-[var(--fm-text)]">
          {locale === "zh" ? "继续往下看，但不打断当前阅读主线" : "Keep reading without breaking the current report flow"}
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {reads.map((read, index) => {
          const tags = normalizeStringArray(read.tags);
          const linkLabel = normalizeText(read.cta, locale === "zh" ? "继续阅读" : "Continue reading");
          const minutes = typeof read.estimated_minutes === "number" ? read.estimated_minutes : null;

          return (
            <Card
              key={normalizeText(read.id, read.title, String(index))}
              data-testid={`mbti-recommended-read-card-${index + 1}`}
              className="border-slate-200 bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.06)]"
            >
              <CardHeader className="space-y-3 pb-3">
                <CardTitle className="text-xl text-slate-900">{read.title}</CardTitle>
                {minutes !== null ? (
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                    {locale === "zh" ? `约 ${minutes} 分钟` : `About ${minutes} min`}
                  </p>
                ) : null}
              </CardHeader>
              <CardContent className="space-y-4">
                {read.desc ? <p className="m-0 text-sm leading-7 text-slate-600">{read.desc}</p> : null}
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                {read.url ? (
                  <a
                    href={read.url}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({ variant: "outline" })}
                    onClick={() => {
                      trackEvent("ui_card_interaction", {
                        slug: "mbti-result-shell",
                        scale_code: "MBTI",
                        visual_kind: "recommended_read_card",
                        interaction: "click",
                        locale,
                      });
                    }}
                  >
                    {linkLabel}
                  </a>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
