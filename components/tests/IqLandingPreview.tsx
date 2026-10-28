"use client";

import { useId, useState } from "react";
import type { ReportResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { buildIqResultPresentation } from "@/lib/iq/presentation";

// Synthetic display fixture, never an attempt or scoring input. The Beta fields
// are the backend IqBetaReferenceScore::fromScore output for raw_score=8.
// Keep this separate from the scored bank and do not derive live scores here.
const EXAMPLE_REPORT = {
  schema_version: "iq.report.v1",
  scale_code: "IQ_INTELLIGENCE_QUOTIENT",
  summary: {
    raw_score: 8,
    question_count: 30,
    beta_reference: {
      status: "available",
      source_kind: "designed_reference",
      model_version: "owner30_design_anchors_2026_10_14_v1",
      standard_score: 106,
      display_score: 106,
      percentile: 65.54216970681163,
      production_normed: false,
      population_percentile_eligible: false,
    },
  },
} as unknown as ReportResponse;

function ExampleTile({ count, square = false }: { count: number; square?: boolean }) {
  return <svg viewBox="0 0 96 64" className="w-full max-w-24" aria-hidden="true">
    {Array.from({ length: count }, (_, index) => {
      const x = 48 + (index - (count - 1) / 2) * 20;
      return square
        ? <rect key={index} x={x - 6} y="26" width="12" height="12" fill="currentColor" />
        : <circle key={index} cx={x} cy="32" r="6" fill="none" stroke="currentColor" strokeWidth="2" />;
    })}
  </svg>;
}

export function IqLandingPreview({ locale, scoringHref, limitsHref }: {
  locale: Locale;
  scoringHref?: string;
  limitsHref?: string;
}) {
  const zh = locale === "zh";
  const id = useId();
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const example = buildIqResultPresentation({ locale, reportData: EXAMPLE_REPORT, resultData: null, locked: false });
  const explanation = zh
    ? "按每行数量依次增加1、同一行形状不变的规则，B的3个实心方块补全第二行。再检查各列：上下两格数量相同，形状从空心圆变成实心方块。"
    : "With one more shape in each cell and the shape unchanged within a row, B's three filled squares complete row two. Check the columns too: each pair has the same count, changing from hollow circles to filled squares.";

  return <section data-testid="iq-landing-preview" aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>{zh ? "先试一道，再看看结果" : "Try a sample, then preview your results"}</h2>
    <nav aria-label={zh ? "测试前快速查看" : "Before you start"} className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-sm underline underline-offset-4">
      <a className="inline-flex min-h-11 items-center" href="#iq-sample-question">{zh ? "试一道教学例题" : "Try a sample question"}</a>
      <a className="inline-flex min-h-11 items-center" href="#iq-result-preview">{zh ? "查看结果示例" : "See a sample result"}</a>
      {scoringHref ? <a className="inline-flex min-h-11 items-center" href={scoringHref}>{zh ? "计分怎样算" : "How scoring works"}</a> : null}
      {limitsHref ? <a className="inline-flex min-h-11 items-center" href={limitsHref}>{zh ? "适用范围与限制" : "Uses and limits"}</a> : null}
    </nav>
    <div className="grid min-w-0 gap-8 lg:grid-cols-2">
      <section id="iq-sample-question" className="min-w-0 rounded-2xl border border-[var(--fm-border)] p-5" aria-labelledby={`${id}-sample-title`}>
        <h3 id={`${id}-sample-title`}>{zh ? "哪一项补全第二行？" : "Which option completes row two?"}</h3>
        <p className="text-sm text-[var(--fm-text-muted)]">{zh ? "新造的教学例题，不是正式测评原题，不计分，也不生成测试记录。按每行数量增加、形状不变的规则选择。" : "A new teaching example, separate from the scored test. It is unscored and creates no test record. Choose the option that continues the increasing count and keeps the row's shape."}</p>
        <div className="my-4 grid grid-cols-3 gap-2 text-[var(--fm-text)]" role="img" aria-label={zh ? "第一行依次为1、2、3个空心圆；第二行依次为1、2个实心方块和一个空格。" : "Row one: one, two, three hollow circles. Row two: one, two filled squares, then a missing cell."}>
          {[1, 2, 3, 1, 2, null].map((count, index) => <div key={index} className="flex aspect-[3/2] items-center justify-center rounded-lg bg-[var(--fm-surface-muted)]">
            {count === null ? <span className="text-3xl" aria-hidden="true">?</span> : <ExampleTile count={count} square={index > 2} />}
          </div>)}
        </div>
        <fieldset>
          <legend className="text-sm font-medium">{zh ? "选择一个选项" : "Choose an option"}</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[1, 3, 2, 4].map((count, index) => <label key={count} className="flex min-h-14 cursor-pointer items-center gap-2 rounded-lg border border-[var(--fm-border)] px-3 py-2 text-sm has-[:checked]:border-[var(--fm-accent)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--fm-accent)]">
              <input type="radio" name={`${id}-answer`} value={count} checked={selectedCount === count} onChange={() => setSelectedCount(count)} className="h-4 w-4 shrink-0" />
              <span>{String.fromCharCode(65 + index)} · {count} {zh ? "个实心方块" : count === 1 ? "filled square" : "filled squares"}</span>
            </label>)}
          </div>
        </fieldset>
        <p role="status" className="mt-3 text-sm">
          {selectedCount === null
            ? zh ? "选择后查看反馈；这道例题不估计IQ。" : "Choose an option for feedback. This example does not estimate IQ."
            : selectedCount === 3
              ? zh ? "B符合给定规则。每行从1个、2个增加到3个。" : "B fits the stated rule: each row increases from one to two to three shapes."
              : zh ? "再检查数量：第二行已经有1个、2个，下一格应有几个？" : "Check the counts again: row two already has one, then two. How many come next?"}
        </p>
        <details className="mt-3 rounded-lg bg-[var(--fm-surface-muted)] p-3 text-sm">
          <summary className="min-h-11 cursor-pointer content-center font-medium">{zh ? "查看完整讲解" : "Show the full explanation"}</summary>
          <p>{explanation}</p>
          <p>{zh ? "这只是给定规则的入门练习。熟悉题型不等于一般智力提高，单题也不能判断智力水平。" : "This is an introduction to the stated rule. Familiarity with a question format does not establish increased general intelligence, and one question cannot determine intelligence."}</p>
        </details>
      </section>
      <section id="iq-result-preview" className="min-w-0 rounded-2xl border border-[var(--fm-border)] p-5" aria-labelledby={`${id}-result-title`}>
        <h3 id={`${id}-result-title`}>{zh ? "免费结果示例" : "Sample free result"}</h3>
        <p className="text-sm text-[var(--fm-text-muted)]">{zh ? "以下是虚构的展示示例，不是你的成绩，也不来自真实用户。选择上面的教学例题不会改变这些数字。" : "Illustrative figures only, not your result or a real user's report. Your sample-question choice does not change these numbers."}</p>
        <dl className="my-5 grid grid-cols-2 gap-4" data-testid="iq-synthetic-result-metrics">
          {[
            { label: zh ? "正确题数" : "Correct answers", value: `${example.correct}/${example.total}` },
            { label: zh ? "答题正确率" : "Answer accuracy", value: `${example.percentCorrect?.toFixed(1)}%` },
            { label: zh ? "Beta参考分" : "Beta reference score", value: example.standardScore },
            { label: zh ? "模型参考百分位" : "Model-reference percentile", value: `${example.percentile?.toFixed(2)}%` },
          ].map(metric => <div key={metric.label} className="min-w-0 border-t border-[var(--fm-border)] pt-3">
            <dt className="text-sm text-[var(--fm-text-muted)]">{metric.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums">{metric.value}</dd>
          </div>)}
        </dl>
        <p className="text-sm">{zh ? "26.7%描述答对的比例；106和65.54%来自设计参考模型，不是人口排名、正式IQ或门萨资格。这些指标不能互换。" : "26.7% is the proportion of items answered correctly. The 106 and 65.54% come from a designed reference model, not population rankings, formal IQ or Mensa eligibility. These measures are not interchangeable."}</p>
        <p className="text-sm">{zh ? "实际结果还可查看本次题组表现，并保存TXT或Markdown摘要；参考分仅在合格数据可用时显示。" : "Your actual result also lets you review performance by item group and save a TXT or Markdown summary. Reference scores appear only when eligible data is available."}</p>
        {scoringHref ? <a className="flex min-h-11 w-fit items-center text-sm underline underline-offset-4" href={scoringHref}>{zh ? "阅读计分与结果解释" : "Read the scoring and interpretation details"}</a> : null}
        <a className="mt-3 flex min-h-11 w-fit items-center text-sm underline underline-offset-4" href="#choose-version">{zh ? "返回30题免费测试入口" : "Go to the free 30-question test"}</a>
      </section>
    </div>
  </section>;
}
