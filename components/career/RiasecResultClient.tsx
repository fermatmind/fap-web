"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { readCareerRiasecResult } from "@/lib/career/storage";
import type { CareerRiasecStoredResult } from "@/lib/career/storage";
import { RIASEC_CODES } from "@/lib/career/types";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import { trackEvent } from "@/lib/analytics";

const CODE_LABELS: Record<string, { en: string; zh: string }> = {
  R: { en: "Realistic", zh: "现实型" },
  I: { en: "Investigative", zh: "研究型" },
  A: { en: "Artistic", zh: "艺术型" },
  S: { en: "Social", zh: "社会型" },
  E: { en: "Enterprising", zh: "企业型" },
  C: { en: "Conventional", zh: "常规型" },
};

function buildRadarPoints(scores: Record<string, number>, radius: number, center: number): string {
  return RIASEC_CODES.map((code, index) => {
    const angle = (Math.PI / 180) * (-90 + index * 60);
    const value = Math.max(0, Math.min(100, scores[code] ?? 0));
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");
}

function axisPoint(index: number, radius: number, center: number): { x: number; y: number } {
  const angle = (Math.PI / 180) * (-90 + index * 60);
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

export function RiasecResultClient({ locale }: { locale: Locale }) {
  const [result, setResult] = useState<CareerRiasecStoredResult | null>(null);

  useEffect(() => {
    const loaded = readCareerRiasecResult();
    setResult(loaded);

    if (loaded) {
      trackEvent("career_riasec_result_view", {
        locale,
        primary_code: loaded.primaryCode,
        secondary_code: loaded.secondaryCode,
      });
    }
  }, [locale]);

  const sortedScores = useMemo(() => {
    if (!result) return [];
    return [...RIASEC_CODES]
      .map((code) => ({ code, value: result.scores[code] }))
      .sort((a, b) => b.value - a.value);
  }, [result]);

  if (!result) {
    return (
      <Alert>
        {locale === "zh"
          ? "未找到职业兴趣测试结果，请先完成测试。"
          : "No RIASEC result found. Please complete the test first."}
      </Alert>
    );
  }

  const radarPoints = buildRadarPoints(result.scores, 90, 120);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{locale === "zh" ? "你的 RIASEC 职业兴趣画像" : "Your RIASEC Career Interest Profile"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge>{locale === "zh" ? "主代码" : "Primary"}: {result.primaryCode}</Badge>
            <Badge>{locale === "zh" ? "次代码" : "Secondary"}: {result.secondaryCode}</Badge>
          </div>
          <p className="m-0 text-sm text-slate-700">
            {locale === "zh"
              ? `建议优先探索 ${CODE_LABELS[result.primaryCode]["zh"]} + ${CODE_LABELS[result.secondaryCode]["zh"]} 相关职业路径。`
              : `Prioritize role exploration around ${CODE_LABELS[result.primaryCode]["en"]} + ${CODE_LABELS[result.secondaryCode]["en"]}.`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{locale === "zh" ? "六维雷达" : "Six-dimension radar"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <svg viewBox="0 0 240 240" className="mx-auto h-64 w-64">
            {[30, 60, 90].map((r) => (
              <circle key={r} cx="120" cy="120" r={r} fill="none" stroke="#dbeafe" />
            ))}
            {RIASEC_CODES.map((code, index) => {
              const p = axisPoint(index, 90, 120);
              return <line key={`axis-${code}`} x1="120" y1="120" x2={p.x} y2={p.y} stroke="#cbd5e1" />;
            })}
            <polygon points={radarPoints} fill="rgba(14, 165, 233, 0.25)" stroke="#0284c7" strokeWidth="2" />
            {RIASEC_CODES.map((code, index) => {
              const p = axisPoint(index, 102, 120);
              return (
                <text key={`label-${code}`} x={p.x} y={p.y} textAnchor="middle" fontSize="11" fill="#334155">
                  {code}
                </text>
              );
            })}
          </svg>

          <div className="grid gap-2 md:grid-cols-2">
            {sortedScores.map((item) => (
              <div key={item.code} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <span>{item.code} · {CODE_LABELS[item.code][locale]}</span>
                <strong>{item.value.toFixed(1)}</strong>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Link href={localizedPath("/career/recommendations", locale)} className={buttonVariants({ size: "sm" })}>
          {locale === "zh" ? "查看职业推荐结果" : "View career recommendations"}
        </Link>
        <Link href={localizedPath("/career/tests/riasec", locale)} className={buttonVariants({ size: "sm", variant: "outline" })}>
          {locale === "zh" ? "重新测试" : "Retake test"}
        </Link>
      </div>
    </div>
  );
}
