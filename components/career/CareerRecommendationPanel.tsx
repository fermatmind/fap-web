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
            ? "当前页面已降为 protocol-ready consumer。个性化职业结论正在等待协议化 truth surface，因此这里不会再本地计算分数、解释或风险结论。"
            : "This page now runs as a protocol-ready consumer. Personalized career conclusions are waiting for protocol-backed truth surfaces, so no local scoring, explanation, or risk output is rendered here."}
        </p>
        <p className="m-0 text-slate-600">
          {locale === "zh"
            ? "你仍然可以先查看公域职业内容，并通过 MBTI / RIASEC 入口补全后续 authority 流程。"
            : "You can still browse the public career content and use the MBTI / RIASEC entry points while the authoritative flow is being reconnected."}
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href={localizedPath("/career/tests/riasec", locale)} className={buttonVariants({ size: "sm" })}>
            {locale === "zh" ? "完成 RIASEC 兴趣测试" : "Take the RIASEC test"}
          </Link>
          <Link href={localizedPath("/career", locale)} className={buttonVariants({ size: "sm", variant: "outline" })}>
            {locale === "zh" ? "浏览职业公域页" : "Browse public career pages"}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
