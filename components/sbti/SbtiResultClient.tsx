"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultSummary } from "@/components/result/ResultSummary";
import { DimensionBars } from "@/components/result/DimensionBars";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { trackEvent } from "@/lib/analytics";
import { SBTI_ARCHETYPES, SBTI_DIMENSION_DESCRIPTORS } from "@/lib/sbti/results";
import { clearSbtiState, readSbtiState } from "@/lib/sbti/storage";

export function SbtiResultClient({ locale }: { locale: Locale }) {
  const state = useMemo(() => readSbtiState(), []);
  const result = state?.completedResult ?? null;
  const archetype = SBTI_ARCHETYPES.find((item) => item.code === result?.primaryTypeCode) ?? null;

  useEffect(() => {
    if (!result) return;

    trackEvent("view_result", {
      locale,
    });
    trackEvent("ui_card_impression", {
      slug: "sbti-result",
      visual_kind: "result_summary",
      locale,
    });
  }, [locale, result]);

  if (!result || !archetype) {
    return (
      <Alert>
        未找到可用结果，请先完成 SBTI 娱乐版测试。
      </Alert>
    );
  }

  const dimensions = SBTI_DIMENSION_DESCRIPTORS.map((dimension) => ({
    key: dimension.key,
    code: dimension.key,
    label: dimension.label.zh,
    percent: result.scores[dimension.key],
    leftLabel: dimension.leftPole.zh,
    rightLabel: dimension.rightPole.zh,
  }));

  const handleRetake = () => {
    clearSbtiState();
    trackEvent("ui_card_interaction", {
      slug: "sbti-result",
      visual_kind: "result_cta",
      interaction: "retake_sbti",
      locale,
    });
    window.location.href = localizedPath("/fun/sbti", locale);
  };

  const homeHref = localizedPath("/", locale);
  const mbtiHref = localizedPath("/tests/mbti-personality-test-16-personality-types", locale);

  return (
    <div className="space-y-6">
      <Alert className="border-amber-200 bg-amber-50 text-amber-800">
        友情提示：这是一个娱乐化人格画像实验。仅供娱乐，不作诊断、招聘、相亲、医学心理判断或重大人生决策依据。
      </Alert>

      <ResultSummary
        title="你的 SBTI 结果"
        typeCode={`${archetype.name.zh} · ${result.matchPercent}% 匹配`}
        summary={archetype.summary.zh}
      />

      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">{archetype.name.zh}</CardTitle>
          <p className="m-0 text-sm text-slate-600">{archetype.tagline.zh}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="m-0 text-xs uppercase tracking-[0.14em] text-slate-500">匹配度</p>
              <p className="m-0 mt-2 text-3xl font-semibold text-slate-900">{result.matchPercent}%</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2">
              <p className="m-0 text-xs uppercase tracking-[0.14em] text-slate-500">简短解读</p>
              <p className="m-0 mt-2 text-sm leading-7 text-slate-700">{archetype.summary.zh}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="m-0 text-xs uppercase tracking-[0.14em] text-slate-500">友情提示</p>
            <p className="m-0 mt-2 text-sm leading-7 text-slate-700">{archetype.friendshipTip.zh}</p>
          </div>
        </CardContent>
      </Card>

      <DimensionBars
        dimensions={dimensions}
        summaryTitle="15 维画像"
        summaryLabel="娱乐版轮廓"
        summaryValue={archetype.name.zh}
        summaryDescription={archetype.disclaimer.zh}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">接下来做什么</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button type="button" onClick={handleRetake}>
            重测
          </Button>
          <Link
            href={homeHref}
            className={buttonVariants({ variant: "outline" })}
            onClick={() =>
              trackEvent("ui_card_interaction", {
                slug: "sbti-result",
                visual_kind: "result_cta",
                interaction: "back_home",
                locale,
              })
            }
          >
            返回首页
          </Link>
          <Link
            href={mbtiHref}
            className={buttonVariants({ variant: "outline" })}
            onClick={() =>
              trackEvent("ui_card_interaction", {
                slug: "sbti-result",
                visual_kind: "result_cta",
                interaction: "open_formal_mbti",
                locale,
              })
            }
          >
            去正式版 MBTI
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
