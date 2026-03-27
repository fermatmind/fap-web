"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HighlightCard } from "@/components/result/RichResultReport";
import type { Locale } from "@/lib/i18n/locales";

type MbtiHighlightsSectionProps = {
  locale: Locale;
  cards: HighlightCard[];
};

export function MbtiHighlightsSection({
  locale,
  cards,
}: MbtiHighlightsSectionProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <section
      data-testid="mbti-highlights"
      className="space-y-5 rounded-[28px] border border-slate-200 bg-white/92 p-5 shadow-[0_18px_36px_rgba(15,23,42,0.06)] md:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--fm-accent)]">
            {locale === "zh" ? "结果强化层" : "Result reinforcement"}
          </p>
          <h2 className="m-0 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            {locale === "zh" ? "先抓住这次结果里最稳定的几个亮点" : "Start with the most stable highlights in this result"}
          </h2>
          <p className="m-0 text-sm leading-7 text-slate-600">
            {locale === "zh"
              ? "这部分只保留当前结果已经正式开放的核心亮点，用来帮助你在进入章节前先抓住主要判断方向。"
              : "This section keeps only the currently available highlights so you can anchor the main reading direction before entering the chapters."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
              {locale === "zh" ? "当前亮点数" : "Highlights open now"}
            </p>
            <p className="m-0 mt-2 text-sm font-semibold text-slate-900">
              {locale === "zh" ? `${cards.length} 条核心亮点` : `${cards.length} core highlights`}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {locale === "zh" ? "阅读作用" : "Why this layer matters"}
            </p>
            <p className="m-0 mt-2 text-sm font-semibold text-slate-900">
              {locale === "zh" ? "先定主轴，再进入章节" : "Anchor the main signal before the chapters"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {cards.map((card, index) => (
          <Card
            key={`${card.title}-${index}`}
            data-testid={`mbti-highlight-card-${index + 1}`}
            className={`border-slate-200 bg-white/95 shadow-[0_14px_36px_rgba(15,23,42,0.06)] ${
              index === 0 ? "lg:col-span-2" : ""
            }`}
          >
            <CardHeader className="space-y-3 pb-3">
              <div className="flex items-center justify-between gap-3">
                <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {locale === "zh" ? `亮点 ${index + 1}` : `Highlight ${index + 1}`}
                </p>
                {card.tips.length > 0 ? (
                  <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    {locale === "zh" ? `${card.tips.length} 条行动提示` : `${card.tips.length} action tips`}
                  </span>
                ) : null}
              </div>
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
  );
}
