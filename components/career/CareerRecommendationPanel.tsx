"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { mapCareerJobToRecommendationInput } from "@/lib/career/jobMapper";
import { resolveCareerProfileSnapshot } from "@/lib/career/profileResolver";
import { rankCareerRecommendations } from "@/lib/career/recommendationEngine";
import type { CareerProfileSnapshot, CareerRecommendationResult } from "@/lib/career/types";
import type { LocalizedCareerJob } from "@/lib/content";
import { trackEvent } from "@/lib/analytics";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export function CareerRecommendationPanel({
  locale,
  jobs,
}: {
  locale: Locale;
  jobs: LocalizedCareerJob[];
}) {
  const [profile, setProfile] = useState<CareerProfileSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("career_recommendation_view", { locale });
  }, [locale]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const resolved = await resolveCareerProfileSnapshot();
        if (!active) return;
        setProfile(resolved);
      } catch (cause) {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : "Failed to resolve recommendation profile.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, []);

  const modelJobs = useMemo(() => jobs.map((item) => mapCareerJobToRecommendationInput(item)), [jobs]);

  const results = useMemo<CareerRecommendationResult[]>(() => {
    if (!profile) return [];
    return rankCareerRecommendations({ profile, jobs: modelJobs, locale, topN: 10 });
  }, [profile, modelJobs, locale]);

  const jobMap = useMemo(() => {
    return new Map(jobs.map((item) => [item.slug, item]));
  }, [jobs]);

  const hasRiasec = profile?.sources.riasec === "local";

  return (
    <div className="space-y-4">
      {loading ? (
        <Card>
          <CardContent className="py-6 text-sm text-slate-600">
            {locale === "zh" ? "正在生成你的职业推荐结果..." : "Building your personalized career recommendations..."}
          </CardContent>
        </Card>
      ) : null}

      {error ? <Alert>{error}</Alert> : null}

      {!loading && profile ? (
        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "你的画像输入" : "Your profile inputs"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p className="m-0">MBTI: {profile.mbtiType ?? (locale === "zh" ? "暂无" : "N/A")}</p>
            <p className="m-0">Big5: {profile.sources.big5 === "history" ? (locale === "zh" ? "已接入" : "Connected") : "N/A"}</p>
            <p className="m-0">IQ: {typeof profile.iqScore === "number" ? profile.iqScore.toFixed(1) : "N/A"}</p>
            <p className="m-0">EQ: {typeof profile.eqScore === "number" ? profile.eqScore.toFixed(1) : "N/A"}</p>
            <p className="m-0">RIASEC: {hasRiasec ? (locale === "zh" ? "已完成" : "Completed") : "N/A"}</p>
            {!hasRiasec ? (
              <div className="pt-2">
                <Link href={localizedPath("/career/tests/riasec", locale)} className={buttonVariants({ size: "sm" })}>
                  {locale === "zh" ? "先完成职业兴趣小测" : "Take the RIASEC test first"}
                </Link>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {!loading && profile && results.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {results.map((item, index) => {
            const job = jobMap.get(item.jobSlug);
            if (!job) return null;

            return (
              <Card key={item.jobSlug}>
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg">#{index + 1} {job.title}</CardTitle>
                    <Badge>{item.totalScore.toFixed(1)}</Badge>
                  </div>
                  <p className="m-0 text-sm text-slate-600">{job.summary}</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span>Interest: {item.factors.interest.toFixed(1)}/45</span>
                    <span>MBTI: {item.factors.mbti.toFixed(1)}/20</span>
                    <span>Big5: {item.factors.big5.toFixed(1)}/20</span>
                    <span>IQ/EQ: {item.factors.iqEq.toFixed(1)}/10</span>
                    <span>Market: {item.factors.market.toFixed(1)}/5</span>
                  </div>
                  <p className="m-0"><strong>{locale === "zh" ? "兴趣匹配" : "Interest"}:</strong> {item.why_interest}</p>
                  <p className="m-0"><strong>{locale === "zh" ? "人格匹配" : "Personality"}:</strong> {item.why_personality}</p>
                  <p className="m-0"><strong>{locale === "zh" ? "能力匹配" : "Capability"}:</strong> {item.why_capability}</p>
                  <p className="m-0"><strong>{locale === "zh" ? "风险提示" : "Risk"}:</strong> {item.risks}</p>
                  <div className="flex gap-2 pt-1">
                    <Link
                      href={localizedPath(`/career/jobs/${job.slug}`, locale)}
                      className={buttonVariants({ size: "sm", variant: "outline" })}
                      onClick={() => {
                        trackEvent("career_recommendation_click", {
                          locale,
                          job_slug: job.slug,
                          rank: index + 1,
                          score: item.totalScore,
                        });
                      }}
                    >
                      {locale === "zh" ? "查看职业详情" : "View job profile"}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
