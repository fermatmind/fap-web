"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export function CareerRecommendationPanel({
  locale,
}: {
  locale: Locale;
}) {
  useEffect(() => {
    trackEvent("career_recommendation_view", {
      locale,
      career_data_status: "trust_limited",
    });
  }, [locale]);

  return (
    <Card data-testid="career-personalized-status" data-career-data-status="trust_limited">
      <CardHeader>
        <CardTitle>{locale === "zh" ? "个性化推荐状态" : "Personalized recommendation status"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-700">
        <p className="m-0">
          {locale === "zh"
            ? "个性化职业结论仍在完善中。当前页面不会直接给出本地计算的分数、解释或风险判断。"
            : "Personalized career conclusions are still being refined. This page does not show locally calculated scores, explanations, or risk judgments."}
        </p>
        <p className="m-0 text-slate-600">
          {locale === "zh"
            ? "你可以先浏览公开职业内容，并通过 MBTI / RIASEC 入口补充后续判断所需的信息。"
            : "You can still browse public career content and use the MBTI / RIASEC entry points to add the information needed for later guidance."}
        </p>
        <span className="sr-only" aria-hidden="true">
          protocol-ready consumer; no local scoring, explanation, or risk output
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href={localizedPath("/tests/holland-career-interest-test-riasec", locale)} className={buttonVariants({ size: "sm" })}>
            {locale === "zh" ? "完成 RIASEC 兴趣测试" : "Complete the RIASEC interest test"}
          </Link>
          <Link href={localizedPath("/career", locale)} className={buttonVariants({ size: "sm", variant: "outline" })}>
            {locale === "zh" ? "浏览职业公域页" : "Browse public career pages"}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
