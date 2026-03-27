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
      className="space-y-4 rounded-[28px] border border-slate-200 bg-white/92 p-5 shadow-[0_18px_36px_rgba(15,23,42,0.06)] md:p-6"
    >
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

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card, index) => (
          <Card
            key={`${card.title}-${index}`}
            data-testid={`mbti-highlight-card-${index + 1}`}
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
  );
}
