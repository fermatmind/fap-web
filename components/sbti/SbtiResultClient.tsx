"use client";

import Link from "next/link";
import { useEffect, useMemo, type ReactNode } from "react";
import { SbtiResultIllustrationCard } from "@/components/sbti/result/SbtiResultIllustrationCard";
import { getSbtiIllustration } from "@/components/sbti/result/sbtiIllustrationMap";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { trackEvent } from "@/lib/analytics";
import {
  getSbtiDimensionCards,
  getSbtiDisplayName,
  getSbtiHitCount,
  resolveSbtiResultProfile,
  SBTI_RESULT_DISCLAIMER,
} from "@/lib/sbti/results";
import { clearSbtiState, readSbtiState } from "@/lib/sbti/storage";

function ResultSectionTitle({ children }: { children: ReactNode }) {
  return <CardTitle className="text-lg sm:text-xl">{children}</CardTitle>;
}

export function SbtiResultClient({ locale }: { locale: Locale }) {
  const state = useMemo(() => readSbtiState(), []);
  const result = state?.completedResult ?? null;
  const profile = result ? resolveSbtiResultProfile(result.primaryTypeCode) : null;

  useEffect(() => {
    if (!result || !profile) return;

    trackEvent("view_result", { locale });
    trackEvent("ui_card_impression", {
      slug: "sbti-result",
      visual_kind: "result_summary",
      interaction: profile.code,
      locale,
    });
  }, [locale, profile, result]);

  if (!result || !profile) {
    return <Alert>未找到可用结果，请先完成 SBTI 娱乐版测试后再查看结果。</Alert>;
  }

  const displayName = getSbtiDisplayName(profile);
  const hitCount = getSbtiHitCount(result.scores, profile);
  const dimensions = getSbtiDimensionCards(result.scores, profile);
  const illustration = getSbtiIllustration(profile.code);

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
      <Card className="overflow-hidden border-[var(--fm-border)] bg-[linear-gradient(180deg,#ffffff,rgba(240,249,255,0.92))]">
        <CardContent
          className={[
            "grid gap-5 p-5 sm:p-6 md:items-center",
            illustration ? "md:grid-cols-[minmax(0,1fr)_minmax(220px,260px)]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="space-y-3 text-center md:text-left">
            <p className="m-0 text-sm font-medium text-slate-500">你的性格类型是：</p>
            <div className="space-y-1">
              <h1 className="m-0 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {displayName}
              </h1>
              <p className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{profile.code}</p>
            </div>
            <p className="m-0 text-base leading-7 text-slate-700">{profile.heroTagline}</p>
          </div>
          <SbtiResultIllustrationCard typeCode={profile.code} displayName={displayName} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <ResultSectionTitle>你的主类型</ResultSectionTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="m-0 text-xs uppercase tracking-[0.14em] text-slate-500">匹配度</p>
            <p className="m-0 mt-2 text-3xl font-semibold text-slate-950">{result.matchPercent}%</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="m-0 text-xs uppercase tracking-[0.14em] text-slate-500">命中维度</p>
            <p className="m-0 mt-2 text-3xl font-semibold text-slate-950">{hitCount}/15</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="m-0 text-xs uppercase tracking-[0.14em] text-slate-500">结果状态</p>
            <p className="m-0 mt-2 text-sm font-medium text-slate-800">
              {profile.launchStatus === "launch" ? "首发直出类型" : profile.launchStatus === "rename" ? "安全改名展示" : "内部目录映射"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <ResultSectionTitle>该人格的简单解读</ResultSectionTitle>
        </CardHeader>
        <CardContent>
          <p className="m-0 text-sm leading-7 text-slate-700 sm:text-[15px]">{profile.overview}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <ResultSectionTitle>十五维评分</ResultSectionTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {dimensions.map((dimension) => (
            <div key={dimension.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="m-0 text-xs uppercase tracking-[0.14em] text-slate-400">{dimension.key}</p>
                  <p className="m-0 mt-1 text-base font-semibold text-slate-900">{dimension.nameZh}</p>
                </div>
                <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {dimension.band}
                </span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#f97316,#fb7185)]"
                  style={{ width: `${dimension.score}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-800">{dimension.score}</span>
                <span className="text-xs text-slate-500">{dimension.band === "H" ? "偏高" : dimension.band === "M" ? "中段" : "偏低"}</span>
              </div>
              <p className="m-0 mt-3 text-sm leading-6 text-slate-600">{dimension.oneLiner}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Alert className="border-amber-200 bg-amber-50 text-amber-800">{SBTI_RESULT_DISCLAIMER}</Alert>

      <Card>
        <CardHeader className="space-y-2">
          <ResultSectionTitle>接下来做什么</ResultSectionTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button type="button" onClick={handleRetake} className="w-full sm:w-auto">
            重新测试
          </Button>
          <Link
            href={homeHref}
            className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
            onClick={() =>
              trackEvent("ui_card_interaction", {
                slug: "sbti-result",
                visual_kind: "result_cta",
                interaction: "back_home",
                locale,
              })
            }
          >
            回到首页
          </Link>
          <Link
            href={mbtiHref}
            className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
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
