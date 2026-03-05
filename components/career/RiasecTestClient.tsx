"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { RIASEC_QUESTIONS, scoreRiasecAnswers, topRiasecCodes } from "@/lib/career/riasec";
import { writeCareerRiasecResult } from "@/lib/career/storage";
import { trackEvent } from "@/lib/analytics";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

const OPTION_VALUES = [1, 2, 3, 4, 5] as const;

function optionLabel(value: number, locale: Locale): string {
  if (locale === "zh") {
    return ["非常不符合", "不太符合", "一般", "比较符合", "非常符合"][value - 1] ?? String(value);
  }
  return ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"][value - 1] ?? String(value);
}

export function RiasecTestClient({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unansweredCount = useMemo(
    () => RIASEC_QUESTIONS.filter((question) => typeof answers[question.id] !== "number").length,
    [answers]
  );

  const progress = Math.round(((RIASEC_QUESTIONS.length - unansweredCount) / RIASEC_QUESTIONS.length) * 100);

  useEffect(() => {
    trackEvent("career_riasec_start", { locale });
  }, [locale]);

  const onSubmit = async () => {
    if (unansweredCount > 0) {
      setError(
        locale === "zh"
          ? `还有 ${unansweredCount} 题未完成，请先答完。`
          : `${unansweredCount} questions are still unanswered.`
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const scores = scoreRiasecAnswers(answers);
      const [primaryCode, secondaryCode] = topRiasecCodes(scores);

      writeCareerRiasecResult({
        version: 1,
        updatedAt: new Date().toISOString(),
        locale,
        scores,
        primaryCode,
        secondaryCode,
      });

      trackEvent("career_riasec_submit", {
        locale,
        answered_count: RIASEC_QUESTIONS.length,
        primary_code: primaryCode,
        secondary_code: secondaryCode,
      });

      router.push(localizedPath("/career/tests/riasec/result", locale));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to submit RIASEC answers.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{locale === "zh" ? "霍兰德职业兴趣测试（RIASEC）" : "Holland Career Interest Test (RIASEC)"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p className="m-0">
            {locale === "zh"
              ? "共 36 题，每题 1-5 分。请按你的真实偏好作答。"
              : "36 questions, 1-5 scale. Answer based on your actual preference."}
          </p>
          <p className="m-0">{locale === "zh" ? "完成进度" : "Progress"}: {progress}%</p>
        </CardContent>
      </Card>

      {error ? <Alert>{error}</Alert> : null}

      <div className="space-y-3">
        {RIASEC_QUESTIONS.map((question, index) => (
          <Card key={question.id}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-base">{index + 1}. {locale === "zh" ? question.text.zh : question.text.en}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {OPTION_VALUES.map((value) => {
                  const checked = answers[question.id] === value;

                  return (
                    <label
                      key={`${question.id}-${value}`}
                      className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${checked ? "border-[var(--fm-accent)] bg-sky-50 text-sky-700" : "border-slate-200 text-slate-600"}`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={value}
                        checked={checked}
                        onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
                        className="sr-only"
                      />
                      {value}. {optionLabel(value, locale)}
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" onClick={onSubmit} disabled={submitting}>
          {submitting
            ? locale === "zh"
              ? "提交中..."
              : "Submitting..."
            : locale === "zh"
              ? "生成职业兴趣结果"
              : "Generate career interest result"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(localizedPath("/career/tests", locale))}
        >
          {locale === "zh" ? "返回职业测试" : "Back to career tests"}
        </Button>
      </div>
    </div>
  );
}
